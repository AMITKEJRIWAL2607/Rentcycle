// Common types for the Rentcycle application
// Re-export Prisma types for convenience

export type { User, Item, Booking, BookingStatus } from '@prisma/client'

// Extended types with relations
export type UserWithItems = User & {
  items: Item[]
}

export type ItemWithOwner = Item & {
  owner: User
}

export type ItemWithBookings = Item & {
  bookings: Booking[]
}

export type BookingWithRelations = Booking & {
  item: Item
  renter: User
}

// Legacy interface exports for backwards compatibility (can be removed later)
export interface RentalItem {
  id: string
  title: string
  description: string
  category: string
  pricePerDay: number
  images: string[]
  ownerId: string
  location: string
  available: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Rental {
  id: string
  itemId: string
  renterId: string
  startDate: Date
  endDate: Date
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: Date
}

