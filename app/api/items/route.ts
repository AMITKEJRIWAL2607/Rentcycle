import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - prevents static generation during build
export const dynamic = 'force-dynamic'

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
  } catch (error: any) {
    console.error('Error fetching items:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    
    // Return detailed error information
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN_ERROR'
    
    // Handle specific Prisma errors
    if (errorCode === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Cannot reach database server. Please check DATABASE_URL and ensure the database is accessible.',
          code: errorCode,
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    if (errorCode === 'P1000') {
      return NextResponse.json(
        { 
          error: 'Database authentication failed',
          details: 'Invalid database credentials. Please check DATABASE_URL.',
          code: errorCode,
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    if (errorCode === 'P1003') {
      return NextResponse.json(
        { 
          error: 'Database does not exist',
          details: 'The database specified in DATABASE_URL does not exist.',
          code: errorCode,
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    // Return error details (safe to expose in API responses)
    return NextResponse.json(
      { 
        error: 'Failed to fetch items',
        details: errorMessage,
        code: errorCode,
        // Only include stack in development
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
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
  } catch (error: any) {
    console.error('Error creating item:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    
    // Return detailed error information
    const errorMessage = error?.message || 'Unknown error'
    const errorCode = error?.code || 'UNKNOWN_ERROR'
    
    // Handle specific Prisma errors
    if (errorCode === 'P1001') {
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: 'Cannot reach database server. Please check DATABASE_URL and ensure the database is accessible.',
          code: errorCode,
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    if (errorCode === 'P1000') {
      return NextResponse.json(
        { 
          error: 'Database authentication failed',
          details: 'Invalid database credentials. Please check DATABASE_URL.',
          code: errorCode,
          message: errorMessage,
        },
        { status: 503 }
      )
    }
    
    // Return error details
    return NextResponse.json(
      { 
        error: 'Failed to create item',
        details: errorMessage,
        code: errorCode,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}

