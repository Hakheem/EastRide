'use client'

import React, { useEffect, useState } from 'react'
import CarsList from './_components/CarsList'
import CarsTable from './_components/CarsTable'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getAllCars } from "../../../actions/cars"
import { useSearchParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

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

const SuperAdminCarsPage = ({ searchParams: initialParams }: PageProps) => {
    const routerSearchParams = useSearchParams()
    const [cars, setCars] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Combine initial params from props and URL search params
    const getSearchParams = () => {
        const params: Record<string, string> = {}
        
        // First, get from URL search params (most current)
        if (routerSearchParams) {
            routerSearchParams.forEach((value, key) => {
                params[key] = value
            })
        }
        
        // Then, override with initial props if provided
        if (initialParams) {
            Object.entries(initialParams).forEach(([key, value]) => {
                if (value !== undefined) params[key] = value
            })
        }
        
        return params
    }

    useEffect(() => {
        const fetchCars = async () => {
            try {
                setLoading(true)
                const params = getSearchParams()
                const page = parseInt(params.page || '1')
                const limit = 10

                const result = await getAllCars(page, limit, {
                    status: params.status as any,
                    featured: params.featured ? params.featured === 'true' : undefined,
                    make: params.q,
                    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
                    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
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
    }, [routerSearchParams, initialParams])

    const params = getSearchParams()

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Super Admin - Cars Inventory Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage all dealership car listings, update status, and mark featured vehicles
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {/* Loading skeleton for CarsList */}
                        <div className="space-y-4 mb-6">
                            <Skeleton className="h-12 w-full" />
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Skeleton className="h-10 w-full sm:w-64" />
                                <Skeleton className="h-10 w-full sm:w-48" />
                            </div>
                        </div>
                        
                        {/* Loading skeleton for table */}
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-48" />
                            <div className="rounded-md border">
                                <div className="p-4 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-4 w-16" />
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Super Admin - Cars Inventory Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage all dealership car listings, update status, and mark featured vehicles
                    </p>
                </div>
                <Alert variant="destructive">
                    <AlertDescription>
                        Error loading cars: {error}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Super Admin - Cars Inventory Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage all dealership car listings, update status, and mark featured vehicles
                </p>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <CarsList />
                    
                    {/* Cars Table Component */}
                    {cars.length > 0 ? (
                        <CarsTable 
                            cars={cars}
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

export default SuperAdminCarsPage

