# Git Quick Reference for Rentcycle

## ✅ Current Status
- **Git Repository**: Initialized ✓
- **First Commit**: Created (ce02b19) ✓
- **Files Tracked**: 52 files, 11,549 lines of code ✓

---

## 🔄 Daily Git Workflow

### When You Make Changes

```bash
# 1. Check what files changed
git status

# 2. See the actual changes
git diff

# 3. Add all changed files
git add .

# OR add specific files
git add app/page.tsx components/Header.tsx

# 4. Commit with a descriptive message
git commit -m "Add new feature: user profile page"

# 5. View your commit history
git log --oneline
```

---

## 📝 Good Commit Message Examples

```bash
git commit -m "Fix login bug: handle empty email field"
git commit -m "Add image carousel to item detail page"
git commit -m "Update dashboard UI with new design"
git commit -m "Refactor: extract reusable Button component"
```

---

## 🔍 Useful Commands

### Check Status
```bash
git status              # What files changed?
git log --oneline       # Commit history
git log --oneline -5    # Last 5 commits
```

### View Changes
```bash
git diff                # See all uncommitted changes
git diff app/page.tsx   # See changes in specific file
git diff HEAD~1         # Compare with previous commit
```

### Undo Changes

```bash
# Undo changes in a file (before commit)
git checkout -- app/page.tsx

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes) ⚠️ CAREFUL!
git reset --hard HEAD~1
```

### Branches (For Future Features)

```bash
# Create a new branch for a feature
git branch feature-payments
git checkout feature-payments

# Or do both in one command
git checkout -b feature-payments

# Switch back to main branch
git checkout master

# Merge feature into master
git checkout master
git merge feature-payments
```

---

## 🌐 Optional: Push to GitHub

If you want cloud backup and collaboration features:

### 1. Create GitHub Account
- Go to https://github.com
- Sign up for free

### 2. Create New Repository
- Click "New Repository"
- Name: `rentcycle`
- Choose: Public or Private
- **Don't** initialize with README (you already have one)
- Click "Create repository"

### 3. Push Your Code
```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/rentcycle.git

# Push your code
git branch -M main
git push -u origin main
```

### 4. Future Pushes
```bash
# After making commits
git push
```

---

## 🛡️ What's Protected (Not in Git)

Your `.gitignore` file excludes:
- ✅ `.env` - Your secrets are safe!
- ✅ `node_modules/` - Dependencies (too big)
- ✅ `.next/` - Build files (regenerated)
- ✅ Database files

---

## 📚 Learn More

- **Git Basics**: https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control
- **GitHub Guides**: https://guides.github.com/
- **Interactive Tutorial**: https://learngitbranching.js.org/

---

## 🆘 Common Issues

### "Your branch is ahead of 'origin/main' by X commits"
```bash
# Just push your commits
git push
```

### "Changes not staged for commit"
```bash
# Add and commit your changes
git add .
git commit -m "Your message"
```

### "Merge conflict"
```bash
# Open the conflicted file
# Look for <<<<<<, ======, >>>>>> markers
# Edit to resolve
# Then:
git add .
git commit -m "Resolve merge conflict"
```

### Want to see what a commit changed?
```bash
git show ce02b19
```

---

## 💡 Pro Tips

1. **Commit Often**: Small, frequent commits are better than large ones
2. **Descriptive Messages**: Future you will thank you
3. **Test Before Commit**: Make sure code works
4. **Use Branches**: For experimental features
5. **Push Regularly**: If using GitHub (backup!)

---

## 🎯 Your Current Setup

```
Rentcycle/
├── .git/           ← Your version history
├── .gitignore      ← Files to ignore
├── app/            ← Next.js pages
├── components/     ← React components
├── lib/            ← Utilities
├── prisma/         ← Database schema
└── ...
```

**Remember**: Your code is safe in two places now:
1. 💾 **OneDrive** - Automatic cloud sync
2. 📦 **Git** - Version control history

Happy coding! 🚀

