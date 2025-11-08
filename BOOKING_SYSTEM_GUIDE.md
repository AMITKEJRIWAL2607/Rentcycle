# Booking Request System - Complete Guide

## 🎯 Overview

Rentcycle now has a fully functional booking request system where renters can request items and owners can approve or decline those requests.

---

## 📋 Features Implemented

### ✅ For Renters (People Renting Items)

1. **Browse & Select Items**
   - View all available items at `/items`
   - Filter by category and price
   - Click on any item to see details

2. **Request to Rent**
   - Select start and end dates using date pickers
   - See real-time price calculation
   - View booked dates (unavailable periods)
   - Cannot select dates in the past
   - Cannot select dates that conflict with existing bookings
   - Submit rental request with one click

3. **Track Requests**
   - Go to **Dashboard > My Rentals**
   - See all your booking requests
   - Filter by status: All, Pending, Confirmed, Cancelled, Completed
   - View booking details: dates, total price, item info, owner info
   - Cancel pending requests if needed
   - Receive success confirmation with option to go to dashboard

### ✅ For Owners (People Listing Items)

1. **Receive Requests**
   - Go to **Dashboard > Incoming Requests**
   - See all rental requests for your items
   - **Red notification badge** shows number of pending requests
   - Filter requests by status

2. **Review Request Details**
   - Renter name and email
   - Rental dates (start and end)
   - Total price
   - Item details
   - Current status

3. **Approve or Decline**
   - **Accept** button (green) - Approves the booking
   - **Decline** button (red) - Rejects the booking
   - Confirmation dialog before action
   - Success message after action
   - Buttons only appear for PENDING requests

---

## 🔄 Booking Status Flow

```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED
```

### Status Definitions

| Status | Description | Who Can Set It |
|--------|-------------|----------------|
| **PENDING** | Initial state when renter requests | System (automatic) |
| **CONFIRMED** | Owner approved the request | Owner (Accept button) |
| **CANCELLED** | Request declined or canceled | Owner (Decline button) or Renter (Cancel button) |
| **COMPLETED** | Rental period finished | System (future feature) or Manual |

---

## 🎨 User Interface

### Item Detail Page (`/items/[id]`)

**Availability Section:**
- Shows booked date ranges in red badges
- Date picker for start and end dates
- Real-time price calculation
- "Request to Rent" button
- Validation prevents past dates and conflicts

**Example:**
```
Availability
✓ Available for booking

Booked dates:
[Jan 15, 2025 - Jan 20, 2025] [Feb 10, 2025 - Feb 15, 2025]

Select your rental dates:
Start Date: [____] End Date: [____]

3 days × $50.00/day = $150.00

[Request to Rent] button
```

### Dashboard - My Rentals Tab

**Features:**
- Status filter dropdown (All, Pending, Confirmed, Cancelled, Completed)
- Card-based layout with item details
- Click item title to view details
- Cancel button for pending rentals
- Color-coded status badges

### Dashboard - Incoming Requests Tab

**Features:**
- **Red notification badge** on tab (shows pending count)
- Status filter dropdown
- Request cards with renter information
- Accept/Decline buttons for pending requests
- Confirmation dialogs before actions
- Visual icons on buttons (checkmark for accept, X for decline)

---

## 🔧 Technical Implementation

### Database Schema (Prisma)

