# Authentication Setup - Complete Checklist

## ✅ What's Configured

### 1. NextAuth.js Configuration
- ✅ **Prisma Adapter**: Configured in `lib/auth.ts`
- ✅ **Credentials Provider**: Email/password authentication
- ✅ **Google OAuth Provider**: Optional, configured but requires env vars
- ✅ **JWT Session Strategy**: Configured
- ✅ **Session Callbacks**: User ID included in session
- ✅ **Custom Pages**: Login, signup, error pages configured
- ✅ **Debug Mode**: Enabled in development

### 2. Sign-up API Route
- ✅ **Route**: `/api/auth/signup` (POST)
- ✅ **Validation**: Email format, password length (min 6 chars)
- ✅ **Password Hashing**: Using bcrypt with salt rounds of 10
- ✅ **Database Integration**: Creates users in Prisma
- ✅ **Error Handling**: Detailed error messages
- ✅ **Duplicate Check**: Prevents duplicate emails

### 3. Database Schema
- ✅ **User Model**: Has password field for credentials auth
- ✅ **NextAuth Models**: Account, Session, VerificationToken
- ✅ **Relationships**: Properly configured

### 4. Dependencies
- ✅ **bcryptjs**: Installed (^3.0.3)
- ✅ **@auth/prisma-adapter**: Installed (^2.11.1)
- ✅ **next-auth**: Installed (^5.0.0-beta.30)
- ✅ **@prisma/client**: Installed (^6.19.0)

## ⚠️ What Needs to Be Done

### 1. Environment Variables (REQUIRED)

Add these to your `.env` file:

```env
# Required
DATABASE_URL=your-supabase-database-url-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=84qmOIQyoaYpPUlT9zH1iu25sSWEZwe3

# Optional (only if using Google OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generated NEXTAUTH_SECRET**: `84qmOIQyoaYpPUlT9zH1iu25sSWEZwe3`

### 2. Database Setup

Ensure your database schema is synced:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev
```

### 3. Restart Dev Server

After adding environment variables, restart the server:

```bash
npm run dev
```

## 🔍 Testing the Setup

### 1. Test Sign-up
1. Go to http://localhost:3000/signup
2. Fill in the form:
   - Name (optional)
   - Email (required)
   - Password (min 6 characters, required)
   - Confirm Password (required)
3. Click "Sign Up"
4. You should be automatically logged in and redirected to `/dashboard`

### 2. Test Login
1. Go to http://localhost:3000/login
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to `/dashboard`

### 3. Test Protected Routes
1. Try accessing `/dashboard` without logging in
2. You should be redirected to `/login`
3. After logging in, you should be able to access `/dashboard`

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Check your `DATABASE_URL` in `.env`
- Ensure your Supabase project is active
- Verify the database password is correct

### Error: "NEXTAUTH_SECRET is missing"
- Add `NEXTAUTH_SECRET` to your `.env` file
- Use the generated secret: `84qmOIQyoaYpPUlT9zH1iu25sSWEZwe3`
- Restart the dev server

### Error: "Email already exists"
- This means a user with that email already exists
- Try a different email or log in with existing credentials

### Error: "Invalid password"
- Check that you're using the correct password
- Passwords are case-sensitive

## 📝 Code Files

### Key Files:
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/signup/route.ts` - Sign-up API route
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Sign-up page
- `lib/prisma.ts` - Prisma client
- `prisma/schema.prisma` - Database schema

## ✅ Verification Checklist

- [ ] DATABASE_URL is set in `.env`
- [ ] NEXTAUTH_SECRET is set in `.env`
- [ ] NEXTAUTH_URL is set in `.env`
- [ ] Database schema is synced (`npx prisma db push`)
- [ ] Prisma client is generated (`npx prisma generate`)
- [ ] Dev server is running (`npm run dev`)
- [ ] Can create a new user account
- [ ] Can log in with created account
- [ ] Can access protected routes after login
- [ ] Can log out

## 🎉 Success!

Once all the above is complete, users should be able to:
1. ✅ Create accounts with email/password
2. ✅ Log in with their credentials
3. ✅ Access protected routes (dashboard)
4. ✅ Log out
5. ✅ Use Google OAuth (if configured)

