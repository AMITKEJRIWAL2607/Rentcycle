# Vercel Deployment Guide for Rentcycle

## 🚀 Complete Step-by-Step Deployment Instructions

This guide will walk you through deploying your Rentcycle app to Vercel.

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub Account** - Your code should be in a GitHub repository
2. ✅ **Vercel Account** - Sign up at https://vercel.com
3. ✅ **Supabase Database** - Production database set up
4. ✅ **UploadThing Account** - For image uploads
5. ✅ **Google OAuth** (optional) - If using Google sign-in

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

### 1.2 Verify Build Works Locally

```bash
npm run build
```

If the build succeeds, you're ready to deploy!

---

## 🌐 Step 2: Set Up Vercel Account

1. **Go to Vercel:** https://vercel.com
2. **Sign up** with GitHub (recommended for easy integration)
3. **Authorize** Vercel to access your GitHub repositories

---

## 📦 Step 3: Deploy Your Project

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Import Project:**
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub account
   - Find and select **"Rentcycle"** repository
   - Click **"Import"**

2. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

3. **Add Environment Variables:**
   - Scroll down to **"Environment Variables"**
   - Add all required variables (see list below)
   - Click **"Add"** for each variable

4. **Deploy:**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? rentcycle (or your preferred name)
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## 🔐 Step 4: Environment Variables

### Required Environment Variables

Add these in the Vercel Dashboard under **Settings → Environment Variables**:

#### 1. **DATABASE_URL** (Required)
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public
```
- Get from: Supabase Dashboard → Settings → Database → Connection string
- **Important:** Use your production database URL
- Make sure password is URL-encoded if it contains special characters

#### 2. **NEXTAUTH_URL** (Required)
```
https://your-project.vercel.app
```
- Replace `your-project` with your actual Vercel domain
- Vercel will provide this after first deployment
- Format: `https://your-app-name.vercel.app`

#### 3. **NEXTAUTH_SECRET** (Required)
```
your-secret-key-here
```
- Generate with: `openssl rand -base64 32`
- Or use: https://generate-secret.vercel.app/32
- **Keep this secret!** Don't share it publicly

#### 4. **AUTH_SECRET** (Optional - NextAuth v5)
```
your-secret-key-here
```
- Can be same as NEXTAUTH_SECRET
- Used by NextAuth v5 beta

#### 5. **UPLOADTHING_TOKEN** (Required for image uploads)
```
your-uploadthing-token
```
- Get from: UploadThing Dashboard → API Keys
- Required for image upload functionality

#### 6. **GOOGLE_CLIENT_ID** (Optional)
```
your-google-client-id
```
- Only needed if using Google OAuth
- Get from: Google Cloud Console

#### 7. **GOOGLE_CLIENT_SECRET** (Optional)
```
your-google-client-secret
```
- Only needed if using Google OAuth
- Get from: Google Cloud Console

#### 8. **NODE_ENV** (Auto-set by Vercel)
```
production
```
- Automatically set by Vercel
- Don't need to set manually

---

## 📝 Complete Environment Variables List

Copy this list and fill in your values:

```
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=public
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_SECRET=generate-with-openssl-rand-base64-32
UPLOADTHING_TOKEN=your-uploadthing-token
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
```

---

## 🗄️ Step 5: Database Setup

### 5.1 Production Database

1. **Use Supabase Production Database:**
   - Your existing Supabase database should work
   - Or create a new Supabase project for production

2. **Run Migrations:**
   ```bash
   # Set DATABASE_URL to production URL
   export DATABASE_URL="your-production-database-url"
   
   # Run migrations
   npx prisma migrate deploy
   ```
   
   Or use Prisma Studio:
   ```bash
   npx prisma db push
   ```

3. **Seed Production Database (Optional):**
   ```bash
   npm run seed
   ```
   **⚠️ Warning:** Only seed if you want dummy data in production!

### 5.2 Verify Database Connection

After deployment, check Vercel logs:
1. Go to Vercel Dashboard
2. Click your project
3. Go to **"Deployments"** tab
4. Click latest deployment
5. Check **"Logs"** for any database errors

---

## 🖼️ Step 6: Configure Image Domains

Your `next.config.js` is already configured with:
- `images.unsplash.com` - For seed images
- `i.pravatar.cc` - For user avatars
- `utfs.io` - UploadThing CDN
- `*.uploadthing.com` - UploadThing domains

No additional configuration needed!

---

## 🔄 Step 7: Update OAuth Redirect URLs

### 7.1 Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"Credentials"**
4. Click your OAuth 2.0 Client ID
5. Add authorized redirect URI:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
6. Click **"Save"**

### 7.2 UploadThing (if using)

1. Go to UploadThing Dashboard
2. Update allowed domains:
   ```
   your-app.vercel.app
   ```

---

## ✅ Step 8: Verify Deployment

### 8.1 Check Deployment Status

1. Go to Vercel Dashboard
2. Check deployment status (should be ✅ Ready)
3. Click **"Visit"** to open your app

### 8.2 Test Your App

