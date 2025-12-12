import React from 'react'
import CarsList from './_components/CarsList'


export const metadata = {
    title: "Cars | EastRide",
    description:"Manage cars available in your dealership's inventory.",
}

const CarsPage = () => {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">
            Cars Inventory Management
        </h1>


<CarsList />


    </div>
  )
}

export default CarsPage