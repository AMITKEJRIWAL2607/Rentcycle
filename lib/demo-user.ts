import { prisma } from './prisma'

const DEMO_USER_EMAIL = 'demo@rentcycle.com'

/**
 * Gets or creates a demo user for demo mode
 * This allows the app to function without authentication
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
  } catch (error) {
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

