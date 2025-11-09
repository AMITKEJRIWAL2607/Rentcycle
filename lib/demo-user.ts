import { prisma } from './prisma'

const DEMO_USER_EMAIL = 'demo@rentcycle.com'

/**
 * Gets or creates a demo user for demo mode
 * This allows the app to function without authentication
 * This function should ONLY be called at runtime in API routes, never during build
 */
export async function getOrCreateDemoUser() {
  try {
    // Try to find existing demo user
    let demoUser = await prisma.user.findUnique({
      where: { email: DEMO_USER_EMAIL },
    })

    // Create demo user if it doesn't exist
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          name: 'Demo User',
          email: DEMO_USER_EMAIL,
          image: 'https://i.pravatar.cc/150?img=68',
        },
      })
    }

    return demoUser
  } catch (error: any) {
    // Handle connection errors gracefully
    // If this is a connection error, it might be during build or database unavailable
    if (error?.code === 'P1001' || error?.message?.includes("Can't reach database")) {
      console.warn('Database connection error in getOrCreateDemoUser - this should only happen at runtime:', error.message)
      // Re-throw so the API route can handle it properly
      throw new Error('Database connection unavailable - please ensure DATABASE_URL is set and database is accessible')
    }
    console.error('Error getting/creating demo user:', error)
    throw error
  }
}

/**
 * Gets the demo user ID (for use in API routes)
 */
export async function getDemoUserId(): Promise<string> {
  const demoUser = await getOrCreateDemoUser()
  return demoUser.id
}

