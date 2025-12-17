'use client'

import React, { useEffect, useState } from 'react'
import CarsTable from './_components/CarsTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllCars } from "../../../actions/cars"
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function CarsContent() {
    const searchParams = useSearchParams()
    const [cars, setCars] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true)
                const page = parseInt(searchParams.get('page') || '1')
                const limit = 10

                // Convert null values to undefined
                const statusParam = searchParams.get('status')
                const featuredParam = searchParams.get('featured')
                const makeParam = searchParams.get('q')
                const minPriceParam = searchParams.get('minPrice')
                const maxPriceParam = searchParams.get('maxPrice')

                const result = await getAllCars(page, limit, {
                    status: statusParam ? statusParam as any : undefined,
                    featured: featuredParam ? featuredParam === 'true' : undefined,
                    make: makeParam || undefined,
                    minPrice: minPriceParam ? parseInt(minPriceParam) : undefined,
                    maxPrice: maxPriceParam ? parseInt(maxPriceParam) : undefined,
                })

                if (result.success) {
                    const transformedCars = result.data?.cars.map((car: any) => ({
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
                    })) || []
                    
                    setCars(transformedCars)
                    setPagination(result.data?.pagination || {
                        page,
                        limit,
                        total: 0,
                        totalPages: 0
                    })
                } else {
                    setError(result.error || 'Unknown error')
                }
            } catch (err) {
                setError('Failed to fetch cars')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchCars()
    }, [searchParams])

    if (loading) {
        return (
            <div className="space-y-4 mt-6">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-64 w-full rounded-md" />
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mt-6">
                <AlertDescription>
                    Error loading cars: {error}
                </AlertDescription>
            </Alert>
        )
    }

    const params = Object.fromEntries(searchParams.entries())

    return (
        <>
            {cars.length > 0 ? (
                <CarsTable 
                    cars={cars}
                    pagination={pagination}
                    searchParams={params}
                />
            ) : (
                <div className="text-center py-12 border rounded-lg mt-6">
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
        </>
    )
}
