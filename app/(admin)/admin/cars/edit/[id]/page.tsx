// app/admin/cars/edit/[id]/page.tsx
import React from 'react'
import { notFound } from 'next/navigation'
import { getCarById } from '@/app/actions/cars'
import EditCarForm from './_components/EditCarForm'

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
            title: 'Edit Car | EastRide',
        }
    }

    const car = result.data

    return {
        title: `Edit ${car.make} ${car.model} | EastRide`,
        description: `Edit details for ${car.year} ${car.make} ${car.model}`,
    }
}

export default async function EditCarPage({ params }: PageProps) {
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

    return <EditCarForm car={car} />
}

