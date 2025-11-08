'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Item, User, Booking } from '@prisma/client'

interface BookingWithDates extends Pick<Booking, 'id' | 'startDate' | 'endDate' | 'status'> {}

interface ItemWithRelations extends Item {
  owner: Pick<User, 'id' | 'name' | 'email' | 'image' | 'createdAt'>
  bookings: BookingWithDates[]
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [item, setItem] = useState<ItemWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedStartDate, setSelectedStartDate] = useState('')
  const [selectedEndDate, setSelectedEndDate] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchItem()
    }
  }, [params.id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/items/${params.id}`)
      if (response.status === 404) {
        router.push('/items')
        return
      }
      const data = await response.json()
      setItem(data.item)
    } catch (error) {
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestToRent = async () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert('Please select start and end dates')
      return
    }

    const startDate = new Date(selectedStartDate)
    const endDate = new Date(selectedEndDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (startDate < today) {
      alert('Start date cannot be in the past')
      return
    }

    if (endDate <= startDate) {
      alert('End date must be after start date')
      return
    }

    // Check for conflicts with existing bookings
    const unavailable = getUnavailableDates()
    const hasConflict = unavailable.some((unavailDate) => {
      const checkDate = new Date(unavailDate)
      checkDate.setHours(0, 0, 0, 0)
      return checkDate >= startDate && checkDate <= endDate
    })

    if (hasConflict) {
      alert('Selected dates conflict with existing bookings. Please choose different dates.')
      return
    }

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = days * (item?.pricePerDay || 0)

    if (!session?.user?.id) {
      alert('Please sign in to request a rental')
      router.push('/login')
      return
    }

    try {
      setIsRequesting(true)
      
      const renterId = session.user.id

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item?.id,
          renterId,
          startDate: selectedStartDate,
          endDate: selectedEndDate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      alert(`✅ Booking requested successfully!\n\n📅 Dates: ${new Date(selectedStartDate).toLocaleDateString()} - ${new Date(selectedEndDate).toLocaleDateString()}\n💰 Total: $${totalPrice.toFixed(2)} for ${days} days\n\n⏳ Waiting for owner approval. You can check the status in your Dashboard > My Rentals.`)
      
      // Refresh item data to show new booking
      fetchItem()
      
      // Reset dates
      setSelectedStartDate('')
      setSelectedEndDate('')
      
      // Suggest going to dashboard
      if (confirm('Go to your dashboard to track this request?')) {
        router.push('/dashboard?tab=rentals')
      }
    } catch (error: any) {
      console.error('Error creating booking:', error)
      alert(error.message || 'Failed to create booking. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }

  const getUnavailableDates = () => {
    if (!item) return []
    const unavailable: Date[] = []
    item.bookings.forEach((booking) => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        unavailable.push(new Date(d))
      }
    })
    return unavailable
  }

  const isDateUnavailable = (date: Date) => {
    const unavailable = getUnavailableDates()
    return unavailable.some(
      (unavailDate) =>
        date.toDateString() === unavailDate.toDateString()
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Outdoor Equipment': 'bg-green-100 text-green-800',
      'Sports Equipment': 'bg-blue-100 text-blue-800',
      'Home Construction': 'bg-orange-100 text-orange-800',
      'Party Items': 'bg-purple-100 text-purple-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
          <Link
            href="/items"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Items
          </Link>
        </div>
      </div>
    )
  }

  const unavailableDates = getUnavailableDates()
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/items"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Items
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative h-96 bg-gray-200">
                    <img
                      src={item.images[selectedImageIndex]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Thumbnail Gallery */}
                  {item.images.length > 1 && (
                    <div className="p-4 grid grid-cols-4 gap-2">
                      {item.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-blue-600 ring-2 ring-blue-200'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${item.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {formatPrice(item.pricePerDay)}
                  </p>
                  <p className="text-sm text-gray-500">per day</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Availability Calendar */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Availability
                </h2>
                {unavailableDates.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Booked dates:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.bookings.map((booking) => (
                        <span
                          key={booking.id}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {formatDate(booking.startDate)} -{' '}
                          {formatDate(booking.endDate)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-green-600 font-medium mb-4">
                    ✓ Available for booking
                  </p>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Select your rental dates:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={selectedStartDate}
                        onChange={(e) => {
                          setSelectedStartDate(e.target.value)
                          // Reset end date if it's before new start date
                          if (selectedEndDate && e.target.value > selectedEndDate) {
                            setSelectedEndDate('')
                          }
                        }}
                        min={minDate}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={selectedEndDate}
                        onChange={(e) => setSelectedEndDate(e.target.value)}
                        min={selectedStartDate || minDate}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  {selectedStartDate && selectedEndDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">
                          {Math.ceil(
                            (new Date(selectedEndDate).getTime() -
                              new Date(selectedStartDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </span>{' '}
                        × {formatPrice(item.pricePerDay)}/day ={' '}
                        <span className="font-bold text-blue-600">
                          {formatPrice(
                            Math.ceil(
                              (new Date(selectedEndDate).getTime() -
                                new Date(selectedStartDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * item.pricePerDay
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rental Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4">
              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {formatPrice(item.pricePerDay)}
                </p>
                <p className="text-gray-500">per day</p>
              </div>

              <button
                onClick={handleRequestToRent}
                disabled={isRequesting || !item.isAvailable}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg mb-4"
              >
                {isRequesting
                  ? 'Processing...'
                  : item.isAvailable
                  ? 'Request to Rent'
                  : 'Not Available'}
              </button>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Secure booking
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Instant confirmation
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Owner Information
              </h2>
              <div className="flex items-center mb-4">
                {item.owner.image ? (
                  <img
                    src={item.owner.image}
                    alt={item.owner.name || 'Owner'}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.owner.name || 'Owner'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since{' '}
                    {new Date(item.owner.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
              <Link
                href={`/users/${item.owner.id}`}
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                View Profile
              </Link>
            </div>

            {/* Item Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Item Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-900">
                    {item.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold text-gray-900">
                    {item.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span
                    className={`font-semibold ${
                      item.isAvailable
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

