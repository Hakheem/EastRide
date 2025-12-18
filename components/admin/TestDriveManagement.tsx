"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Clock, Car, MapPin, X, Loader2, AlertCircle, CheckCircle, Clock4, User, Search, Filter, MoreVertical, Eye, Phone, Mail, CalendarCheck, CalendarX, Download, ClockAlert, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { getAllTestDrives, updateBookingStatus } from '@/app/actions/test-drives'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { format, isPast, isToday, parseISO } from 'date-fns'

interface TestDriveManagementProps {
  title?: string
  description?: string
}

export default function TestDriveManagement({ 
  title = "Test Drive Bookings",
  description = "Manage all test drive bookings across the dealership"
}: TestDriveManagementProps) {
  const router = useRouter()
  const [bookings, setBookings] = useState<TestDriveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const [dateFilter, setDateFilter] = useState<'ALL' | 'UPCOMING' | 'PAST' | 'TODAY'>('ALL')
  const [selectedBooking, setSelectedBooking] = useState<TestDriveBooking | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(BookingStatus.PENDING)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchBookings = async () => {
    try {
      const filters: any = {}
      if (statusFilter !== 'ALL') {
        filters.status = statusFilter
      }
      
      const result = await getAllTestDrives(filters)
      if (result.success && result.data) {
        setBookings(result.data as unknown as TestDriveBooking[])
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
  }, [statusFilter])

  // Helper function to check if booking date has passed
  const isBookingDatePassed = (booking: TestDriveBooking): boolean => {
    const bookingDate = new Date(booking.bookingDate)
    // Add end time to the date to compare with current time
    const [hours, minutes] = booking.endTime.split(':').map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)
    return isPast(bookingDate)
  }

  // Helper function to check if booking is today
  const isBookingToday = (booking: TestDriveBooking): boolean => {
    const bookingDate = new Date(booking.bookingDate)
    return isToday(bookingDate)
  }

  // Helper function to check if booking is upcoming
  const isBookingUpcoming = (booking: TestDriveBooking): boolean => {
    return !isBookingDatePassed(booking) && !isBookingToday(booking)
  }

  // Filter bookings based on search term and date filter
  const filteredBookings = bookings.filter(booking => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        booking.car?.make?.toLowerCase().includes(searchLower) ||
        booking.car?.model?.toLowerCase().includes(searchLower) ||
        booking.user?.name?.toLowerCase().includes(searchLower) ||
        booking.user?.email?.toLowerCase().includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }

    // Apply date filter
    switch (dateFilter) {
      case 'UPCOMING':
        return isBookingUpcoming(booking)
      case 'PAST':
        return isBookingDatePassed(booking)
      case 'TODAY':
        return isBookingToday(booking)
      case 'ALL':
      default:
        return true
    }
  })

  const getStatusBadge = (status: BookingStatus) => {
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

  const getDateBadge = (booking: TestDriveBooking) => {
    if (isBookingDatePassed(booking)) {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
          <CalendarX className="w-3 h-3 mr-1" />
          Past
        </Badge>
      )
    } else if (isBookingToday(booking)) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
          <CalendarClock className="w-3 h-3 mr-1" />
          Today
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CalendarCheck className="w-3 h-3 mr-1" />
          Upcoming
        </Badge>
      )
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedBooking) return

    // Validate status changes for past bookings
    if (isBookingDatePassed(selectedBooking)) {
      const allowedPastStatuses: BookingStatus[] = ['COMPLETED', 'NO_SHOW', 'CANCELLED']
      if (!allowedPastStatuses.includes(selectedStatus)) {
        toast.error('Past bookings can only be marked as Completed, No Show, or Cancelled')
        return
      }
    }

    setUpdatingStatus(true)
    try {
      const result = await updateBookingStatus(selectedBooking.id, selectedStatus, adminNotes)
      if (result.success) {
        toast.success(result.message || 'Status updated successfully')
        fetchBookings() // Refresh the list
        setShowStatusDialog(false)
        setAdminNotes('')
        setSelectedBooking(null)
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const openStatusDialog = (booking: TestDriveBooking, status: BookingStatus) => {
    setSelectedBooking(booking)
    setSelectedStatus(status)
    setShowStatusDialog(true)
  }

  const openDetailsDialog = (booking: TestDriveBooking) => {
    setSelectedBooking(booking)
    setShowDetailsDialog(true)
  }

  const formatDateTime = (booking: TestDriveBooking) => {
    const bookingDate = new Date(booking.bookingDate)
    return {
      date: bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      time: `${booking.startTime} - ${booking.endTime}`,
      dateTime: `${format(bookingDate, 'MMM d, yyyy')} • ${booking.startTime} - ${booking.endTime}`
    }
  }

  const getStatusCount = (status: BookingStatus) => {
    return bookings.filter(b => b.status === status).length
  }

  const getDateCount = (type: 'UPCOMING' | 'PAST' | 'TODAY') => {
    switch (type) {
      case 'UPCOMING':
        return bookings.filter(b => isBookingUpcoming(b)).length
      case 'PAST':
        return bookings.filter(b => isBookingDatePassed(b)).length
      case 'TODAY':
        return bookings.filter(b => isBookingToday(b)).length
      default:
        return 0
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Car', 'Customer', 'Email', 'Date', 'Time', 'Status', 'Date Status', 'Notes']
    const csvData = filteredBookings.map(booking => [
      booking.id,
      `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`,
      booking.user?.name || 'N/A',
      booking.user?.email || 'N/A',
      format(new Date(booking.bookingDate), 'yyyy-MM-dd'),
      `${booking.startTime} - ${booking.endTime}`,
      booking.status,
      isBookingDatePassed(booking) ? 'PAST' : isBookingToday(booking) ? 'TODAY' : 'UPCOMING',
      booking.notes?.replace(/,/g, ';') || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-drives-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }
 
  return (
    <div className="space-y-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold">{getDateCount('UPCOMING')}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
                <CalendarCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold">{getDateCount('TODAY')}</p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full">
                <CalendarClock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Past</p>
                <p className="text-2xl font-bold">{getDateCount('PAST')}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-full">
                <CalendarX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search" className="sr-only">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by car, customer, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BookingStatus | 'ALL')}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-900">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={BookingStatus.PENDING} className="cursor-pointer">Pending</SelectItem>
              <SelectItem value={BookingStatus.CONFIRMED} className="cursor-pointer">Confirmed</SelectItem>
              <SelectItem value={BookingStatus.COMPLETED} className="cursor-pointer">Completed</SelectItem>
              <SelectItem value={BookingStatus.CANCELLED} className="cursor-pointer">Cancelled</SelectItem>
              <SelectItem value={BookingStatus.NO_SHOW} className="cursor-pointer">No Show</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
            <SelectTrigger className="bg-gray-50 dark:bg-gray-900">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-900">
              <SelectItem value="ALL">All Dates</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="TODAY">Today</SelectItem>
              <SelectItem value="PAST">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchBookings} variant="outline" className="flex-1 bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No bookings found{searchTerm ? ` for "${searchTerm}"` : ''}. Try changing your filters.
            </AlertDescription>
          </Alert>
        ) : (
          filteredBookings.map((booking) => {
            const { dateTime } = formatDateTime(booking)
            const isPastBooking = isBookingDatePassed(booking)
            const isTodayBooking = isBookingToday(booking)
            
            return (
              <Card key={booking.id} className={`bg-gray-50 dark:bg-gray-900 ${isPastBooking ? 'opacity-80' : ''}`}>
                <CardContent className="">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Car Image */}
                    <div className="relative h-40 lg:h-32 lg:w-48 flex-shrink-0 rounded-lg overflow-hidden">
                      {booking.car?.images?.[0] ? (
                        <Image
                          src={booking.car.images[0]}
                          alt={`${booking.car.make} ${booking.car.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 192px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                          <Car className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {isPastBooking && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <ClockAlert className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {booking.car?.year} {booking.car?.make} {booking.car?.model}
                            </h3>
                            {getStatusBadge(booking.status)}
                            {getDateBadge(booking)}
                          </div>
                          
                          <div className="flex flex-col space-y-3">
                            <div>
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium">Date & Time:</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {dateTime}
                                {isPastBooking && (
                                  <span className="ml-2 text-xs text-gray-500">(Passed)</span>
                                )}
                                {isTodayBooking && (
                                  <span className="ml-2 text-xs text-orange-500">(Today)</span>
                                )}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <User className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium">Customer:</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {booking.user?.name || 'No name'} • {booking.user?.email}
                              </p>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1">Customer Notes:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                {booking.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions Dropdown */}
                        <div className="flex lg:flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(booking)}
                            className="flex-1 lg:flex-none"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                disabled={isPastBooking && booking.status === 'CANCELLED'}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                {isPastBooking ? 'Past Booking Actions' : 'Update Status'}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              {/* Show appropriate status options based on date */}
                              {!isPastBooking ? (
                                <>
                                  {/* Options for upcoming/today bookings */}
                                  {booking.status === 'PENDING' && (
                                    <DropdownMenuItem onClick={() => openStatusDialog(booking, BookingStatus.CONFIRMED)}>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                      Confirm Booking
                                    </DropdownMenuItem>
                                  )}
                                  {booking.status === 'CONFIRMED' && (
                                    <DropdownMenuItem onClick={() => openStatusDialog(booking, BookingStatus.COMPLETED)}>
                                      <CalendarCheck className="w-4 h-4 mr-2 text-blue-600" />
                                      Mark as Completed
                                    </DropdownMenuItem>
                                  )}
                                </>
                              ) : (
                                <>
                                  {/* Options for past bookings */}
                                  {booking.status !== 'COMPLETED' && booking.status !== 'NO_SHOW' && booking.status !== 'CANCELLED' && (
                                    <>
                                      <DropdownMenuItem onClick={() => openStatusDialog(booking, BookingStatus.COMPLETED)}>
                                        <CalendarCheck className="w-4 h-4 mr-2 text-blue-600" />
                                        Mark as Completed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => openStatusDialog(booking, BookingStatus.NO_SHOW)}>
                                        <X className="w-4 h-4 mr-2 text-gray-600" />
                                        Mark as No Show
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
                              
                              {/* Cancellation option (available for most statuses except cancelled) */}
                              {(booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.status !== 'NO_SHOW') && (
                                <DropdownMenuItem 
                                  onClick={() => openStatusDialog(booking, BookingStatus.CANCELLED)}
                                  className="text-red-600"
                                >
                                  <CalendarX className="w-4 h-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => router.push(`/car/${booking.carId}`)}>
                                <Car className="w-4 h-4 mr-2" />
                                View Car
                              </DropdownMenuItem>
                              {booking.user?.email && (
                                <DropdownMenuItem onClick={() => window.location.href = `mailto:${booking.user?.email}`}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email Customer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for booking #{selectedBooking?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Car Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Car Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Car</p>
                      <p className="font-medium">
                        {selectedBooking.car?.year} {selectedBooking.car?.make} {selectedBooking.car?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                      <p className="font-medium">
                        {selectedBooking.car?.price ? new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: 'KES',
                          minimumFractionDigits: 0,
                        }).format(selectedBooking.car.price) : 'N/A'}
                      </p>
                    </div>
                    {selectedBooking.car?.dealership && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dealership</p>
                        <p className="font-medium">{selectedBooking.car.dealership.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium">{selectedBooking.user?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium">{selectedBooking.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Booking Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                      <p className="font-medium">{formatDateTime(selectedBooking).dateTime}</p>
                      <div className="mt-1">{getDateBadge(selectedBooking)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                      <p className="font-medium text-sm font-mono">{selectedBooking.id}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact & Actions
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.location.href = `mailto:${selectedBooking.user?.email}`}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Customer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/car/${selectedBooking.carId}`)}
                    >
                      <Car className="w-4 h-4 mr-2" />
                      View Car Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Customer Notes</h3>
                  <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Created Date */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Booking created on {format(new Date(selectedBooking.createdAt), 'PPpp')}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Update the status of this test drive booking.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="font-medium">
                  {selectedBooking.car?.year} {selectedBooking.car?.make} {selectedBooking.car?.model}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(selectedBooking).dateTime}
                  {isBookingDatePassed(selectedBooking) && (
                    <span className="ml-2 text-red-500">(Date has passed)</span>
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customer: {selectedBooking.user?.name || 'N/A'} ({selectedBooking.user?.email})
                </p>
              </div>

              <div className="space-y-2">
                <Label>New Status</Label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
                  disabled={isBookingDatePassed(selectedBooking) && selectedStatus === 'CONFIRMED'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      value={BookingStatus.PENDING}
                      disabled={isBookingDatePassed(selectedBooking)}
                    >
                      Pending {isBookingDatePassed(selectedBooking) && '(Not allowed for past bookings)'}
                    </SelectItem>
                    <SelectItem 
                      value={BookingStatus.CONFIRMED}
                      disabled={isBookingDatePassed(selectedBooking)}
                    >
                      Confirmed {isBookingDatePassed(selectedBooking) && '(Not allowed for past bookings)'}
                    </SelectItem>
                    <SelectItem value={BookingStatus.COMPLETED}>
                      Completed
                    </SelectItem>
                    <SelectItem value={BookingStatus.CANCELLED}>
                      Cancelled
                    </SelectItem>
                    <SelectItem value={BookingStatus.NO_SHOW}>
                      No Show
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isBookingDatePassed(selectedBooking) && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Note: Past bookings can only be marked as Completed, Cancelled, or No Show.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any notes about this status change..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updatingStatus}>
              {updatingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

