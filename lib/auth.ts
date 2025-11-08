// This file exports the auth configuration
// The actual NextAuth initialization happens in app/api/auth/[...nextauth]/route.ts
// This is kept for potential future use with middleware or server-side auth checks

import type { NextAuthConfig } from 'next-auth'

// Re-export auth helpers from the route
export { auth, signIn, signOut } from '@/app/api/auth/[...nextauth]/route'

