import React from 'react'
import { redirect } from 'next/navigation'
import { getCarById } from '@/app/actions/cars'
import { getCurrentUser } from '@/lib/auth-utils'
import { checkUserTestDrive } from '@/app/actions/test-drives'
import TestDriveBookingForm from '@/components/forms/TestDriveBookingForm'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const { id } = await params
    const result = await getCarById(id)

    if (result.success && result.data) {
      const car = result.data
      return {
        title: `Book Test Drive - ${car.year} ${car.make} ${car.model} | EastRide`,
        description: `Schedule a test drive for the ${car.year} ${car.make} ${car.model}. Experience the thrill before you buy.`,
        openGraph: {
          title: `Book Test Drive - ${car.year} ${car.make} ${car.model} | EastRide`,
          description: `Schedule a test drive for the ${car.year} ${car.make} ${car.model}. Experience the thrill before you buy.`,
          type: 'website',
          images: car.images?.[0] ? [car.images[0]] : [],
        },
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  return {
    title: 'Book Test Drive | EastRide',
    description: 'Schedule a test drive for your favorite cars on EastRide.',
  }
}

const TestDrivePage = async ({ params }: PageProps) => {
  const { id } = await params

  // Auth check
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Role check
  const userRole = (user as any)?.role
  if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            Admins and Super Admins cannot book test drives.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Fetch car
  const carResult = await getCarById(id)
  if (!carResult.success || !carResult.data) {
    return (
      <div className="padded">
        <Alert variant="destructive">
          <AlertDescription>
            {carResult.error || 'Car not found'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const car = carResult.data

  // Availability check
  if (car.status !== 'AVAILABLE') {
    return (
      <div className="padded">
        <Alert variant="destructive">
          <AlertDescription>
            This car is currently {car.status.toLowerCase()} and not available for test drives.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href={`/car/${car.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Car Details
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Booking check
  const bookingCheck = await checkUserTestDrive(id)

  return (
    <div className="padded pb-8">
      {/* Back */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href={`/car/${car.id}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Car Details
        </Link>
      </Button>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Car Info */}
        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Book a Test Drive</h1>

            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src={car.images?.[0] || '/placeholder.jpg'}
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-semibold">
                  {car.year} {car.make} {car.model}
                </h2>
                <p className="text-2xl font-bold text-primary mt-1">
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0,
                  }).format(car.price)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Body Type</p>
                  <p className="font-medium">{car.bodyType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{car.color}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fuel Type</p>
                  <p className="font-medium">{car.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p className="font-medium">{car.transmission}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-medium">{car.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{car.seats || 5}</p>
                </div>
              </div>
            </div>

            {car.dealership && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Dealership Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{car.dealership.name}</p>
                  <p className="text-muted-foreground">{car.dealership.address}</p>
                  <p className="text-muted-foreground">{car.dealership.phone}</p>
                  <p className="text-muted-foreground">{car.dealership.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card className='bg-gray-50 dark:bg-gray-900'>
          <CardContent className="p-6">
            {bookingCheck.hasBooked && bookingCheck.booking ? (
              <div className="space-y-6">
                <Alert>
                  <AlertDescription>
                    You already have a{' '}
                    {bookingCheck.booking.status.toLowerCase()} test drive booking
                    for this car on{' '}
                    {new Date(bookingCheck.bookingDate!).toLocaleDateString()} at{' '}
                    {bookingCheck.booking.startTime}.
                  </AlertDescription>
                </Alert>

                <TestDriveBookingForm
                  carId={car.id}
                  car={{
                    make: car.make,
                    model: car.model,
                    year: car.year,
                  }}
                  dealershipHours={car.dealership?.hours}
                  dealershipName={car.dealership?.name || 'EastRide Motors'}
                  isAlreadyBooked={true}
                  existingBooking={{
                    bookingDate: new Date(bookingCheck.bookingDate!)
                      .toISOString()
                      .split('T')[0], 
                    startTime: bookingCheck.booking.startTime,
                    endTime: bookingCheck.booking.endTime,
                  }}
                />
              </div>
            ) : (
              <TestDriveBookingForm
                carId={car.id}
                car={{
                  make: car.make,
                  model: car.model,
                  year: car.year,
                }}
                dealershipHours={car.dealership?.hours}
                dealershipName={car.dealership?.name || 'EastRide Motors'}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestDrivePage


