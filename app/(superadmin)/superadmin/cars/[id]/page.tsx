// app/(admin)/superadmin/cars/[id]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import { getCarById } from '@/app/actions/cars'
import CarDetailsClient from './_components/CarDetailsClient'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata({ params }: PageProps) {
    const resolvedParams = await params
    const result = await getCarById(resolvedParams.id)
    
    if (!result.success || !result.data) {
        return {
            title: 'Car Not Found | EastRide',
        }
    }

    const car = result.data

    return {
        title: `${car.make} ${car.model} ${car.year} | EastRide`,
        description: car.description || `View details for this ${car.year} ${car.make} ${car.model}`,
    }
}

export default async function CarDetailsPage({ params }: PageProps) {
    // Await params in Next.js 15+
    const resolvedParams = await params
    const result = await getCarById(resolvedParams.id)

    if (!result.success || !result.data) {
        notFound()
    }

    // Transform the data to match the Car interface
    const car = {
        ...result.data,
        seats: result.data.seats ?? 5,
        description: result.data.description ?? null,
    }

    return <CarDetailsClient car={car} />
}

