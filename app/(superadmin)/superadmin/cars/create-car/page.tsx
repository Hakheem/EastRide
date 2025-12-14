
import React from 'react'
import AddCarForm from '../_components/AddCarForm'


export const metadata = {
  title: "Add New Car  | EastRide",
  description: "Add a new car to your dealership's inventory.",
}

const CreateCar = () => {
  return (
    <div>
      <AddCarForm />
    </div>
  )
}

export default CreateCar