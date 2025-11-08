# GitHub Repository Setup Guide

## Quick Setup Steps

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in the details:
   - **Repository name:** `rentcycle` (or your preferred name)
   - **Description:** "Peer-to-peer rental marketplace built with Next.js"
   - **Visibility:** Public or Private (your choice)
   - **⚠️ DO NOT** check "Initialize with README" (we already have files)
   - **⚠️ DO NOT** add .gitignore or license (we already have these)
4. Click **"Create repository"**

### Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rentcycle.git

# Push your code
git push -u origin master
```

Or if you're using SSH:

```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/rentcycle.git

# Push your code
git push -u origin master
```

### Step 3: Verify

After pushing, verify the remote is set:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/rentcycle.git (fetch)
origin  https://github.com/YOUR_USERNAME/rentcycle.git (push)
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Create repository and push in one command
gh repo create rentcycle --public --source=. --remote=origin --push
```

## Troubleshooting

### Issue: "remote origin already exists"
**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/rentcycle.git
```

### Issue: Authentication required
**Solution:**
- Use a Personal Access Token instead of password
- Or set up SSH keys for authentication
- See: https://docs.github.com/en/authentication

### Issue: Branch name is "main" instead of "master"
**Solution:**
```bash
# Rename branch to main (if needed)
git branch -M main

# Push to main
git push -u origin main
```

## Next Steps

After pushing to GitHub:
1. Your code is now on GitHub
2. You can deploy to Vercel by importing from GitHub
3. See `VERCEL_DEPLOYMENT_GUIDE.md` for deployment instructions

