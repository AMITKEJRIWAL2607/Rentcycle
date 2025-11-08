# Git Installation and Setup Guide

## Git is Not Installed

Git needs to be installed before you can save your progress with version control.

## Installation Options

### Option 1: Install Git for Windows (Recommended)

1. **Download Git:**
   - Go to: https://git-scm.com/download/win
   - Download the latest version (64-bit or 32-bit based on your system)

2. **Install Git:**
   - Run the installer
   - **Recommended settings during installation:**
     - ✅ Use Visual Studio Code as Git's default editor (or your preferred editor)
     - ✅ Git from the command line and also from 3rd-party software
     - ✅ Use bundled OpenSSH
     - ✅ Use the OpenSSL library
     - ✅ Checkout Windows-style, commit Unix-style line endings
     - ✅ Use MinTTY (default terminal)
     - ✅ Default (fast-forward or merge)
     - ✅ Git Credential Manager
     - ✅ Enable file system caching
     - ✅ Enable symbolic links

3. **Verify Installation:**
   - Close and reopen your terminal
   - Run: `git --version`
   - Should show something like: `git version 2.x.x`

### Option 2: Install via Winget (if you have it)

```powershell
winget install --id Git.Git -e --source winget
```

### Option 3: Install via Chocolatey (if you have it)

```powershell
choco install git
```

## After Installing Git

Once Git is installed, run these commands:

```bash
# Configure Git with your details
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository in your project
cd C:\Users\amit\OneDrive\Desktop\Rentcycle
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Rentcycle app with authentication and image upload"

# Check status
git status
```

## Alternative: Save Without Git

If you don't want to install Git right now, your project is already backed up by OneDrive:
- ✅ All files sync to OneDrive automatically
- ✅ You can access from any device with OneDrive
- ✅ OneDrive has file history/versioning

However, Git provides better version control with:
- 📝 Detailed commit history
- 🔄 Easy rollback to previous versions
- 🤝 Collaboration features
- 🌐 GitHub integration

## Next Steps After Git Installation

1. **Initialize Git** (I'll help you with this)
2. **Create commits** as you make changes
3. **Optional:** Push to GitHub for cloud backup
4. **Optional:** Set up GitHub Desktop for a GUI interface

Let me know when Git is installed, and I'll help you set up the repository!


