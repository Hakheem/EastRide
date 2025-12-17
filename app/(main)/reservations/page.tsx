"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, Car, MapPin, X, Loader2, AlertCircle, CheckCircle, Clock4, CalendarDays, History, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { getUserTestDrives, cancelTestDrive } from '@/app/actions/test-drives'
import { TestDriveBooking } from '@/types/test-drive'
import { BookingStatus } from '@prisma/client'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'


export default function ReservationsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<TestDriveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<TestDriveBooking | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const fetchBookings = async () => {
    try {
      const result = await getUserTestDrives()
      if (result.success && result.data) {
        // Cast the data to our TestDriveBooking type
        setBookings(result.data as unknown as TestDriveBooking[])
      } else if (result.requiresAuth) {
        toast.error('Please login to view bookings')
        router.push('/login')
      } else {
        toast.error(result.error || 'Failed to load bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Separate bookings by status
  const now = new Date()
  
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate)
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(booking.startTime.split(":")[0]),
      parseInt(booking.startTime.split(":")[1])
    )
    return (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && bookingDateTime > now
  })

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate)
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(booking.startTime.split(":")[0]),
      parseInt(booking.startTime.split(":")[1])
    )
    return booking.status === 'COMPLETED' || bookingDateTime <= now
  })

  const cancelledBookings = bookings.filter(booking => booking.status === 'CANCELLED')

  const handleCancelClick = (booking: TestDriveBooking) => {
    setBookingToCancel(booking)
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!bookingToCancel) return

    setCancellingId(bookingToCancel.id)
    try {
      const result = await cancelTestDrive(bookingToCancel.id, cancelReason)
      if (result.success) {
        toast.success(result.message || 'Booking cancelled successfully')
        // Refresh bookings
        fetchBookings()
        setShowCancelDialog(false)
        setBookingToCancel(null)
        setCancelReason('')
      } else {
        toast.error(result.error || 'Failed to cancel booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusBadge = (status: BookingStatus, isPast: boolean = false) => {
    if (isPast) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
        <History className="w-3 h-3 mr-1" />
        Past
      </Badge>
    }

    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
          <Clock4 className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      case 'CONFIRMED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <X className="w-3 h-3 mr-1" />
          Cancelled
        </Badge>
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      case 'NO_SHOW':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
          <X className="w-3 h-3 mr-1" />
          No Show
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const canCancel = (booking: TestDriveBooking) => {
    const bookingDate = new Date(booking.bookingDate)
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(booking.startTime.split(":")[0]),
      parseInt(booking.startTime.split(":")[1])
    )
    const today = new Date()
    const hoursDiff = (bookingDateTime.getTime() - today.getTime()) / (1000 * 60 * 60)
    
    return (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && hoursDiff > 24
  }

  const formatDateTime = (booking: TestDriveBooking) => {
    const bookingDate = new Date(booking.bookingDate)
    return {
      date: bookingDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: `${booking.startTime} - ${booking.endTime}`,
      fullDate: bookingDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  if (loading) {
    return (
      <div className="padded">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">My Test Drive Bookings</h1>
          <div className="grid grid-cols-1 gap-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <Skeleton className="h-48 lg:h-40 lg:w-64 shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="padded">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">My Test Drive Bookings</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your upcoming and past test drive reservations</p>

        {/* Upcoming Test Drives */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">Upcoming Test Drives</h2>
            <Badge variant="secondary" className="ml-2">
              {upcomingBookings.length}
            </Badge>
          </div>

          {upcomingBookings.length === 0 ? (
            <Alert className="max-w-3xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any upcoming test drives. <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/cars')}>Browse available cars</Button> to schedule one.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {upcomingBookings.map((booking) => {
                const { date, time, fullDate } = formatDateTime(booking)
                const bookingDate = new Date(booking.bookingDate)
                const isPast = bookingDate < new Date()
                
                return (
                  <Card key={booking.id} className="overflow-hidden bg-gray-50 dark:bg-gray-900 p-0 border">
                    <div className="flex flex-col lg:flex-row">
                      {/* Car Image */}
                      <div className="relative h-48 lg:h-auto lg:w-64 shrink-0 overflow-hidden">
                        {booking.car?.images?.[0] ? (
                          <Image
                            src={booking.car.images[0]}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 256px"
                            style={{ margin: 0, padding: 0 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <Car className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {/* Badge absolute to image top-right */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(booking.status, isPast)}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 flex justify-between items-center p-6">
                        {/* Car Details Column - Updated spacing */}
                        <div className="flex-1 space-y-4 lg:space-y-5">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">
                              {booking.car?.year} {booking.car?.make} {booking.car?.model}
                            </h3>
                            <p className="text-lg font-semibold text-primary">
                              {booking.car?.price ? new Intl.NumberFormat('en-KE', {
                                style: 'currency',
                                currency: 'KES',
                                minimumFractionDigits: 0,
                              }).format(booking.car.price) : ''}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Date:</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">{fullDate}</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Time:</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 font-medium">{time}</p>
                            </div>
                          </div>

                          {booking.car?.dealership && (
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                <span className="font-medium">Dealership:</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {booking.car.dealership.name}, {booking.car.dealership.address}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Vertical Separator - Only on large screens */}
                        <div className="hidden lg:block mx-6">
                          <Separator orientation="vertical" className="h-32" />
                        </div>

                        {/* Notes and Buttons Column */}
                        <div className="flex flex-col gap-4 lg:w-auto lg:min-w-[250px]">
                          {/* Notes */}
                          {booking.notes && booking.notes.trim() !== '' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                <p className="font-medium text-sm">Notes:</p>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md whitespace-pre-wrap">
                                {booking.notes}
                              </p>
                            </div>
                          )}

                          {/* Actions - Fixed button sizes */}
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                            <Button
                              variant="outline"
                              size="default"
                              className="w-full"
                              onClick={() => router.push(`/car/${booking.carId}`)}
                            >
                              View Car
                            </Button>
                            
                            {canCancel(booking) && (
                              <Button
                                variant="destructive"
                                size="default"
                                className="w-full"
                                onClick={() => handleCancelClick(booking)}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  'Cancel'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Past Test Drives */}
        {pastBookings.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold">Past Test Drives</h2>
              <Badge variant="outline" className="ml-2">
                {pastBookings.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastBookings.map((booking) => {
                const { date, time, fullDate } = formatDateTime(booking)
                const bookingDate = new Date(booking.bookingDate)
                const isPast = bookingDate < new Date()
                
                return (
                  <Card key={booking.id} className="overflow-hidden border">
                    <div className="flex flex-col lg:flex-row">
                      {/* Car Image */}
                      <div className="relative h-48 lg:h-auto lg:w-48 shrink-0 overflow-hidden">
                        {booking.car?.images?.[0] ? (
                          <Image
                            src={booking.car.images[0]}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 192px"
                            style={{ margin: 0, padding: 0 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <Car className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        {/* Badge absolute to image top-right */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(booking.status, true)}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 flex flex-col p-5">
                        {/* Car Details - Updated spacing */}
                        <div className="flex-1 space-y-4 mb-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                              {booking.car?.year} {booking.car?.make} {booking.car?.model}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {fullDate} • {time}
                            </p>
                          </div>

                          {booking.car?.dealership && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {booking.car.dealership.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Notes and Actions */}
                        <div className="space-y-4">
                          {/* Notes - Fixed to show notes */}
                          {booking.notes && booking.notes.trim() !== '' && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Notes:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {booking.notes}
                              </p>
                            </div>
                          )}
                          
                          {/* Button - Fixed size */}
                          <Button
                            variant="outline"
                            size="default"
                            className="w-full"
                            onClick={() => router.push(`/car/${booking.carId}`)}
                          >
                            View Car
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancelled Test Drives */}
        {cancelledBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <X className="w-6 h-6 text-gray-500" />
              <h2 className="text-lg font-semibold">Cancelled Test Drives</h2>
              <Badge variant="outline" className="ml-2">
                {cancelledBookings.length}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cancelledBookings.map((booking) => {
                const { date, time, fullDate } = formatDateTime(booking)
                
                return (
                  <Card key={booking.id} className="overflow-hidden border opacity-70">
                    <div className="flex flex-col lg:flex-row">
                      {/* Car Image */}
                      <div className="relative h-48 lg:h-auto lg:w-48 shrink-0 overflow-hidden">
                        {booking.car?.images?.[0] ? (
                          <Image
                            src={booking.car.images[0]}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 192px"
                            style={{ margin: 0, padding: 0 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                            <Car className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        {/* Badge absolute to image top-right */}
                        <div className="absolute top-3 right-3">
                          {getStatusBadge('CANCELLED')}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 flex flex-col p-5">
                        {/* Car Details - Updated spacing */}
                        <div className="flex-1 space-y-4 mb-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg line-through">
                              {booking.car?.year} {booking.car?.make} {booking.car?.model}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {fullDate} • {time}
                            </p>
                          </div>

                          {booking.car?.dealership && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {booking.car.dealership.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions - Fixed button size */}
                        <Button
                          variant="ghost"
                          size="default"
                          className="w-full"
                          onClick={() => router.push(`/car/${booking.carId}`)}
                        >
                          View Car Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Test Drive</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this test drive booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {bookingToCancel && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">
                  {bookingToCancel.car?.year} {bookingToCancel.car?.make} {bookingToCancel.car?.model}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(bookingToCancel).fullDate} • {formatDateTime(bookingToCancel).time}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cancellation Reason (Optional)</label>
                <textarea
                  className="w-full min-h-20 p-2 border rounded-md text-sm"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Cancellations made less than 24 hours before the scheduled time may be subject to a cancellation fee.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false)
                setBookingToCancel(null)
                setCancelReason('')
              }}
              className="flex-1"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancellingId !== null}
              className="flex-1"
            >
              {cancellingId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

