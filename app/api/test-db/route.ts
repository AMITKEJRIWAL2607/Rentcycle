import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint to diagnose database connection issues
 * Visit /api/test-db to check:
 * - If DATABASE_URL is set
 * - If database connection works
 * - How many users and items exist
 * - Sample item data
 */
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    const databaseUrlPreview = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
      : 'Not set'
    
    // Test database connection with a simple query
    const userCount = await prisma.user.count()
    const itemCount = await prisma.item.count()
    
    // Get a sample item to check if items have images
    const sampleItem = await prisma.item.findFirst({
      select: {
        id: true,
        title: true,
        images: true,
        category: true,
        pricePerDay: true,
        location: true,
        isAvailable: true,
      },
    })
    
    // Get all items to check their image URLs
    const allItems = await prisma.item.findMany({
      select: {
        id: true,
        title: true,
        images: true,
      },
      take: 5, // Just get first 5 for sample
    })
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        urlSet: hasDatabaseUrl,
        urlPreview: databaseUrlPreview,
      },
      counts: {
        users: userCount,
        items: itemCount,
      },
      sampleItem: sampleItem ? {
        id: sampleItem.id,
        title: sampleItem.title,
        category: sampleItem.category,
        pricePerDay: sampleItem.pricePerDay,
        location: sampleItem.location,
        isAvailable: sampleItem.isAvailable,
        hasImages: sampleItem.images && sampleItem.images.length > 0,
        imageCount: sampleItem.images?.length || 0,
        firstImage: sampleItem.images?.[0] || null,
        allImages: sampleItem.images || [],
      } : null,
      sampleItems: allItems.map(item => ({
        id: item.id,
        title: item.title,
        hasImages: item.images && item.images.length > 0,
        imageCount: item.images?.length || 0,
        firstImage: item.images?.[0] || null,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN_ERROR',
        name: error?.name || 'Error',
      },
      database: {
        connected: false,
        urlSet: !!process.env.DATABASE_URL,
        urlPreview: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
          : 'Not set',
      },
    }, { status: 500 })
  }
}

