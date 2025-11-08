# Environment Variables Setup

## Required Environment Variables

Add these to your `.env` file in the project root:

```env
# Database Connection (Required)
DATABASE_URL=your-supabase-database-url-here

# NextAuth Configuration (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional - only if using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes(-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})))

# On macOS/Linux:
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## After Adding Variables

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Verify the setup by checking the terminal for any errors.

## Current Status

- ✅ DATABASE_URL: Configured
- ❌ NEXTAUTH_SECRET: Missing - **REQUIRED**
- ❌ NEXTAUTH_URL: Missing - **REQUIRED**
- ⚠️ GOOGLE_CLIENT_ID: Optional
- ⚠️ GOOGLE_CLIENT_SECRET: Optional

