# NextAuth v5 Beta Configuration Fix

## Problem
Getting "TypeError: r is not a function" when accessing `/api/auth` endpoints.

## Root Cause
NextAuth v5 beta uses different syntax than v4. The old configuration was using v4 syntax with v5 beta, causing initialization errors.

## Solution Applied

### 1. Updated API Route (`app/api/auth/[...nextauth]/route.ts`)

**Before (v4 syntax):**
```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**After (v5 beta syntax):**
```typescript
import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
// ... providers and config

export const authConfig: NextAuthConfig = {
  // configuration here
}

const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

export { handlers, auth, signIn, signOut }
export const { GET, POST } = handlers
```

### 2. Updated lib/auth.ts

Now simply re-exports the auth helpers from the route:
```typescript
export { auth, signIn, signOut } from '@/app/api/auth/[...nextauth]/route'
```

### 3. Key Changes

1. **Configuration Type**: Changed from `NextAuthOptions` to `NextAuthConfig`
2. **Handler Export**: Using `handlers` destructured from `NextAuth()`
3. **Proper Exports**: Exporting GET, POST from handlers
4. **Auth Helpers**: Exporting auth, signIn, signOut for server-side use

## Configuration Details

✅ **Adapter**: PrismaAdapter properly connected
✅ **Providers**: 
   - CredentialsProvider (email/password)
   - GoogleProvider (OAuth)
✅ **Session Strategy**: JWT
✅ **Callbacks**: jwt() and session() configured
✅ **Pages**: Custom login and error pages
✅ **Debug Mode**: Enabled in development

## Testing

1. Restart the dev server:
   ```bash
   npm run dev
   ```

2. Test endpoints:
   - Sign up: http://localhost:3000/signup
   - Login: http://localhost:3000/login
   - Auth endpoints: http://localhost:3000/api/auth/signin

3. Check for errors:
   - Browser console (F12 → Console)
   - Server terminal

## Expected Results

- ✅ No "TypeError: r is not a function"
- ✅ Login and signup work correctly
- ✅ Sessions are maintained
- ✅ Protected routes accessible after auth

## Next Steps

If you still see errors:
1. Check that NEXTAUTH_SECRET is set in `.env`
2. Verify database connection
3. Check server logs for detailed error messages
4. Try creating a test user and logging in

## Additional Notes

- NextAuth v5 is still in beta; some features may change
- The configuration now follows v5 beta patterns
- All authentication functionality should work as expected

