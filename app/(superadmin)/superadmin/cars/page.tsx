'use client'

import React, { Suspense } from 'react'
import CarsList from './_components/CarsList'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import CarsContent from './CarsContent'

// Loading fallback component
function CarsContentFallback() {
    return (
        <div className="space-y-4 mt-6">
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
    )
}

// Main page component
export default function SuperAdminCarsPage() {
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
                    <Suspense fallback={<CarsListFallback />}>
                        <CarsList />
                    </Suspense>

                    <Suspense fallback={<CarsContentFallback />}>
                        <CarsContent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    )
}

function CarsListFallback() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
            <Skeleton className="h-10 w-full sm:w-auto flex-1" />
            <Skeleton className="h-10 w-full sm:w-44" />
        </div>
    )
}
