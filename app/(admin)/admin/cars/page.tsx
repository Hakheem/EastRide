'use client'

import React from 'react'
import CarsList from './_components/CarsList'
import CarsContent from './CarsContent'
import CarsPage from '@/components/general/CarsPage'


// Main page component
export default function AdminCarsPage() {
    return (
        <CarsPage
            title="Cars Inventory Management"
            description="Manage your car listings, update status, and mark featured vehicles"
            CarsList={CarsList}
            CarsContent={CarsContent}
        />
    )
}
