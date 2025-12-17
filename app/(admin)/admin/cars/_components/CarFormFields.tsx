import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CarFormValues } from './AddCarForm'


const BODY_TYPES = [
  { value: 'SUV', label: 'SUV' },
  { value: 'Sedan', label: 'Sedan' },
  { value: 'Hatchback', label: 'Hatchback' },
  { value: 'Coupe', label: 'Coupe' },
  { value: 'Coupe SUV', label: 'Coupe SUV' },
  { value: 'Convertible', label: 'Convertible' },
  { value: 'Muscle', label: 'Muscle' },
  { value: 'Wagon', label: 'Wagon' },
  { value: 'Pickup', label: 'Pick-up' },
  { value: 'Minivan', label: 'Minivan' },
  { value: 'Van', label: 'Van' },
  { value: 'Crossover', label: 'Crossover' },
  { value: 'Sports', label: 'Sports Car ' },
  { value: 'Hyper', label: 'Hyper Car ' },
  { value: 'Luxury', label: 'Luxury ' }, 
  { value: 'Luxury SUV', label: 'Luxury SUV' }, 
  { value: 'Off-road', label: 'Off-road ' },
  { value: 'Compact Car', label: 'Compact Car' },
  { value: 'Limousine', label: 'Limousine' },
  { value: 'Micro', label: 'Micro' },
  { value: 'MPV', label: 'MPV' },
] as const;

const FUEL_TYPES = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'CNG', label: 'CNG' },
] as const;

// Transmission Types Array (Aligned with your schema - these are stored as Strings in Car model)
const TRANSMISSION_TYPES = [
  { value: 'Automatic', label: 'Automatic' },
  { value: 'Manual', label: 'Manual' },
  { value: 'Semi-Automatic', label: 'Semi-Automatic' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DCT', label: 'DCT' },
  { value: 'AMT', label: 'AMT' },
  { value: 'IMT', label: 'IMT' },
] as const;

// Car Status Array (From your CarStatus enum)
const CAR_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'SOLD', label: 'Sold' },
] as const;

interface AIAnalysisResult {
  make?: string | number | boolean | null;
  model?: string | number | boolean | null;
  year?: string | number | boolean | null;
  price?: string | number | boolean | null;
  mileage?: string | number | boolean | null;
  color?: string | number | boolean | null;
  fuelType?: string | number | boolean | null;
  transmission?: string | number | boolean | null;
  bodyType?: string | number | boolean | null;
  seats?: string | number | boolean | null;
  description?: string | number | boolean | null;
  status?: string | number | boolean | null;
  featured?: string | number | boolean | null;
  confidence?: number;
}

interface CarFormFieldsProps {
  register: UseFormRegister<CarFormValues>
  errors: FieldErrors<CarFormValues>
  setValue: (name: keyof CarFormValues, value: any) => void
  isSubmitting?: boolean
  defaultValues?: AIAnalysisResult
}

