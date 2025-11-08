# Database Setup Instructions

## Option 1: Local PostgreSQL Setup

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, remember the password you set for the `postgres` user

2. **Create the database**
   - Open PostgreSQL command line or pgAdmin
   - Run: `CREATE DATABASE rentcycle;`

3. **Create `.env` file in the root directory** with:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/rentcycle?schema=public"
   ```
   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

## Option 2: Cloud PostgreSQL (Recommended for Easy Setup)

### Using Supabase (Free tier available)
1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Project Settings > Database
4. Copy the connection string (URI format)
5. Create `.env` file with:
   ```
   DATABASE_URL="your-supabase-connection-string"
   ```

### Using Neon (Free tier available)
1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy the connection string
5. Create `.env` file with:
   ```
   DATABASE_URL="your-neon-connection-string"
   ```

### Using Railway
1. Go to https://railway.app and create an account
2. Create a new PostgreSQL database
3. Copy the connection string
4. Create `.env` file with:
   ```
   DATABASE_URL="your-railway-connection-string"
   ```

## After Setting Up .env

1. **Run the migration:**
   ```bash
   npm run db:migrate
   ```

2. **The migration will:**
   - Create all database tables (users, items, bookings)
   - Set up all relationships and indexes
   - Generate the Prisma Client

3. **Verify the setup:**
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio at http://localhost:5555 where you can view and manage your database.

## Troubleshooting

- **Connection Error**: Make sure PostgreSQL is running and the connection string is correct
- **Database doesn't exist**: Create it manually with `CREATE DATABASE rentcycle;`
- **Authentication failed**: Check your username and password in the connection string


