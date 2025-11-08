import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Clearing existing data...')
  await prisma.message.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.item.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Create dummy users
  console.log('👥 Creating dummy users...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create demo user first (for demo mode)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@rentcycle.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@rentcycle.com',
      image: 'https://i.pravatar.cc/150?img=68',
    },
  })

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPassword,
        image: 'https://i.pravatar.cc/150?img=12',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: hashedPassword,
        image: 'https://i.pravatar.cc/150?img=45',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Mike Chen',
        email: 'mike@example.com',
        password: hashedPassword,
        image: 'https://i.pravatar.cc/150?img=33',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Emily Rodriguez',
        email: 'emily@example.com',
        password: hashedPassword,
        image: 'https://i.pravatar.cc/150?img=47',
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david@example.com',
        password: hashedPassword,
        image: 'https://i.pravatar.cc/150?img=51',
      },
    }),
  ])

  console.log(`✅ Created ${users.length} users`)

  // Dummy items data
  const itemsData = [
    // Outdoor Equipment
    {
      title: 'Professional Camping Tent - 4 Person',
      description: 'Spacious 4-person camping tent with waterproof rainfly and easy setup. Perfect for family camping trips or weekend getaways. Includes carry bag and stakes. Well-maintained and cleaned after each use.',
      category: 'Outdoor Equipment',
      pricePerDay: 25,
      location: 'Seattle, WA',
      images: [
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
      ],
      ownerId: users[0].id,
    },
    {
      title: 'High-Quality Hiking Backpack 65L',
      description: 'Large capacity hiking backpack with multiple compartments and adjustable straps. Ideal for multi-day treks. Features hydration system compatibility and rain cover included.',
      category: 'Outdoor Equipment',
      pricePerDay: 15,
      location: 'Denver, CO',
      images: [
        'https://images.unsplash.com/photo-1622260614927-53f985782ece?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Inflatable Kayak with Paddles',
      description: 'Two-person inflatable kayak, perfect for lakes and calm rivers. Includes two paddles, pump, and repair kit. Easy to transport and store. Great for summer water adventures!',
      category: 'Outdoor Equipment',
      pricePerDay: 35,
      location: 'Austin, TX',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      ],
      ownerId: users[2].id,
    },
    {
      title: 'Portable Camping Stove with Fuel',
      description: 'Compact and reliable camping stove with windscreen. Includes fuel canister. Perfect for cooking meals on camping trips. Easy to use and clean.',
      category: 'Outdoor Equipment',
      pricePerDay: 10,
      location: 'Portland, OR',
      images: [
        'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=800',
      ],
      ownerId: users[3].id,
    },
    {
      title: 'Premium Sleeping Bag - Cold Weather',
      description: 'High-quality cold weather sleeping bag rated for 20°F. Compact, lightweight, and comes with compression sack. Perfect for winter camping or high-altitude adventures.',
      category: 'Outdoor Equipment',
      pricePerDay: 12,
      location: 'Boulder, CO',
      images: [
        'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=800',
      ],
      ownerId: users[4].id,
    },
    {
      title: 'Portable Hammock with Stand',
      description: 'Comfortable portable hammock with collapsible stand. No trees needed! Perfect for camping, backyard, or beach. Includes carrying bag. Sets up in minutes.',
      category: 'Outdoor Equipment',
      pricePerDay: 18,
      location: 'San Diego, CA',
      images: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
      ],
      ownerId: users[0].id,
    },

    // Sports Equipment
    {
      title: 'Mountain Bike - Full Suspension',
      description: 'High-performance mountain bike with full suspension. Perfect for trails and off-road adventures. Regularly maintained, includes helmet. Great condition!',
      category: 'Sports Equipment',
      pricePerDay: 40,
      location: 'Boulder, CO',
      images: [
        'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800',
        'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Stand Up Paddleboard (SUP) with Paddle',
      description: 'Inflatable SUP board perfect for beginners and experienced paddlers. Includes paddle, pump, leash, and backpack. Easy to transport and store.',
      category: 'Sports Equipment',
      pricePerDay: 30,
      location: 'Miami, FL',
      images: [
        'https://images.unsplash.com/photo-1432859810366-6a869a854163?w=800',
      ],
      ownerId: users[2].id,
    },
    {
      title: 'Complete Scuba Diving Gear Set',
      description: 'Full scuba diving equipment including BCD, regulator, wetsuit (M/L), fins, and mask. All equipment recently serviced and in excellent condition. Perfect for certified divers.',
      category: 'Sports Equipment',
      pricePerDay: 60,
      location: 'Honolulu, HI',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
      ],
      ownerId: users[3].id,
    },
    {
      title: 'Tennis Racket Set with Balls',
      description: 'Two professional tennis rackets with a can of new tennis balls. Perfect for a friendly match or practice session. Rackets are well-maintained.',
      category: 'Sports Equipment',
      pricePerDay: 8,
      location: 'New York, NY',
      images: [
        'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
      ],
      ownerId: users[4].id,
    },
    {
      title: 'Snowboard with Boots and Bindings',
      description: 'All-mountain snowboard (156cm) with boots (size 10) and bindings. Great for intermediate to advanced riders. Well-maintained equipment.',
      category: 'Sports Equipment',
      pricePerDay: 45,
      location: 'Lake Tahoe, CA',
      images: [
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
      ],
      ownerId: users[0].id,
    },
    {
      title: 'Golf Club Set with Bag',
      description: 'Complete set of golf clubs including driver, irons, wedges, and putter. Comes with golf bag and tees. Perfect for a weekend round.',
      category: 'Sports Equipment',
      pricePerDay: 35,
      location: 'Scottsdale, AZ',
      images: [
        'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Electric Bike (E-Bike) with Helmet',
      description: 'Powerful electric bike with 50-mile range. Perfect for city commuting or recreational rides. Includes helmet and lock. Battery fully charged before each rental.',
      category: 'Sports Equipment',
      pricePerDay: 50,
      location: 'San Francisco, CA',
      images: [
        'https://images.unsplash.com/photo-1559352686-318c94e9fb3a?w=800',
      ],
      ownerId: users[2].id,
    },

    // Home Construction
    {
      title: 'Power Drill Set - Professional Grade',
      description: 'Professional cordless power drill with two batteries and complete bit set. Includes carrying case. Perfect for home improvement projects. High torque and long battery life.',
      category: 'Home Construction',
      pricePerDay: 15,
      location: 'Chicago, IL',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
      ],
      ownerId: users[3].id,
    },
    {
      title: 'Pressure Washer - 3000 PSI',
      description: 'Heavy-duty pressure washer perfect for cleaning driveways, decks, siding, and vehicles. Includes multiple nozzles and long hose. Electric powered.',
      category: 'Home Construction',
      pricePerDay: 35,
      location: 'Dallas, TX',
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      ],
      ownerId: users[4].id,
    },
    {
      title: 'Tile Saw - Wet Cut with Stand',
      description: 'Professional tile saw with water reservoir and adjustable rip fence. Perfect for bathroom or kitchen tile projects. Includes diamond blade.',
      category: 'Home Construction',
      pricePerDay: 40,
      location: 'Phoenix, AZ',
      images: [
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
      ],
      ownerId: users[0].id,
    },
    {
      title: 'Extension Ladder - 24 Foot',
      description: 'Sturdy aluminum extension ladder, extends up to 24 feet. Perfect for roof access, painting, or gutter cleaning. Safety tested and in excellent condition.',
      category: 'Home Construction',
      pricePerDay: 25,
      location: 'Atlanta, GA',
      images: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Floor Sander - Drum Type',
      description: 'Professional drum floor sander for hardwood floor refinishing. Includes dust collection system and sandpaper variety pack. Easy to operate.',
      category: 'Home Construction',
      pricePerDay: 50,
      location: 'Boston, MA',
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800',
      ],
      ownerId: users[2].id,
    },
    {
      title: 'Chainsaw - Gas Powered 18"',
      description: 'Powerful gas-powered chainsaw with 18-inch bar. Perfect for tree trimming and firewood cutting. Includes safety gear and chain oil. Well-maintained.',
      category: 'Home Construction',
      pricePerDay: 30,
      location: 'Nashville, TN',
      images: [
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800',
      ],
      ownerId: users[3].id,
    },
    {
      title: 'Cement Mixer - Portable Electric',
      description: 'Portable electric cement mixer, perfect for small to medium concrete projects. Easy to move and clean. Ideal for DIY concrete work.',
      category: 'Home Construction',
      pricePerDay: 35,
      location: 'Las Vegas, NV',
      images: [
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800',
      ],
      ownerId: users[4].id,
    },

    // Party Items
    {
      title: 'Inflatable Bounce House - Large',
      description: 'Large inflatable bounce house perfect for kids parties. Includes blower motor and stakes. Sets up in 15 minutes. Great for birthdays and celebrations!',
      category: 'Party Items',
      pricePerDay: 80,
      location: 'Orlando, FL',
      images: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      ],
      ownerId: users[0].id,
    },
    {
      title: 'Professional Sound System with Microphones',
      description: 'Complete PA system with speakers, mixer, and two wireless microphones. Perfect for parties, weddings, or presentations. Includes all cables and stands.',
      category: 'Party Items',
      pricePerDay: 75,
      location: 'Los Angeles, CA',
      images: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Folding Tables and Chairs Set (10 each)',
      description: 'Ten folding tables and ten folding chairs. Perfect for parties, events, or gatherings. Easy to transport and set up. Clean and in good condition.',
      category: 'Party Items',
      pricePerDay: 40,
      location: 'Houston, TX',
      images: [
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      ],
      ownerId: users[2].id,
    },
    {
      title: 'Popcorn Machine - Commercial Style',
      description: 'Vintage-style popcorn machine, just like at the movies! Includes popcorn, oil, and salt for 50 servings. Perfect for parties and movie nights.',
      category: 'Party Items',
      pricePerDay: 35,
      location: 'San Antonio, TX',
      images: [
        'https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=800',
      ],
      ownerId: users[3].id,
    },
    {
      title: 'Photo Booth with Props',
      description: 'Portable photo booth with backdrop stand, ring light, and box of fun props. Perfect for weddings and parties. Includes tablet stand for camera.',
      category: 'Party Items',
      pricePerDay: 60,
      location: 'Minneapolis, MN',
      images: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
      ],
      ownerId: users[4].id,
    },
    {
      title: 'Projector and Screen - HD Quality',
      description: 'HD projector with 120-inch portable screen. Perfect for movie nights, presentations, or watching sports. Includes HDMI cables and remote control.',
      category: 'Party Items',
      pricePerDay: 45,
      location: 'Seattle, WA',
      images: [
        'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
      ],
      ownerId: users[0].id,
    },
    {
      title: 'BBQ Grill - Large Propane',
      description: 'Large propane BBQ grill with multiple burners. Perfect for backyard parties and cookouts. Includes propane tank and BBQ tools. Cleaned after each use.',
      category: 'Party Items',
      pricePerDay: 30,
      location: 'Kansas City, MO',
      images: [
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      ],
      ownerId: users[1].id,
    },
    {
      title: 'Cotton Candy Machine with Supplies',
      description: 'Commercial-grade cotton candy machine with sugar and cones for 100 servings. Perfect for carnivals, parties, and events. Easy to use and clean.',
      category: 'Party Items',
      pricePerDay: 40,
      location: 'Denver, CO',
      images: [
        'https://images.unsplash.com/photo-1569106829530-eb97c7805944?w=800',
      ],
      ownerId: users[2].id,
    },
  ]

  // Create items
  console.log('📦 Creating rental items...')
  const items = await Promise.all(
    itemsData.map((item) =>
      prisma.item.create({
        data: item,
      })
    )
  )

  console.log(`✅ Created ${items.length} rental items`)

  // Create some sample bookings
  console.log('📅 Creating sample bookings...')
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        itemId: items[0].id,
        renterId: users[1].id,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        totalPrice: 100,
        status: 'CONFIRMED',
      },
    }),
    prisma.booking.create({
      data: {
        itemId: items[5].id,
        renterId: users[2].id,
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-12'),
        totalPrice: 80,
        status: 'PENDING',
      },
    }),
    prisma.booking.create({
      data: {
        itemId: items[10].id,
        renterId: users[0].id,
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-01-27'),
        totalPrice: 90,
        status: 'CONFIRMED',
      },
    }),
  ])

  console.log(`✅ Created ${bookings.length} sample bookings`)

  // Create some sample messages
  console.log('💬 Creating sample messages...')
  const messages = await Promise.all([
    prisma.message.create({
      data: {
        bookingId: bookings[0].id,
        senderId: users[1].id,
        receiverId: users[0].id,
        content: 'Hi! Looking forward to renting your tent. What time works best for pickup?',
      },
    }),
    prisma.message.create({
      data: {
        bookingId: bookings[0].id,
        senderId: users[0].id,
        receiverId: users[1].id,
        content: 'Hello! Anytime after 5 PM works great. I\'m at 123 Main St.',
      },
    }),
    prisma.message.create({
      data: {
        bookingId: bookings[1].id,
        senderId: users[2].id,
        receiverId: users[0].id,
        content: 'Is the hammock easy to set up? First time renting one.',
      },
    }),
  ])

  console.log(`✅ Created ${messages.length} sample messages`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   👥 Users: ${users.length + 1} (including demo user)`)
  console.log(`   📦 Items: ${items.length}`)
  console.log(`   📅 Bookings: ${bookings.length}`)
  console.log(`   💬 Messages: ${messages.length}`)
  console.log('\n💡 Demo Mode:')
  console.log('   The app works without login - uses demo@rentcycle.com automatically')
  console.log('\n💡 You can also login with any of these accounts:')
  console.log('   Email: john@example.com, sarah@example.com, mike@example.com, emily@example.com, or david@example.com')
  console.log('   Password: password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

