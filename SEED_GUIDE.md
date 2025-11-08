# Database Seed Guide

## 🌱 Overview

The seed script populates your Rentcycle database with realistic dummy data for development and testing.

---

## 📦 What Gets Created

### **5 Dummy Users**
- John Smith (`john@example.com`)
- Sarah Johnson (`sarah@example.com`)
- Mike Chen (`mike@example.com`)
- Emily Rodriguez (`emily@example.com`)
- David Wilson (`david@example.com`)

**Password for all users:** `password123`

### **30 Rental Items**

**Categories:**
- 🏕️ **Outdoor Equipment** (6 items)
  - Camping tents, kayaks, sleeping bags, hammocks, etc.
  
- ⚽ **Sports Equipment** (7 items)
  - Mountain bikes, paddleboards, scuba gear, snowboards, etc.
  
- 🔨 **Home Construction** (7 items)
  - Power drills, pressure washers, ladders, saws, etc.
  
- 🎉 **Party Items** (10 items)
  - Bounce houses, sound systems, tables/chairs, BBQ grills, etc.

**Price Range:** $8 - $80 per day

**Locations:** Various US cities (Seattle, Denver, Austin, Miami, etc.)

### **3 Sample Bookings**
- Mix of PENDING and CONFIRMED status
- Realistic date ranges
- Includes pricing

### **3 Sample Messages**
- Conversation examples between renters and owners
- Related to existing bookings

---

## 🚀 How to Run

### **Option 1: Run Seed Script**
```bash
npm run seed
```

### **Option 2: Direct Command**
```bash
npx tsx prisma/seed.ts
```

---

## ⚠️ Important Notes

### **Data Clearing**
The seed script will **DELETE ALL EXISTING DATA** including:
- All messages
- All bookings
- All items
- All sessions and accounts
- All users

**⚠️ WARNING:** Only run this on development databases, never on production!

### **If You Want to Keep Existing Data**
Edit `prisma/seed.ts` and comment out the delete statements:

```typescript
// Comment these lines to preserve existing data:
// await prisma.message.deleteMany()
// await prisma.booking.deleteMany()
// await prisma.item.deleteMany()
// await prisma.session.deleteMany()
// await prisma.account.deleteMany()
// await prisma.user.deleteMany()
```

---

## 🧪 Testing After Seeding

### **1. Login**
```
Email: john@example.com
Password: password123
```

(Or use any of the other dummy user emails)

### **2. Browse Items**
- Go to "Browse Items" from homepage
- Should see 30 items
- Test category filters
- Test price filters

### **3. Test Dashboard**
- Login as John (`john@example.com`)
- Go to Dashboard
- Check "My Items" - should see items owned by John
- Check "Incoming Requests" - should see bookings for John's items
- Check "My Rentals" - should see John's rental requests
- Check "Messages" - should see sample conversations

### **4. Test Messaging**
- Login as John
- Dashboard → Messages
- Should see existing conversations
- Try sending a message

### **5. Test Booking Flow**
- Login as different user
- Browse items
- Request to rent an item
- Check if it appears in Dashboard

---

## 📸 Image URLs

Images are from Unsplash and use these formats:
- `https://images.unsplash.com/photo-[ID]?w=800`
- `https://i.pravatar.cc/150?img=[ID]` (for user avatars)

These are placeholder images and will work without additional setup.

---

## 🔄 Re-running the Seed

You can run the seed script multiple times:

```bash
npm run seed
```

Each time it runs, it will:
1. Clear all existing data
2. Create fresh dummy data
3. Reset to known state

This is useful for:
- Testing from scratch
- Resetting after breaking changes
- Demonstrating features

---

## 🛠️ Customizing the Seed Data

### **Add More Items**

Edit `prisma/seed.ts` and add to the `itemsData` array:

```typescript
{
  title: 'Your Item Title',
  description: 'Detailed description...',
  category: 'Outdoor Equipment', // or Sports Equipment, etc.
  pricePerDay: 25,
  location: 'Your City, ST',
  images: [
    'https://images.unsplash.com/photo-xxxxx?w=800',
  ],
  ownerId: users[0].id, // Choose which user owns it
},
```

### **Add More Users**

Add to the `users` Promise.all():

```typescript
prisma.user.create({
  data: {
    name: 'Your Name',
    email: 'email@example.com',
    password: hashedPassword,
    image: 'https://i.pravatar.cc/150?img=XX',
  },
}),
```

### **Add More Bookings or Messages**

Add to the respective `Promise.all()` sections.

---

## 🐛 Troubleshooting

### **Error: Cannot find module 'tsx'**
```bash
npm install -D tsx
```

### **Error: Database connection failed**
- Check your `.env` file has correct `DATABASE_URL`
- Ensure database is running
- Run `npm run test-db` to verify connection

### **Error: Table does not exist**
Run migrations first:
```bash
npm run db:push
```

### **Error: Password hashing failed**
Make sure `bcryptjs` is installed:
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## 📊 Seed Data Statistics

After running, you'll see:
```
🎉 Seed completed successfully!

📊 Summary:
   👥 Users: 5
   📦 Items: 30
   📅 Bookings: 3
   💬 Messages: 3
```

---

## 💡 Use Cases

### **Development**
- Quick setup of test data
- Visual testing of UI with realistic content
- Testing filters and search

### **Demos**
- Show full features to stakeholders
- Realistic data for screenshots
- Professional-looking demo

### **Testing**
- Reset to known state
- Test booking workflows
- Test messaging system
- Test search and filters

---

## 🔐 Security Note

**Never run seed scripts on production databases!**

The dummy users all have the same password (`password123`) which is intentionally weak for development purposes.

---

## 📝 Next Steps After Seeding

1. **Login** with any dummy user
2. **Browse items** to see the catalog
3. **Test booking** request flow
4. **Test messaging** between users
5. **List a new item** using the dashboard
6. **Approve/decline** booking requests

---

## 🎯 Quick Start

```bash
# 1. Ensure database is set up
npm run db:push

# 2. Run the seed script
npm run seed

# 3. Start the dev server
npm run dev

# 4. Login at http://localhost:3000/login
# Email: john@example.com
# Password: password123

# 5. Explore the app with realistic data!
```

---

Happy developing! 🚀

