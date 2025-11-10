import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - prevents static generation during build
export const dynamic = 'force-dynamic'

// GET /api/messages - Fetch messages for a booking or user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')
    const userId = searchParams.get('userId')

    if (!bookingId && !userId) {
      return NextResponse.json(
        { error: 'bookingId or userId is required' },
        { status: 400 }
      )
    }

    let messages

    if (bookingId) {
      // Get all messages for a specific booking
      messages = await prisma.message.findMany({
        where: { bookingId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          booking: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })
    } else if (userId) {
      // Get all conversations for a user (grouped by booking)
      const userBookings = await prisma.booking.findMany({
        where: {
          OR: [
            { renterId: userId },
            { item: { ownerId: userId } },
          ],
        },
        include: {
          item: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          renter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  receiverId: userId,
                  isRead: false,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })

      return NextResponse.json({ conversations: userBookings })
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, senderId, receiverId, content } = body

    if (!bookingId || !senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify booking exists and user is authorized
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        item: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify sender is either the renter or owner
    const isRenter = booking.renterId === senderId
    const isOwner = booking.item.ownerId === senderId

    if (!isRenter && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to send message for this booking' },
        { status: 403 }
      )
    }

    // Verify receiver is the other party
    const expectedReceiverId = isRenter ? booking.item.ownerId : booking.renterId

    if (receiverId !== expectedReceiverId) {
      return NextResponse.json(
        { error: 'Invalid receiver' },
        { status: 400 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        bookingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Update booking's updatedAt to sort conversations
    await prisma.booking.update({
      where: { id: bookingId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, userId } = body

    if (!bookingId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mark all messages in this booking as read for this user
    await prisma.message.updateMany({
      where: {
        bookingId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}

