import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, renterId, startDate, endDate } = body

    if (!itemId || !renterId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        bookings: {
          where: {
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
            OR: [
              {
                startDate: { lte: new Date(endDate) },
                endDate: { gte: new Date(startDate) },
              },
            ],
          },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (!item.isAvailable) {
      return NextResponse.json(
        { error: 'Item is not available' },
        { status: 400 }
      )
    }

    // Check for date conflicts
    if (item.bookings.length > 0) {
      return NextResponse.json(
        { error: 'Item is already booked for selected dates' },
        { status: 400 }
      )
    }

    // Calculate total price
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * item.pricePerDay

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        itemId,
        renterId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        status: 'PENDING',
      },
      include: {
        item: true,
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ownerId = searchParams.get('ownerId')
    const renterId = searchParams.get('renterId')
    const status = searchParams.get('status')

    const where: any = {}

    if (ownerId) {
      where.item = {
        ownerId: ownerId,
      }
    }

    if (renterId) {
      where.renterId = renterId
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        item: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
