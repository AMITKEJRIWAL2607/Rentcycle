import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@rentcycle.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@rentcycle.com',
      image: 'https://i.pravatar.cc/150?img=68',
    },
  })
  
  console.log('✅ Demo user ready:', demoUser.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

