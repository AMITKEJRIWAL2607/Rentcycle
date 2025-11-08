# Authentication Setup Guide

This project uses NextAuth.js v5 (beta) for authentication with email/password and Google OAuth support.

## Environment Variables

Add the following to your `.env` file:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (optional - only if using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Generating NEXTAUTH_SECRET

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env` file

## Database Migration

After updating the Prisma schema, run:

```bash
npm run db:push
```

Or create a migration:

```bash
npm run db:migrate
```

This will create the necessary tables:
- `users` (updated with auth fields)
- `accounts` (OAuth accounts)
- `sessions` (user sessions)
- `verification_tokens` (email verification)

## Features

### Email/Password Authentication
- Users can sign up with email and password
- Passwords are hashed using bcrypt
- Sign in with email/password credentials

### Google OAuth
- One-click sign in with Google
- Automatically creates user account
- Links Google account to user

### Protected Routes
- Dashboard requires authentication
- Automatically redirects to login if not authenticated

### Session Management
- JWT-based sessions
- User information available throughout the app
- Sign out functionality

## Usage

### Sign Up
1. Navigate to `/signup`
2. Fill in name, email, and password
3. Click "Sign Up" or use Google OAuth

### Sign In
1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In" or use Google OAuth

### Accessing User Data

In client components:
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
const userId = session?.user?.id
```

In server components/API routes:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
const userId = session?.user?.id
```

## Troubleshooting

### "NEXTAUTH_SECRET is not set"
- Make sure you've added `NEXTAUTH_SECRET` to your `.env` file
- Restart your development server after adding it

### Google OAuth not working
- Verify your Google Client ID and Secret are correct
- Check that redirect URIs match exactly
- Ensure Google+ API is enabled in Google Cloud Console

### Database errors
- Make sure you've run the database migration
- Check that all NextAuth tables exist in your database

