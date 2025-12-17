import React from 'react'
import CarsList from './_components/CarsList'
import CarsTable from './_components/CarsTable'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {getAllCars} from "../../../actions/cars"

export const metadata = {
    title: "Cars | EastRide",
    description: "Manage cars available in your dealership's inventory.",
}

interface PageProps {
    searchParams?: Promise<{
        q?: string
        status?: string
        featured?: string
        minPrice?: string
        maxPrice?: string
        page?: string
    }>
}

const CarsPage = async ({ searchParams }: PageProps) => {
    // Await searchParams in Next.js 15+
    const params = await searchParams || {}
    
    const page = parseInt(params.page || '1')
    const limit = 10

    // Fetch cars with search params
    const result = await getAllCars(page, limit, {
        status: params.status as any,
        featured: params.featured ? params.featured === 'true' : undefined,
        make: params.q,
        minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
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
        <div className="space-y-6 mb-8">
            <div>
                <h1 className="text-3xl font-bold">Cars Inventory Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage your car listings, update status, and mark featured vehicles
                </p>
            </div>

            <Card className='bg-gray-50 dark:bg-gray-900' >
                <CardContent className="pt-6">
                    <CarsList />
                    
                    {/* Cars Table Component */}
                    {transformedCars.length > 0 ? (
                        <CarsTable 
                            cars={transformedCars}
                            pagination={pagination}
                            searchParams={params}
                        />
                    ) : (
                        <div className="text-center py-12 border rounded-lg mt-4">
                            <p className="text-gray-500 dark:text-gray-400">
                                {params.q ? `No cars found for "${params.q}"` : 'No cars found'}
                            </p>
                            {params.q && (
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

