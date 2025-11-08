# UploadThing Configuration Fix

## Problem
Getting "Error: Failed to run middleware" when trying to upload images.

## Root Causes
1. UploadThing middleware was using old auth configuration (`getServerSession(authOptions)`)
2. UPLOADTHING_TOKEN may be missing from `.env`

## Fixes Applied

### 1. Updated Middleware (`app/api/uploadthing/core.ts`)

**Before:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
```

**After:**
```typescript
import { auth } from "@/app/api/auth/[...nextauth]/route";

const session = await auth();
```

Now uses the NextAuth v5 `auth()` helper instead of the deprecated `getServerSession()`.

### 2. Environment Variable

Add to your `.env` file:
```env
UPLOADTHING_TOKEN=your-uploadthing-token-here
```

## How to Get UPLOADTHING_TOKEN

1. Go to https://uploadthing.com/dashboard
2. Sign in or create an account
3. Create a new app or select existing app
4. Copy your API token
5. Add to `.env`: `UPLOADTHING_TOKEN=your-token-here`
6. Restart dev server

## Testing

After adding the token and restarting:

1. Go to Dashboard: http://localhost:3000/dashboard
2. Click "List New Item" tab
3. Fill in the form
4. Click "Upload Images"
5. Select image files
6. Should upload successfully

## Expected Result

- ✅ No "Failed to run middleware" error
- ✅ Images upload to UploadThing
- ✅ Image URLs returned and displayed
- ✅ Can remove uploaded images

## Troubleshooting

### Still getting "Failed to run middleware"
- Check that UPLOADTHING_TOKEN is in `.env`
- Verify you're logged in (session exists)
- Restart the dev server after adding token
- Check browser console for detailed errors

### "Unauthorized" error
- Make sure you're logged in
- Check that session is working (visit /dashboard)
- Clear browser cache and cookies
- Try logging out and back in

### Images not uploading
- Verify UPLOADTHING_TOKEN is correct
- Check file size (max 4MB per image)
- Max 10 images at once
- Check UploadThing dashboard for quota/limits