```prisma
model Booking {
  id        String   @id @default(cuid())
  startDate DateTime
  endDate   DateTime
  totalPrice Float
  status    BookingStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  itemId   String
  item     Item   @relation(fields: [itemId], references: [id], onDelete: Cascade)
  renterId String
  renter   User   @relation("RenterBookings", fields: [renterId], references: [id], onDelete: Cascade)
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

### API Endpoints

#### 1. Create Booking Request
**POST** `/api/bookings`

**Request Body:**
```json
{
  "itemId": "clxxx...",
  "renterId": "clxxx...",
  "startDate": "2025-01-15",
  "endDate": "2025-01-20"
}
```

**Response:**
```json
{
  "booking": {
    "id": "clxxx...",
    "status": "PENDING",
    "totalPrice": 250.00,
    "item": { ... },
    "renter": { ... }
  }
}
```

**Validation:**
- Checks if item exists and is available
- Validates dates are in the future
- Checks for date conflicts with existing bookings
- Calculates total price automatically

#### 2. Get Bookings
**GET** `/api/bookings?ownerId=xxx` - Get requests for items you own
**GET** `/api/bookings?renterId=xxx` - Get your rental requests
**GET** `/api/bookings?status=PENDING` - Filter by status

**Response:**
```json
{
  "bookings": [
    {
      "id": "clxxx...",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-01-20T00:00:00.000Z",
      "totalPrice": 250.00,
      "status": "PENDING",
      "item": {
        "id": "clxxx...",
        "title": "Professional Camera",
        "owner": { "name": "John Doe" }
      },
      "renter": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

#### 3. Update Booking Status
**PATCH** `/api/bookings/[id]`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Allowed Status Values:**
- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`

---

## 🎯 User Workflows

### Workflow 1: Renter Requests an Item

1. Browse items at `/items`
2. Click on an item to view details
3. Select start and end dates
4. Review price calculation
5. Click "Request to Rent"
6. See success message
7. Choose to go to dashboard
8. View request in "My Rentals" tab (status: PENDING)
9. Wait for owner approval

### Workflow 2: Owner Approves a Request

1. See red badge notification on Dashboard
2. Go to "Incoming Requests" tab
3. Review request details
4. Click "Accept" button
5. Confirm in dialog
6. See success message
7. Request status changes to CONFIRMED
8. Renter sees CONFIRMED status in their "My Rentals"

### Workflow 3: Owner Declines a Request

1. Go to "Incoming Requests" tab
2. Click "Decline" button on a request
3. Confirm in dialog
4. See confirmation message
5. Request status changes to CANCELLED
6. Renter sees CANCELLED status

### Workflow 4: Renter Cancels a Request

1. Go to "My Rentals" tab
2. Find PENDING request
3. Click "Cancel" button
4. Request status changes to CANCELLED
5. Owner sees updated status

---

## 🎨 UI Components & Features

### Notification Badges
- Red circular badge on "Incoming Requests" tab
- Shows count of pending requests
- Updates automatically when requests are approved/declined
- Only visible when count > 0

### Status Filters
- Dropdown in both "Incoming Requests" and "My Rentals" tabs
- Options: All Status, Pending, Confirmed, Cancelled, Completed
- Filters list in real-time
- Shows helpful message when no items match filter

### Confirmation Dialogs
- Appear before approving or declining requests
- Show item title and renter name
- Require explicit user confirmation
- Prevent accidental actions

### Success Messages
- ✅ "Booking approved! The renter has been notified."
- ❌ "Booking declined."
- Appear after successful actions
- Provide clear feedback to users

### Color-Coded Status Badges
- **PENDING**: Yellow background (`bg-yellow-100`)
- **CONFIRMED**: Green background (`bg-green-100`)
- **CANCELLED**: Red background (`bg-red-100`)
- **COMPLETED**: Blue background (`bg-blue-100`)

---

## 🔐 Security & Validation

### Date Validation
- ✅ Start date cannot be in the past
- ✅ End date must be after start date
- ✅ Checks for conflicts with existing bookings
- ✅ Validates against confirmed AND pending bookings

### Authorization
- ✅ Only logged-in users can request bookings
- ✅ Only item owners can approve/decline requests
- ✅ Users can only view their own rentals and requests

### Data Integrity
- ✅ Total price calculated server-side (not trusted from client)
- ✅ Booking status can only transition to valid states
- ✅ Cascade deletes: if item/user deleted, bookings are deleted

---

## 🚀 Testing the System

### Test Scenario 1: End-to-End Booking

1. **Create two accounts:**
   - Account A (Owner)
   - Account B (Renter)

2. **As Account A (Owner):**
   - Login
   - Go to Dashboard
   - List a new item (e.g., "Camping Tent")
   - Add price: $25/day

3. **As Account B (Renter):**
   - Login
   - Browse items
   - Find the camping tent
   - Select dates (e.g., next week for 3 days)
   - Request to rent
   - Go to Dashboard > My Rentals
   - Verify: See request with PENDING status

4. **As Account A (Owner):**
   - Refresh dashboard
   - See red badge notification (1)
   - Go to Incoming Requests tab
   - See request from Account B
   - Click "Accept"
   - Confirm in dialog
   - Verify: Status changes to CONFIRMED

5. **As Account B (Renter):**
   - Refresh dashboard
   - Go to My Rentals
   - Verify: Status changed to CONFIRMED

### Test Scenario 2: Date Conflicts

1. Create a booking for Jan 15-20
2. Try to create another booking for Jan 18-22
3. **Expected**: Error message about date conflict
4. **Result**: Booking prevented

### Test Scenario 3: Filters

1. Create multiple bookings with different statuses
2. Use filter dropdown to show only PENDING
3. **Expected**: Only pending requests visible
4. Switch to CONFIRMED
5. **Expected**: Only confirmed bookings visible

---

## 📊 Database Queries

### Get Pending Requests for Owner
```typescript
const bookings = await prisma.booking.findMany({
  where: {
    item: { ownerId: userId },
    status: 'PENDING'
  },
  include: {
    item: { include: { owner: true } },
    renter: true
  },
  orderBy: { createdAt: 'desc' }
})
```

### Check Date Conflicts
```typescript
const conflicts = await prisma.booking.findMany({
  where: {
    itemId: itemId,
    status: { in: ['CONFIRMED', 'PENDING'] },
    OR: [
      {
        startDate: { lte: new Date(endDate) },
        endDate: { gte: new Date(startDate) }
      }
    ]
  }
})
```

---

## 🔮 Future Enhancements

### Potential Features to Add

1. **Email Notifications**
   - Send email when booking is requested
   - Send email when booking is approved/declined
   - Reminder emails before rental starts

2. **Calendar Integration**
   - Visual calendar view of bookings
   - Drag-and-drop date selection
   - Month/week/day views

3. **Payment Integration**
   - Stripe/PayPal integration
   - Payment on confirmation
   - Refund on cancellation
   - Security deposits

4. **Messaging System**
   - In-app chat between renter and owner
   - Discuss pickup/return details
   - Share additional information

5. **Reviews & Ratings**
   - Rate items after rental
   - Rate renters and owners
   - Display average ratings

6. **Auto-Complete Status**
   - Automatically mark bookings as COMPLETED after end date
   - Scheduled job or cron task

7. **Advanced Filtering**
   - Filter by date range
   - Filter by price range
   - Sort by date, price, status

8. **Booking Extensions**
   - Request to extend rental period
   - Owner can approve extensions
   - Automatic price recalculation

9. **Cancellation Policies**
   - Set cancellation deadlines
   - Partial refunds
   - Cancellation fees

10. **Multi-Item Bookings**
    - Rent multiple items at once
    - Bundle discounts
    - Single checkout process

---

## 🐛 Troubleshooting

### Issue: Notification badge not updating
**Solution:** Refresh the page or navigate away and back to dashboard

### Issue: Cannot see my rental requests
**Solution:** Make sure you're logged in and in the correct tab (My Rentals)

### Issue: Accept/Decline buttons not showing
**Solution:** Buttons only appear for PENDING requests. Check the status.

### Issue: Date conflict error
**Solution:** Check the "Booked dates" section on the item page. Select different dates.

### Issue: Can't request a booking
**Solution:** Make sure you're logged in and dates are selected correctly (start < end, both in future)

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the Database Setup guides
3. Check browser console for errors
4. Review API responses in Network tab

---

## ✅ Summary

The booking request system is fully functional with:
- ✅ Date selection and validation
- ✅ Real-time price calculation
- ✅ Conflict detection
- ✅ Request creation
- ✅ Owner approval/decline workflow
- ✅ Status tracking
- ✅ Notification badges
- ✅ Status filtering
- ✅ Confirmation dialogs
- ✅ Success/error messages
- ✅ Responsive UI
- ✅ Secure authorization

**Your users can now successfully rent and lend items!** 🎉

