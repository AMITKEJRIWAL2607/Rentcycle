# Database Setup Guide

This project uses Prisma with PostgreSQL as the database.

## Prisma Schema

The schema includes three main models:

### User
- `id`: Unique identifier (CUID)
- `email`: Unique email address
- `name`: Optional user name
- `image`: Optional profile image URL
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Item
- `id`: Unique identifier (CUID)
- `title`: Item title
- `description`: Item description (text)
- `category`: Item category
- `pricePerDay`: Rental price per day
- `location`: Item location
- `images`: Array of image URLs
- `isAvailable`: Availability status
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `ownerId`: Foreign key to User (owner)

### Booking
- `id`: Unique identifier (CUID)
- `startDate`: Booking start date
- `endDate`: Booking end date
- `totalPrice`: Total booking price
- `status`: Booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `itemId`: Foreign key to Item
- `renterId`: Foreign key to User (renter)

## Setup Instructions

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud provider like Supabase, Neon, or Railway

2. **Create a database**
   ```sql
   CREATE DATABASE rentcycle;
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your database connection string:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/rentcycle?schema=public"
   ```
   
   Example for local PostgreSQL:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/rentcycle?schema=public"
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```
   
   This will:
   - Create the database schema
   - Generate the Prisma Client
   - Create migration files in `prisma/migrations`

5. **Generate Prisma Client** (if needed)
   ```bash
   npx prisma generate
   ```

6. **Open Prisma Studio** (optional)
   ```bash
   npx prisma studio
   ```
   This opens a visual database browser at http://localhost:5555

## Useful Commands

- `npx prisma migrate dev` - Create and apply a new migration
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open database browser
- `npx prisma db push` - Push schema changes without migrations (dev only)

## Using Prisma Client

Import the Prisma client in your code:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Get all items
const items = await prisma.item.findMany({
  include: {
    owner: true,
    bookings: true
  }
})
```