1. **Homepage:** Should load without errors
2. **Browse Items:** Should show items from database
3. **Dashboard:** Should be accessible (demo mode)
4. **List Item:** Should work (uses demo user)
5. **Image Upload:** Should work with UploadThing
6. **Booking:** Should create bookings
7. **Messages:** Should send/receive messages

### 8.3 Check Logs

1. Vercel Dashboard → Your Project → **"Logs"**
2. Look for any errors
3. Common issues:
   - Database connection errors
   - Missing environment variables
   - Build errors

---

## 🔍 Step 9: Troubleshooting

### Issue: Build Fails

**Error:** "Module not found" or "Cannot find module"
**Solution:**
- Check `package.json` dependencies
- Ensure `postinstall` script runs `prisma generate`
- Check Vercel build logs for specific errors

### Issue: Database Connection Error

**Error:** "Can't reach database server"
**Solution:**
- Verify `DATABASE_URL` is correct in Vercel
- Check Supabase database is not paused
- Verify database allows connections from Vercel IPs
- Check password is URL-encoded correctly

### Issue: Images Not Loading

**Error:** Images show as broken
**Solution:**
- Check `next.config.js` has correct image domains
- Verify UploadThing token is set
- Check image URLs are correct in database

### Issue: Authentication Not Working

**Error:** "Invalid credentials" or redirect loops
**Solution:**
- Verify `NEXTAUTH_URL` matches your Vercel domain
- Check `NEXTAUTH_SECRET` is set
- Verify Google OAuth redirect URLs are updated
- Clear browser cache and cookies

### Issue: UploadThing Not Working

**Error:** "Unauthorized" when uploading
**Solution:**
- Verify `UPLOADTHING_TOKEN` is set in Vercel
- Check UploadThing dashboard for API key
- Verify domain is allowed in UploadThing settings

---

## 🔄 Step 10: Post-Deployment

### 10.1 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to use custom domain

### 10.2 Environment Variables per Environment

Vercel allows different env vars for:
- **Production:** `https://your-app.vercel.app`
- **Preview:** Each PR gets a preview URL
- **Development:** Local development

Set environment variables for each:
1. Vercel Dashboard → Settings → Environment Variables
2. Select environment (Production, Preview, Development)
3. Add variables for that environment

### 10.3 Database Migrations

After deployment, run migrations:
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-url"

# Run migrations
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

---

## 📊 Step 11: Monitor Your App

### 11.1 Vercel Analytics

1. Go to Vercel Dashboard → Your Project → **"Analytics"**
2. Enable Vercel Analytics (if desired)
3. View performance metrics

### 11.2 Error Tracking

1. Check Vercel logs regularly
2. Monitor for database connection issues
3. Watch for API errors
4. Check UploadThing usage

### 11.3 Database Monitoring

1. Supabase Dashboard → **"Database"** → **"Connection Pooling"**
2. Monitor query performance
3. Check connection limits
4. Review database usage

---

## 🎯 Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Build works locally (`npm run build`)
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] All environment variables added
- [ ] Database URL set (production)
- [ ] NEXTAUTH_URL set to Vercel domain
- [ ] NEXTAUTH_SECRET generated and added
- [ ] UPLOADTHING_TOKEN added
- [ ] Google OAuth redirect URLs updated (if using)
- [ ] Database migrations run
- [ ] Deployment successful
- [ ] App tested and working
- [ ] Custom domain configured (optional)

---

## 🔐 Security Checklist

- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] Database password is strong
- [ ] Environment variables are not in code
- [ ] `.env` is in `.gitignore`
- [ ] OAuth secrets are secure
- [ ] Database allows only necessary connections
- [ ] HTTPS is enabled (automatic on Vercel)

---

## 📚 Additional Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **NextAuth Deployment:** https://next-auth.js.org/configuration/options

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Vercel Logs:**
   - Dashboard → Project → Deployments → Logs

2. **Check Build Logs:**
   - Look for compilation errors
   - Check for missing dependencies

3. **Verify Environment Variables:**
   - All required variables are set
   - Values are correct
   - No typos or extra spaces

4. **Test Locally:**
   - Reproduce issue locally
   - Check if it's environment-specific

5. **Vercel Support:**
   - https://vercel.com/support
   - Community: https://github.com/vercel/vercel/discussions

---

## ✅ Success!

Once deployed, your app will be available at:
```
https://your-project.vercel.app
```

**Congratulations! Your Rentcycle app is now live! 🎉**

---

## 🔄 Updating Your App

To update your deployed app:

1. **Make changes locally**
2. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Your update message"
   git push origin master
   ```
3. **Vercel automatically deploys** new commits
4. **Check deployment status** in Vercel Dashboard

---

## 📝 Notes

- **Automatic Deployments:** Vercel automatically deploys every push to master
- **Preview Deployments:** Each PR gets a preview URL
- **Rollback:** You can rollback to previous deployments in Vercel Dashboard
- **Environment Variables:** Can be updated without redeploying (restart required)

---

**Your app is ready for production! 🚀**

