import { NextResponse } from 'next/server'
import { getOrCreateDemoUser } from '@/lib/demo-user'

// Force this route to be dynamic - prevents Next.js from trying to pre-render it during build
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * API route to get or create demo user
 * Used in demo mode when no authenticated session exists
 * This route is marked as dynamic to prevent static generation during build
 */
export async function GET() {
  try {
    const demoUser = await getOrCreateDemoUser()
    return NextResponse.json({ 
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name 
    })
  } catch (error: any) {
    console.error('Error getting demo user:', error)
    // Provide more specific error message for database connection issues
    if (error?.code === 'P1001' || error?.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { error: 'Database connection unavailable. Please check your DATABASE_URL and ensure the database is accessible.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to get demo user' },
      { status: 500 }
    )
  }
}

