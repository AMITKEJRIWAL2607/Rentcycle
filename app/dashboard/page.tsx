'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UploadButton } from '@/lib/uploadthing'
import type { Item, Booking, User } from '@prisma/client'

interface ItemWithOwner extends Item {
  owner: Pick<User, 'id' | 'name' | 'email'>
}

interface BookingWithRelations extends Booking {
  item: ItemWithOwner
  renter: Pick<User, 'id' | 'name' | 'email'>
}

type TabType = 'list' | 'my-items' | 'requests' | 'rentals'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = session?.user?.id
  
  // Set initial tab from URL parameter (must be before conditional returns)
  const initialTab = (searchParams.get('tab') as TabType) || 'list'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [myItems, setMyItems] = useState<ItemWithOwner[]>([])
  const [incomingRequests, setIncomingRequests] = useState<BookingWithRelations[]>([])
  const [myRentals, setMyRentals] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pendingCount, setPendingCount] = useState(0)

  // Form state for listing new item
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    pricePerDay: '',
    location: '',
    images: [] as string[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!userId) {
    return null
  }

  const fetchDashboardData = useCallback(async (tab: TabType) => {
    if (!userId || tab === 'list') return
    
    setLoading(true)
    try {
      if (tab === 'my-items') {
        const response = await fetch(`/api/items?ownerId=${userId}`)
        const data = await response.json()
        setMyItems(data.items || [])
      } else if (tab === 'requests') {
        const response = await fetch(`/api/bookings?ownerId=${userId}`)
        const data = await response.json()
        const bookings = data.bookings || []
        setIncomingRequests(bookings)
        // Count pending requests
        setPendingCount(bookings.filter((b: BookingWithRelations) => b.status === 'PENDING').length)
      } else if (tab === 'rentals') {
        const response = await fetch(`/api/bookings?renterId=${userId}`)
        const data = await response.json()
        setMyRentals(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  // Fetch pending count on mount for notification badge
  useEffect(() => {
    if (userId) {
      fetch(`/api/bookings?ownerId=${userId}`)
        .then(res => res.json())
        .then(data => {
          const bookings = data.bookings || []
          setPendingCount(bookings.filter((b: BookingWithRelations) => b.status === 'PENDING').length)
        })
        .catch(err => console.error('Error fetching pending count:', err))
    }
  }, [userId])

  useEffect(() => {
    fetchDashboardData(activeTab)
  }, [activeTab, fetchDashboardData])

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pricePerDay: parseFloat(formData.pricePerDay),
          ownerId: userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item')
      }

      alert('Item listed successfully!')
      setFormData({
        title: '',
        description: '',
        category: '',
        pricePerDay: '',
        location: '',
        images: [],
      })
      setActiveTab('my-items')
      fetchDashboardData('my-items')
    } catch (error: any) {
      console.error('Error creating item:', error)
      alert(error.message || 'Failed to create item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (urls: string[]) => {
    setFormData({
      ...formData,
      images: [...formData.images, ...urls],
    })
  }

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string, bookingDetails?: { itemTitle: string; renterName: string }) => {
    // Confirmation dialog
    const actionText = status === 'CONFIRMED' ? 'approve' : status === 'CANCELLED' ? 'decline' : 'update'
    const confirmMessage = bookingDetails
      ? `Are you sure you want to ${actionText} the booking request for "${bookingDetails.itemTitle}" from ${bookingDetails.renterName}?`
      : `Are you sure you want to ${actionText} this booking?`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking')
      }

      // Success message
      const successMessage = status === 'CONFIRMED' 
        ? '✅ Booking approved! The renter has been notified.' 
        : status === 'CANCELLED'
        ? '❌ Booking declined.' 
        : '✅ Booking updated successfully!'
      
      alert(successMessage)
      
      fetchDashboardData(activeTab)
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const tabs = [
    { id: 'list' as TabType, label: 'List New Item', icon: '➕', count: 0 },
    { id: 'my-items' as TabType, label: 'My Items', icon: '📦', count: 0 },
    { id: 'requests' as TabType, label: 'Incoming Requests', icon: '📥', count: pendingCount },
    { id: 'rentals' as TabType, label: 'My Rentals', icon: '🏠', count: 0 },
  ]
  
  const filteredRequests = statusFilter === 'all' 
    ? incomingRequests 
    : incomingRequests.filter(b => b.status === statusFilter)
    
  const filteredRentals = statusFilter === 'all'
    ? myRentals
    : myRentals.filter(b => b.status === statusFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-6">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setStatusFilter('all') // Reset filter when changing tabs
                }}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {tab.count > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          {activeTab === 'list' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">List a New Item</h2>
              <form onSubmit={handleSubmitItem} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Professional Camera Equipment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your item in detail..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      <option value="Outdoor Equipment">Outdoor Equipment</option>
                      <option value="Sports Equipment">Sports Equipment</option>
                      <option value="Home Construction">Home Construction</option>
                      <option value="Party Items">Party Items</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price per Day ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricePerDay}
                      onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., New York, NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images
                  </label>
                  <div className="mb-4">
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          const urls = res.map((file) => file.url)
                          handleImageUpload(urls)
                        }
                        setUploadingImages(false)
                      }}
                      onUploadError={(error: Error) => {
                        alert(`Error: ${error.message}`)
                        setUploadingImages(false)
                      }}
                      onUploadBegin={() => {
                        setUploadingImages(true)
                      }}
                      content={{
                        button: ({ ready }) =>
                          ready ? 'Upload Images' : 'Preparing...',
                        allowedContent: 'Images up to 4MB (max 10 files)',
                      }}
                    />
                  </div>
                  {uploadingImages && (
                    <div className="mb-2 text-sm text-gray-600">
                      Uploading images...
                    </div>
                  )}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Upload up to 10 images. Each image should be under 4MB.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Listing Item...' : 'List Item'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-items' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Listed Items</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You haven't listed any items yet.</p>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    List Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-shadow border border-gray-200"
                    >
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-blue-600 font-semibold mb-2">
                        {formatPrice(item.pricePerDay)}/day
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs ${
                          item.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Incoming Rental Requests</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Filter:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    {statusFilter === 'all' ? 'No rental requests yet.' : `No ${statusFilter.toLowerCase()} requests.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/items/${booking.item.id}`}
                            className="text-xl font-bold text-blue-600 hover:text-blue-700 mb-2 block"
                          >
                            {booking.item.title}
                          </Link>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">Renter:</span> {booking.renter.name || booking.renter.email}
                            </p>
                            <p>
                              <span className="font-semibold">Dates:</span> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </p>
                            <p>
                              <span className="font-semibold">Total:</span> {formatPrice(booking.totalPrice)}
                            </p>
                          </div>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED', {
                                itemTitle: booking.item.title,
                                renterName: booking.renter.name || booking.renter.email
                              })}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED', {
                                itemTitle: booking.item.title,
                                renterName: booking.renter.name || booking.renter.email
                              })}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rentals' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">My Rentals</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Filter:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredRentals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    {statusFilter === 'all' ? "You haven't rented any items yet." : `No ${statusFilter.toLowerCase()} rentals.`}
                  </p>
                  {statusFilter === 'all' && (
                    <Link
                      href="/items"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Browse Items
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRentals.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <Link
                        href={`/items/${booking.item.id}`}
                        className="text-xl font-bold text-blue-600 hover:text-blue-700 mb-2 block"
                      >
                        {booking.item.title}
                      </Link>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p>
                          <span className="font-semibold">Owner:</span> {booking.item.owner.name || booking.item.owner.email}
                        </p>
                        <p>
                          <span className="font-semibold">Dates:</span> {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                        </p>
                        <p>
                          <span className="font-semibold">Total:</span> {formatPrice(booking.totalPrice)}
                        </p>
                        <p>
                          <span className="font-semibold">Location:</span> {booking.item.location}
                        </p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                          className="ml-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