export function CarFormFields({ 
  register, 
  errors, 
  setValue,
  isSubmitting = false,
  defaultValues 
}: CarFormFieldsProps) {
  // Helper function to safely get string values
  const getStringValue = (value: any): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // Helper function to safely get number values
  const getNumberValue = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined) return defaultValue
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }

  // Helper function to safely get status value
  const getStatusValue = (value: any): "AVAILABLE" | "UNAVAILABLE" | "SOLD" => {
    const strValue = getStringValue(value).toUpperCase()
    if (strValue === 'UNAVAILABLE') return 'UNAVAILABLE'
    if (strValue === 'SOLD') return 'SOLD'
    return 'AVAILABLE' // default
  }

  return (
    <div className="space-y-8">
      {/* Row 1: Make, Model, Year */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className="space-y-2">
          <Label htmlFor='make'>Make *</Label>
          <Input 
            id='make' 
            {...register("make")} 
            placeholder="e.g Toyota" 
            className={`w-full cursor-text ${errors.make ? "border-red-500" : ""}`}
            defaultValue={getStringValue(defaultValues?.make)}
            disabled={isSubmitting}
          />
          {errors.make && <p className='text-red-500 text-sm'>{errors.make.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='model'>Model *</Label>
          <Input 
            id='model' 
            {...register("model")} 
            placeholder="e.g Land Cruiser" 
            className={`w-full cursor-text ${errors.model ? "border-red-500" : ""}`}
            defaultValue={getStringValue(defaultValues?.model)}
            disabled={isSubmitting}
          />
          {errors.model && <p className='text-red-500 text-sm'>{errors.model.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='year'>Year *</Label>
          <Input 
            id='year' 
            type="number"
            {...register("year", { valueAsNumber: true })} 
            placeholder="e.g 2023" 
            className={`w-full cursor-text ${errors.year ? "border-red-500" : ""}`}
            defaultValue={getNumberValue(defaultValues?.year, new Date().getFullYear())}
            disabled={isSubmitting}
          />
          {errors.year && <p className='text-red-500 text-sm'>{errors.year.message}</p>}
        </div>
      </div>

      {/* Row 2: Price, Mileage, Color */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className="space-y-2">
          <Label htmlFor='price'>Price (Ksh) *</Label>
          <Input 
            id='price' 
            type="number"
            {...register("price", { valueAsNumber: true })} 
            placeholder="e.g 5000000" 
            className={`w-full cursor-text ${errors.price ? "border-red-500" : ""}`}
            defaultValue={getNumberValue(defaultValues?.price)}
            disabled={isSubmitting}
          />
          {errors.price && <p className='text-red-500 text-sm'>{errors.price.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='mileage'>Mileage (km) *</Label>
          <Input 
            id='mileage' 
            type="number"
            {...register("mileage", { valueAsNumber: true })} 
            placeholder="e.g 15000" 
            className={`w-full cursor-text ${errors.mileage ? "border-red-500" : ""}`}
            defaultValue={getNumberValue(defaultValues?.mileage)}
            disabled={isSubmitting}
          />
          {errors.mileage && <p className='text-red-500 text-sm'>{errors.mileage.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='color'>Color *</Label>
          <Input 
            id='color' 
            {...register("color")} 
            placeholder="e.g Black" 
            className={`w-full cursor-text ${errors.color ? "border-red-500" : ""}`}
            defaultValue={getStringValue(defaultValues?.color)}
            disabled={isSubmitting}
          />
          {errors.color && <p className='text-red-500 text-sm'>{errors.color.message}</p>}
        </div>
      </div>

      {/* Row 3: Fuel Type, Transmission, Body Type */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className="space-y-2">
          <Label htmlFor='fuelType'>Fuel Type *</Label>
          <Select 
            onValueChange={(value) => setValue('fuelType', value)}
            defaultValue={getStringValue(defaultValues?.fuelType)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={`w-full cursor-pointer ${errors.fuelType ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {FUEL_TYPES.map((fuel) => (
                <SelectItem key={fuel.value} value={fuel.value} className="cursor-pointer">
                  {fuel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fuelType && <p className='text-red-500 text-sm'>{errors.fuelType.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='transmission'>Transmission *</Label>
          <Select 
            onValueChange={(value) => setValue('transmission', value)}
            defaultValue={getStringValue(defaultValues?.transmission)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={`w-full cursor-pointer ${errors.transmission ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {TRANSMISSION_TYPES.map((transmission) => (
                <SelectItem key={transmission.value} value={transmission.value} className="cursor-pointer">
                  {transmission.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.transmission && <p className='text-red-500 text-sm'>{errors.transmission.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='bodyType'>Body Type *</Label>
          <Select 
            onValueChange={(value) => setValue('bodyType', value)}
            defaultValue={getStringValue(defaultValues?.bodyType)}
            disabled={isSubmitting}
          >
            <SelectTrigger className={`w-full cursor-pointer ${errors.bodyType ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {BODY_TYPES.map((bodyType) => (
                <SelectItem key={bodyType.value} value={bodyType.value} className="cursor-pointer">
                  {bodyType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bodyType && <p className='text-red-500 text-sm'>{errors.bodyType.message}</p>}
        </div>
      </div>

      {/* Row 4: Seats, Status */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className="space-y-2">
          <Label htmlFor='seats'>Number of Seats</Label>
          <Input 
            id='seats' 
            type="number"
            {...register("seats", { valueAsNumber: true })} 
            placeholder="e.g 5" 
            className={`w-full cursor-text ${errors.seats ? "border-red-500" : ""}`}
            defaultValue={getNumberValue(defaultValues?.seats, 5)}
            disabled={isSubmitting}
          />
          {errors.seats && <p className='text-red-500 text-sm'>{errors.seats.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor='status'>Status</Label>
          <Select 
            onValueChange={(value) => setValue('status', value as "AVAILABLE" | "UNAVAILABLE" | "SOLD")}
            defaultValue={getStatusValue(defaultValues?.status)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              {CAR_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="cursor-pointer">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && <p className='text-red-500 text-sm'>{errors.status.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor='description'>Description</Label>
        <Textarea 
          id='description' 
          {...register("description")} 
          placeholder="Describe the car's features, condition, and any additional information..."
          className={`w-full cursor-text min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
          defaultValue={getStringValue(defaultValues?.description)}
          disabled={isSubmitting}
        />
        {errors.description && <p className='text-red-500 text-sm'>{errors.description.message}</p>}
        <p className="text-sm text-gray-500">Minimum 10 characters</p>
      </div>

      {/* Featured Checkbox */}
      <div className="flex items-center space-x-2 pt-4 border-t">
        <Checkbox 
          id="featured" 
          onCheckedChange={(checked) => setValue('featured', checked === true)}
          defaultChecked={defaultValues?.featured === true || defaultValues?.featured === 'true'}
          disabled={isSubmitting}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
          Mark as featured car
        </Label>
        <p className="text-sm text-gray-500">Featured cars appear prominently on the homepage</p>
      </div>
    </div>
  )
}

