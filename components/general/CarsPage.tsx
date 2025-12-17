'use client'

import React, { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CarsPageProps {
    title: string;
    description: string;
    CarsList: React.ComponentType<any>;
    CarsContent: React.ComponentType<any>;
}

// Loading fallback component for the table content
function CarsContentFallback() {
    return (
        <div className="space-y-4 mt-6">
            <Skeleton className="h-4 w-48" />
            <div className="rounded-md border">
                <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={`content-fallback-${i}`} className="flex items-center gap-4">
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

// Loading fallback component for the search/filter list
function CarsListFallback() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 w-full">
            <Skeleton className="h-10 w-full sm:w-auto flex-1" />
            <Skeleton className="h-10 w-full sm:w-44" />
        </div>
    )
}

export default function CarsPage({ title, description, CarsList, CarsContent }: CarsPageProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
            </div>

            <Card className='bg-gray-50 dark:bg-gray-900'>
                <CardContent className="pt-6">
                    <Suspense fallback={<CarsListFallback />}><CarsList /></Suspense>
                    <Suspense fallback={<CarsContentFallback />}><CarsContent /></Suspense>
                </CardContent>
            </Card>
        </div>
    )
}