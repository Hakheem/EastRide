'use client'

import React from 'react'
import CarsList from './_components/CarsList'
import CarsContent from './CarsContent'
import CarsPage from '@/components/general/CarsPage'

// Main page component
export default function SuperAdminCarsPage() {
    return (
        <CarsPage
            title="Super Admin - Cars Inventory Management"
            description="Manage all dealership car listings, update status, and mark featured vehicles"
            CarsList={CarsList}
            CarsContent={CarsContent}
        />
    )
}
