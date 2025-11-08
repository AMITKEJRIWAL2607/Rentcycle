import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const ownerId = searchParams.get('ownerId')

    // Build where clause
    const where: any = {}

    // Only show available items if not filtering by owner
    if (!ownerId) {
      where.isAvailable = true
    }

    if (ownerId) {
      where.ownerId = ownerId
    }

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive',
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice || maxPrice) {
      where.pricePerDay = {}
      if (minPrice) {
        where.pricePerDay.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.pricePerDay.lte = parseFloat(maxPrice)
      }
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        owner: {
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

    return NextResponse.json({ items: items || [] })
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, category, pricePerDay, location, images, ownerId } = body

    if (!title || !description || !category || !pricePerDay || !location || !ownerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        pricePerDay: parseFloat(pricePerDay),
        location,
        images: images || [],
        ownerId,
        isAvailable: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}

