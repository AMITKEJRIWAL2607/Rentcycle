// Simple script to test database connection
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    await prisma.$disconnect()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Failed to connect to database:')
    console.error(error.message)
    if (error.message.includes('P1001')) {
      console.error('\n⚠️  Cannot reach database server.')
      console.error('Please check:')
      console.error('1. Your DATABASE_URL in .env file')
      console.error('2. That your Supabase project is active')
      console.error('3. That your password in the connection string is correct')
    }
    process.exit(1)
  }
}

testConnection()


