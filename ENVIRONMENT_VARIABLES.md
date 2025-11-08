# Environment Variables for Vercel Deployment

## 📋 Complete List of Environment Variables

Add these environment variables in your Vercel Dashboard under **Settings → Environment Variables**.

---

## 🔴 Required Variables

### 1. DATABASE_URL
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public
```
- **Description:** PostgreSQL database connection string
- **Where to get:** Supabase Dashboard → Settings → Database → Connection string (URI tab)
- **Important:** 
  - Replace `YOUR_PASSWORD` with your actual database password
  - URL-encode special characters in password (@ → %40, # → %23, etc.)
  - Use production database URL, not local

### 2. NEXTAUTH_URL
```
https://your-project.vercel.app
```
- **Description:** Base URL of your application
- **Where to get:** Your Vercel deployment URL (after first deploy)
- **Format:** `https://your-app-name.vercel.app`
- **Important:** 
  - Must match your Vercel domain exactly
  - Use `https://` not `http://`
  - No trailing slash

### 3. NEXTAUTH_SECRET
```
your-generated-secret-here
```
- **Description:** Secret key for NextAuth.js session encryption
- **How to generate:**
  ```bash
  openssl rand -base64 32
  ```
  Or use: https://generate-secret.vercel.app/32
- **Important:** 
  - Must be at least 32 characters
  - Keep it secret! Never commit to Git
  - Use a different secret for production vs development

### 4. AUTH_SECRET (Optional - for NextAuth v5)
```
your-generated-secret-here
```
- **Description:** Alternative secret key for NextAuth v5
- **How to generate:** Same as NEXTAUTH_SECRET
- **Note:** Can be same value as NEXTAUTH_SECRET

### 5. UPLOADTHING_TOKEN
```
your-uploadthing-token
```
- **Description:** API token for UploadThing image upload service
- **Where to get:** UploadThing Dashboard → API Keys
- **Required for:** Image uploads in item listing form

---

## 🟡 Optional Variables

### 6. GOOGLE_CLIENT_ID
```
your-google-client-id.apps.googleusercontent.com
```
- **Description:** Google OAuth Client ID
- **Where to get:** Google Cloud Console → APIs & Services → Credentials
- **Required for:** Google OAuth sign-in
- **Note:** Only needed if using Google authentication

### 7. GOOGLE_CLIENT_SECRET
```
your-google-client-secret
```
- **Description:** Google OAuth Client Secret
- **Where to get:** Google Cloud Console → APIs & Services → Credentials
- **Required for:** Google OAuth sign-in
- **Note:** Only needed if using Google authentication

---

## 📝 Quick Copy-Paste Template

Copy this and fill in your values:

```env
# Database
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=public

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
AUTH_SECRET=generate-with-openssl-rand-base64-32

# UploadThing
UPLOADTHING_TOKEN=your-uploadthing-token

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🔍 How to Add Environment Variables in Vercel

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com
2. Select your project
3. Click **"Settings"** tab
4. Click **"Environment Variables"** in sidebar

### Step 2: Add Variables
1. Click **"Add New"**
2. Enter variable name (e.g., `DATABASE_URL`)
3. Enter variable value
4. Select environments:
   - ✅ Production
   - ✅ Preview (for PR previews)
   - ✅ Development (for local dev)
5. Click **"Save"**

### Step 3: Redeploy
After adding variables, you need to redeploy:
1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

---

## ✅ Verification Checklist

After adding environment variables, verify:

- [ ] `DATABASE_URL` is correct and accessible
- [ ] `NEXTAUTH_URL` matches your Vercel domain
- [ ] `NEXTAUTH_SECRET` is set and strong (32+ characters)
- [ ] `UPLOADTHING_TOKEN` is valid
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set (if using Google OAuth)
- [ ] All variables are added for Production environment
- [ ] App has been redeployed after adding variables

---

## 🚨 Common Issues

### Issue: "Invalid DATABASE_URL"
**Solution:**
- Check password is correct
- URL-encode special characters in password
- Verify database is not paused
- Check connection string format

### Issue: "NEXTAUTH_URL mismatch"
**Solution:**
- Ensure `NEXTAUTH_URL` matches your Vercel domain exactly
- Use `https://` not `http://`
- No trailing slash
- Check both Production and Preview environments

### Issue: "UploadThing unauthorized"
**Solution:**
- Verify `UPLOADTHING_TOKEN` is correct
- Check token is not expired
- Ensure domain is allowed in UploadThing settings

### Issue: "Google OAuth not working"
**Solution:**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check redirect URI is added in Google Cloud Console:
  `https://your-app.vercel.app/api/auth/callback/google`
- Ensure OAuth consent screen is configured

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use different secrets** for development and production
3. **Rotate secrets** regularly
4. **Use strong passwords** for database
5. **Limit database access** to necessary IPs only
6. **Review environment variables** periodically
7. **Use Vercel's environment variable encryption**

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Connection Strings](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [UploadThing Documentation](https://docs.uploadthing.com)

---

**Remember:** After adding environment variables, always redeploy your application for changes to take effect!

