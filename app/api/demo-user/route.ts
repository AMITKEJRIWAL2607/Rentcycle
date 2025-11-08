import { NextResponse } from 'next/server'
import { getOrCreateDemoUser } from '@/lib/demo-user'

/**
 * API route to get or create demo user
 * Used in demo mode when no authenticated session exists
 */
export async function GET() {
  try {
    const demoUser = await getOrCreateDemoUser()
    return NextResponse.json({ 
      userId: demoUser.id,
      email: demoUser.email,
      name: demoUser.name 
    })
  } catch (error) {
    console.error('Error getting demo user:', error)
    return NextResponse.json(
      { error: 'Failed to get demo user' },
      { status: 500 }
    )
  }
}

