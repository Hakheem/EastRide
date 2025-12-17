import React, { Suspense } from 'react'
import CarsList from './_components/CarsList'
import CarsTable from './_components/CarsTable'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllCars } from "../../../actions/cars"
import { Skeleton } from '@/components/ui/skeleton' // Add a skeleton component

export const metadata = {
    title: "Cars | EastRide",
    description: "Manage cars available in your dealership's inventory.",
}

interface PageProps {
    searchParams?: {
        q?: string
        status?: string
        featured?: string
        minPrice?: string
        maxPrice?: string
        page?: string
    }
}

const CarsPage = async ({ searchParams = {} }: PageProps) => {
    const page = parseInt(searchParams.page || '1')
    const limit = 10

    // Fetch cars with search params
    const result = await getAllCars(page, limit, {
        status: searchParams.status as any,
        featured: searchParams.featured ? searchParams.featured === 'true' : undefined,
        make: searchParams.q,
        minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    })

    if (!result.success) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Cars Inventory Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your car listings, update status, and mark featured vehicles
                    </p>
                </div>
                <Alert variant="destructive">
                    <AlertDescription>
                        Error loading cars: {result.error || 'Unknown error'}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Safely extract data
    const cars = result.data?.cars || []
    const pagination = result.data?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0
    }

    // Transform the cars data to match CarsTable interface
    const transformedCars = cars.map(car => ({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        price: car.price,
        mileage: car.mileage,
        color: car.color,
        status: car.status,
        featured: car.featured,
        images: car.images,
        createdAt: car.createdAt.toISOString(),
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Cars Inventory Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your car listings, update status, and mark featured vehicles
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {/* Wrap CarsList with Suspense */}
                    <Suspense fallback={
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    }>
                        <CarsList />
                    </Suspense>
                    
                    {/* Cars Table Component */}
                    {transformedCars.length > 0 ? (
                        <CarsTable 
                            cars={transformedCars}
                            pagination={pagination}
                            searchParams={searchParams}
                        />
                    ) : (
                        <div className="text-center py-12 border rounded-lg mt-4">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchParams.q ? `No cars found for "${searchParams.q}"` : 'No cars found'}
                            </p>
                            {searchParams.q && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Try searching with different keywords
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default CarsPage

