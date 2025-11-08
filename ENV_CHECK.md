# How to Verify Your .env File

## Check Your .env File

1. **Make sure the file is named exactly `.env`** (not `.env.txt` or anything else)
2. **Location**: It should be in the root of your project (same folder as `package.json`)

## Correct Format

Your `.env` file should contain:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

## Common Issues

### Issue 1: Wrong Format
❌ Wrong:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydb
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
DATABASE_URL='postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres'
```

✅ Correct:
```env
DATABASE_URL="postgresql://postgres:your_actual_password@db.xxxxx.supabase.co:5432/postgres"
```

### Issue 2: Password with Special Characters
If your password has special characters like `@`, `#`, `%`, etc., you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`

### Issue 3: Multiple DATABASE_URL entries
Make sure you only have ONE `DATABASE_URL` line in your `.env` file.

## How to Get Your Supabase Connection String

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** (gear icon) → **Database**
4. Scroll to **Connection string** section
5. Select the **URI** tab
6. Copy the connection string
7. Replace `[YOUR-PASSWORD]` with your actual database password

## Verify It's Working

After updating your `.env` file:
1. Save the file
2. Close and reopen your terminal (important!)
3. Run: `npm run db:migrate`

If it still doesn't work, check:
- No extra spaces before/after the connection string
- Password is correct (the one you set when creating the Supabase project)
- Your Supabase project is not paused


