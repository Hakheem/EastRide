'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManualAddCarForm } from '@/components/forms/ManualAddCarForm'
import { AIUploadCarForm } from '@/components/forms/AIUploadCardForm'
import { toast } from 'sonner'

// Helper to preprocess string to number
const preprocessNumber = (val: unknown): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Define the form schema with proper preprocessing
export const carFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.preprocess(
    preprocessNumber,
    z.number()
      .min(1900, "Year must be at least 1900")
      .max(new Date().getFullYear() + 1, "Year cannot be in the future")
  ),
  price: z.preprocess(
    preprocessNumber,
    z.number().positive("Price must be positive")
  ),
  mileage: z.preprocess(
    preprocessNumber,
    z.number().min(0, "Mileage cannot be negative")
  ),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.preprocess(
    preprocessNumber,
    z.number().min(1, "At least 1 seat required")
  ).default(5),
  description: z.string().min(10, "Description must be at least 10 characters").optional().default(""),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]).default("AVAILABLE"),
  featured: z.boolean().default(false),
  images: z.array(z.custom<File>()).min(1, "At least one image is required").max(10, "Maximum 10 images allowed")
})

// Infer the type from the schema
export type CarFormValues = z.input<typeof carFormSchema>

const AddCarForm = () => {
  const [activeTab, setActiveTab] = useState('manual')

  const handleSuccess = () => {
    toast.success('Car added successfully!')
    // You could redirect or refresh data here
  }

  return (
    <div className=" space-y-6 mb-6">
  <div>
                <h1 className="text-3xl font-bold">Create New Car </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Add a new car to your listings
                </p>
            </div>

      <Tabs 
        defaultValue="manual" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mt-6"
      >
        <TabsList className='w-full grid grid-cols-2 mx-auto'>
          <TabsTrigger 
            value="manual" 
            className="w-full cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Manual Entry
          </TabsTrigger>
          <TabsTrigger 
            value="ai" 
            className="w-full cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            AI Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className='mt-4 '>
          <ManualAddCarForm onSuccess={handleSuccess} />
        </TabsContent>
        
        <TabsContent value="ai" className='mt-4'>
          <AIUploadCarForm onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AddCarForm

