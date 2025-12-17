"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, Loader2, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { bookTestDrive } from '@/app/actions/test-drives'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import Link from 'next/link'

// Zod schema for validation
const testDriveSchema = z.object({
  bookingDate: z.string().min(1, "Booking date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  notes: z.string().optional(),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true
  
  const [startHours, startMinutes] = data.startTime.split(':').map(Number)
  const [endHours, endMinutes] = data.endTime.split(':').map(Number)
  
  const startTotal = startHours * 60 + startMinutes
  const endTotal = endHours * 60 + endMinutes
  
  const duration = endTotal - startTotal
  return duration >= 30 && duration <= 60
}, {
  message: "Test drive must be between 30 minutes and 1 hour",
  path: ["endTime"]
})

type TestDriveFormData = z.infer<typeof testDriveSchema>

interface TestDriveBookingFormProps {
  carId: string
  car?: {
    make: string
    model: string
    year: number
  }
  dealershipHours?: Record<string, string>
  dealershipName?: string
  isAlreadyBooked?: boolean
  existingBooking?: {
    bookingDate: string
    startTime: string
    endTime: string
  }
}

export default function TestDriveBookingForm({ 
  carId, 
  car,
  dealershipHours,
  dealershipName = "EastRide Motors",
  isAlreadyBooked = false,
  existingBooking 
}: TestDriveBookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<TestDriveFormData>({
    resolver: zodResolver(testDriveSchema),
    mode: 'onChange',
    defaultValues: {
      bookingDate: '',
      startTime: '',
      endTime: '',
      notes: ''
    }
  })

  const startTime = watch('startTime')
  const bookingDate = watch('bookingDate')

  // Auto-calculate end time (1 hour after start by default)
  useEffect(() => {
    if (startTime && !isAlreadyBooked) {
      const [hours, minutes] = startTime.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(hours, minutes + 60)
      
      const endHours = String(endDate.getHours()).padStart(2, '0')
      const endMinutes = String(endDate.getMinutes()).padStart(2, '0')
      const endTime = `${endHours}:${endMinutes}`
      
      setValue('endTime', endTime, { shouldValidate: true })
    }
  }, [startTime, setValue, isAlreadyBooked])

  // If user already booked, populate form with existing data
  useEffect(() => {
    if (isAlreadyBooked && existingBooking) {
      reset({
        bookingDate: existingBooking.bookingDate,
        startTime: existingBooking.startTime,
        endTime: existingBooking.endTime,
        notes: ''
      })
    }
  }, [isAlreadyBooked, existingBooking, reset])

  // Format and sort working hours
  const formatWorkingHours = () => {
    if (!dealershipHours) return null
    
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    return Object.entries(dealershipHours)
      .sort(([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB))
      .map(([day, hours]) => ({
        day,
        formattedDay: formatDayName(day),
        hours
      }))
  }

  const formatDayName = (day: string) => {
    const days: Record<string, string> = {
      monday: "Monday",
      tuesday: "Tuesday", 
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    }
    return days[day] || day.charAt(0).toUpperCase() + day.slice(1)
  }

  const onSubmit = async (data: TestDriveFormData) => {
    if (isAlreadyBooked) {
      router.push('/reservations')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await bookTestDrive({
        carId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
      })

      if (result.success) {
        // Store booking details for success dialog
        setBookingDetails({
          car: result.data?.car || car,
          date: data.bookingDate,
          time: `${data.startTime} - ${data.endTime}`,
          dealership: dealershipName,
          bookingId: result.data?.id
        })
        
        // Show success toast
        toast.success('Test Drive Booked Successfully!', {
          description: 'Your test drive has been scheduled. Please check your email for confirmation.',
          duration: 5000,
        })
        
        // Show success dialog
        setShowSuccessDialog(true)
        
        // Reset form
        reset()
      } else if (result.requiresAuth) {
        toast.error('Please login to continue')
        router.push('/login')
      } else {
        toast.error(result.error || 'Failed to book test drive')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  const formattedHours = formatWorkingHours()

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Schedule Your Test Drive</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Fill in the details below to book your test drive. We'll confirm your booking shortly.
          </p>
        </div>

        {/* Dealership Hours Info */}
        {dealershipHours && (
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Dealership Hours:</p>
              <div className="grid grid-cols-2 gap-2  text-xs">
                {formattedHours?.map(({ day, formattedDay, hours }) => (
                  <div key={day}>
                    <span className="font-medium capitalize">{formattedDay}:</span> {hours}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="bookingDate" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Preferred Date *
          </Label>
          <Input
            id="bookingDate"
            type="date"
            min={today}
            disabled={isSubmitting || isAlreadyBooked}
            {...register('bookingDate')}
          />
          {errors.bookingDate && (
            <p className="text-sm text-red-500">{errors.bookingDate.message}</p>
          )}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Start Time *
            </Label>
            <Input
              id="startTime"
              type="time"
              disabled={isSubmitting || isAlreadyBooked}
              {...register('startTime')}
            />
            {errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              disabled={isSubmitting || isAlreadyBooked}
              {...register('endTime')}
            />
           
            {errors.endTime && (
              <p className="text-sm text-red-500">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any specific questions or requirements?"
            disabled={isSubmitting || isAlreadyBooked}
            {...register('notes')}
            rows={3}
          />
        </div>

        {/* Important Information */}
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Important Information:</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Test drives are between 30 minutes and 1 hour</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Please arrive 10 minutes before your scheduled time</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Valid driver's license must be presented at arrival</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Maximum 2 bookings per hour slot</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600 dark:text-gray-400">Bookings are subject to confirmation via email</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
          By booking, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            terms and conditions
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            privacy policy
          </Link>
        </p>

        {/* Buttons */}
        {isAlreadyBooked ? (
          <div className="flex gap-4 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/car/${carId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Car Details
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/reservations">
                View My Bookings
              </Link>
            </Button>
          </div>
        ) : (
          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Calendar className="w-5 h-5 mr-2" />
                Book Test Drive
              </>
            )}
          </Button>
        )}
      </form>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Test Drive Booked Successfully!
            </DialogTitle>
            <DialogDescription>
              Your test drive has been scheduled. Please check your email for confirmation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Car</p>
                <p className="font-medium">
                  {bookingDetails?.car ? `${bookingDetails.car.year} ${bookingDetails.car.make} ${bookingDetails.car.model}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium">
                  {bookingDetails?.date ? new Date(bookingDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Slot</p>
                <p className="font-medium">{bookingDetails?.time || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dealership</p>
                <p className="font-medium">{bookingDetails?.dealership || 'N/A'}</p>
              </div>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Important Reminders:</p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Please arrive 10 minutes before your scheduled time</li>
                  <li>• Bring a valid driver's license (must be presented)</li>
                  <li>• Your booking confirmation has been sent to your email</li>
                  <li>• Contact us if you need to reschedule or cancel</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSuccessDialog(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false)
                router.push('/reservations')
              }}
              className="flex-1"
            >
              View My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

