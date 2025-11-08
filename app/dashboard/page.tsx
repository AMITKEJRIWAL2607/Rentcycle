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

interface Message {
  id: string
  content: string
  isRead: boolean
  createdAt: Date | string
  senderId: string
  receiverId: string
  sender: Pick<User, 'id' | 'name' | 'email' | 'image'>
  receiver: Pick<User, 'id' | 'name' | 'email' | 'image'>
}

interface Conversation extends BookingWithRelations {
  messages: Message[]
  _count: {
    messages: number
  }
}

type TabType = 'list' | 'my-items' | 'requests' | 'rentals' | 'messages'

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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [pendingCount, setPendingCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

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
  
  // All hooks must be called before any conditional returns
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
      } else if (tab === 'messages') {
        const response = await fetch(`/api/messages?userId=${userId}`)
        const data = await response.json()
        setConversations(data.conversations || [])
        
        // Count unread messages
        const unread = (data.conversations || []).reduce((sum: number, conv: Conversation) => {
          return sum + conv._count.messages
        }, 0)
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])
  
  // Fetch pending count and unread messages on mount for notification badges
  useEffect(() => {
    if (userId) {
      // Fetch pending requests count
      fetch(`/api/bookings?ownerId=${userId}`)
        .then(res => res.json())
        .then(data => {
          const bookings = data.bookings || []
          setPendingCount(bookings.filter((b: BookingWithRelations) => b.status === 'PENDING').length)
        })
        .catch(err => console.error('Error fetching pending count:', err))
      
      // Fetch unread messages count
      fetch(`/api/messages?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          const unread = (data.conversations || []).reduce((sum: number, conv: Conversation) => {
            return sum + conv._count.messages
          }, 0)
          setUnreadCount(unread)
        })
        .catch(err => console.error('Error fetching unread count:', err))
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
  
  const fetchConversationMessages = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/messages?bookingId=${bookingId}`)
      const data = await response.json()
      setMessages(data.messages || [])
      setSelectedConversation(bookingId)
      
      // Mark messages as read
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, userId }),
      })
      
      // Update unread count
      setUnreadCount(prev => {
        const conv = conversations.find(c => c.id === bookingId)
        return Math.max(0, prev - (conv?._count.messages || 0))
      })
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return
    
    setSendingMessage(true)
    try {
      const conversation = conversations.find(c => c.id === selectedConversation)
      if (!conversation) return
      
      // Determine receiver (the other party in the booking)
      const isOwner = conversation.item.ownerId === userId
      const receiverId = isOwner ? conversation.renterId : conversation.item.ownerId
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedConversation,
          senderId: userId,
          receiverId,
          content: newMessage,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        // Scroll to bottom
        setTimeout(() => {
          const messageContainer = document.getElementById('message-container')
          if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
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
    { id: 'messages' as TabType, label: 'Messages', icon: '💬', count: unreadCount },
  ]
  
  const filteredRequests = statusFilter === 'all' 
    ? incomingRequests 
    : incomingRequests.filter(b => b.status === statusFilter)
    
  const filteredRentals = statusFilter === 'all'
    ? myRentals
    : myRentals.filter(b => b.status === statusFilter)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])
  
  // Render loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Render null if no user
  if (!userId) {
    return null
  }

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
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          {booking.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED', {
                                  itemTitle: booking.item.title,
                                  renterName: booking.renter.name || booking.renter.email
                                })}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setActiveTab('messages')
                              setTimeout(() => fetchConversationMessages(booking.id), 100)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Message
                          </button>
                        </div>
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
                      <div className="flex gap-2 mt-3">
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('messages')
                            setTimeout(() => fetchConversationMessages(booking.id), 100)
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded-lg transition-colors text-sm flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No messages yet.</p>
                  <p className="text-sm text-gray-500">Messages will appear here when you communicate with renters or owners about bookings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Conversations List */}
                  <div className="lg:col-span-1 space-y-2">
                    <h3 className="font-semibold text-gray-700 mb-3">Conversations</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {conversations.map((conversation) => {
                        const otherUser = conversation.item.ownerId === userId 
                          ? conversation.renter 
                          : conversation.item.owner
                        const lastMessage = conversation.messages[0]
                        const hasUnread = conversation._count.messages > 0
                        
                        return (
                          <button
                            key={conversation.id}
                            onClick={() => fetchConversationMessages(conversation.id)}
                            className={`w-full text-left p-4 rounded-lg border transition-all ${
                              selectedConversation === conversation.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {otherUser.image ? (
                                  <img
                                    src={otherUser.image}
                                    alt={otherUser.name || 'User'}
                                    className="w-10 h-10 rounded-full flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-sm font-semibold">
                                      {(otherUser.name || otherUser.email).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold truncate ${hasUnread ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {otherUser.name || otherUser.email}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">{conversation.item.title}</p>
                                </div>
                              </div>
                              {hasUnread && (
                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                  {conversation._count.messages}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-sm text-gray-600 truncate">
                                {lastMessage.sender.id === userId ? 'You: ' : ''}
                                {lastMessage.content}
                              </p>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Messages View */}
                  <div className="lg:col-span-2">
                    {selectedConversation ? (
                      <div className="border border-gray-200 rounded-lg h-[600px] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          {(() => {
                            const conversation = conversations.find(c => c.id === selectedConversation)
                            if (!conversation) return null
                            const otherUser = conversation.item.ownerId === userId 
                              ? conversation.renter 
                              : conversation.item.owner
                            
                            return (
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  {otherUser.image ? (
                                    <img
                                      src={otherUser.image}
                                      alt={otherUser.name || 'User'}
                                      className="w-10 h-10 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 font-semibold">
                                        {(otherUser.name || otherUser.email).charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900">{otherUser.name || otherUser.email}</p>
                                    <Link
                                      href={`/items/${conversation.item.id}`}
                                      className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                      {conversation.item.title}
                                    </Link>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className={`px-2 py-1 rounded-full ${getStatusColor(conversation.status)}`}>
                                    {conversation.status}
                                  </span>
                                  <span>•</span>
                                  <span>{formatDate(conversation.startDate)} - {formatDate(conversation.endDate)}</span>
                                </div>
                              </div>
                            )
                          })()}
                        </div>

                        {/* Messages */}
                        <div 
                          id="message-container"
                          className="flex-1 p-4 overflow-y-auto space-y-4"
                        >
                          {messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          ) : (
                            messages.map((message) => {
                              const isOwn = message.senderId === userId
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    <div
                                      className={`rounded-lg px-4 py-2 ${
                                        isOwn
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-100 text-gray-900'
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    </div>
                                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                      {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </p>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your message..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={sendingMessage}
                            />
                            <button
                              type="submit"
                              disabled={sendingMessage || !newMessage.trim()}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                            >
                              {sendingMessage ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg h-[600px] flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p>Select a conversation to view messages</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

