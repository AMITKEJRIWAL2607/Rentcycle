# Setting Up Rentcycle with Supabase

## Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the project details:
   - **Name**: `rentcycle` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Select **Free** (more than enough for development)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be set up

## Step 3: Get Your Database Connection String

1. Once your project is ready, go to **Project Settings** (gear icon in the left sidebar)
2. Click on **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. Select the **"URI"** tab
5. Copy the connection string (it will look like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

## Step 4: Update Your .env File

1. In your Rentcycle project root, create or edit the `.env` file
2. Add the connection string, replacing `[YOUR-PASSWORD]` with the password you created:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   ```
   
   **Important**: 
   - Replace `YOUR_ACTUAL_PASSWORD` with the password you set when creating the project
   - The connection string should NOT have square brackets `[]` around the password
   - Make sure to use the full connection string from Supabase

## Step 5: Update the Database Name (Optional)

Supabase uses the default database `postgres`, but if you want to use a specific database name:

1. Go to Supabase SQL Editor
2. Run: `CREATE DATABASE rentcycle;`
3. Update your connection string to use `rentcycle` instead of `postgres`

Or you can keep using `postgres` - both work fine!

## Step 6: Run the Migration

1. Open your terminal in the Rentcycle project directory
2. Run:
   ```bash
   npm run db:migrate
   ```
3. When prompted for a migration name, type: `init` (or press Enter for the default)
4. The migration will create all your tables (users, items, bookings)

## Step 7: Verify Setup

1. Run Prisma Studio to view your database:
   ```bash
   npm run db:studio
   ```
2. This opens a browser at http://localhost:5555
3. You should see your `users`, `items`, and `bookings` tables

## Troubleshooting

### Connection Error
- Double-check your password in the connection string
- Make sure there are no extra spaces or quotes
- Verify your Supabase project is active (not paused)

### Migration Fails
- Check that your `.env` file is in the root directory
- Ensure the connection string is correct
- Try running `npx prisma generate` first, then `npm run db:migrate`

### Can't Find .env File
- Create it manually in the project root
- Make sure it's named exactly `.env` (not `.env.txt` or anything else)

## Next Steps

Once your database is set up:
- Your app can now connect to Supabase
- All Prisma queries will work with your Supabase database
- You can view/manage data in Supabase Dashboard or Prisma Studio

## Useful Links

- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs
- Prisma + Supabase: https://supabase.com/docs/guides/integrations/prisma


