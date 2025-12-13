'use client'

import React, { useState, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X, Camera } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { CarFormFields } from '@/app/(admin)/admin/cars/_components/CarFormFields'
import { carFormSchema, CarFormValues } from '@/app/(admin)/admin/cars/_components/AddCarForm'
import { addNewCar } from '@/app/actions/cars'

interface ManualAddCarFormProps {
  onSuccess?: () => void
}

export function ManualAddCarForm({ onSuccess }: ManualAddCarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<CarFormValues>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      color: '',
      fuelType: '',
      transmission: '',
      bodyType: '',
      seats: 5,
      description: '',
      status: 'AVAILABLE',
      featured: false,
      images: []
    }
  })

  const images = watch('images') || []

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const currentImages = images || []
      const totalImages = currentImages.length + acceptedFiles.length
      
      if (totalImages > 10) {
        toast.error("Maximum 10 images allowed. You can upload " + (10 - currentImages.length) + " more")
        return
      }

      const validFiles: File[] = []
      acceptedFiles.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} is too large (max 10MB)`)
          return
        }
        
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
          toast.error(`Image ${file.name} must be JPG, PNG, or WebP`)
          return
        }
        
        validFiles.push(file)
      })

      if (validFiles.length > 0) {
        const newImages = [...currentImages, ...validFiles]
        setValue('images', newImages, { shouldValidate: true })
        toast.success(`Added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`)
      }
    },
    accept: {
      'image/*': [".jpeg", ".jpg", ".png", ".webp"]
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    noClick: true,
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentImages = images || []
    const totalImages = currentImages.length + files.length
    
    if (totalImages > 10) {
      toast.error("Maximum 10 images allowed. You can upload " + (10 - currentImages.length) + " more")
      return
    }

    const validFiles: File[] = []
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Image ${file.name} is too large (max 10MB)`)
        return
      }
      
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        toast.error(`Image ${file.name} must be JPG, PNG, or WebP`)
        return
      }
      
      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      const newImages = [...currentImages, ...validFiles]
      setValue('images', newImages, { shouldValidate: true })
      toast.success(`Added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setValue('images', newImages, { shouldValidate: true })
    toast.info('Image removed')
  }

  const removeAllImages = () => {
    setValue('images', [], { shouldValidate: true })
    toast.info('All images removed')
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const calculateTotalSize = () => {
    if (!images.length) return '0 MB'
    const totalBytes = images.reduce((acc: number, file: File) => {
      return acc + (file.size || 0)
    }, 0)
    return (totalBytes / (1024 * 1024)).toFixed(1) + 'MB'
  }

  const onSubmit: SubmitHandler<CarFormValues> = async (data) => {
    setIsSubmitting(true)
    try {
      const validatedData = carFormSchema.parse(data)
      
      const result = await addNewCar({
        carData: {
          make: validatedData.make,
          model: validatedData.model,
          year: validatedData.year,
          price: validatedData.price,
          mileage: validatedData.mileage,
          color: validatedData.color,
          fuelType: validatedData.fuelType,
          transmission: validatedData.transmission,
          bodyType: validatedData.bodyType,
          seats: validatedData.seats,
          description: validatedData.description || '',
          status: validatedData.status,
          featured: validatedData.featured,
        },
        images: validatedData.images
      })

      if (result.success) {
        toast.success('Car added successfully!')
        reset()
        onSuccess?.()
        
        // Redirect to cars page
        if (result.redirect) {
          router.push(result.redirect)
        }
      } else {
        toast.error(result.error || 'Failed to add car')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to add car')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Car Entry</CardTitle>
        <CardDescription>Enter all car details manually</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          <CarFormFields 
            register={register}
            errors={errors}
            setValue={setValue}
            isSubmitting={isSubmitting}
          />

          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor='images'>Car Images *</Label>
                <p className="text-sm text-gray-500">Upload up to 10 images (JPG, PNG, WebP). Max 10MB each.</p>
              </div>
              {images.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAllImages}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isSubmitting}
                >
                  <X className="mr-1 h-3 w-3" />
                  Remove All
                </Button>
              )}
            </div>

            <AnimatePresence>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((file: File, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            unoptimized
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 px-2 truncate">
                          {file.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {images.length} image{images.length !== 1 ? 's' : ''} selected ({calculateTotalSize()})
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                multiple
              />
              <input {...getInputProps()} />
              
              <Camera className="mx-auto mb-4 text-gray-400 dark:text-gray-500 size-12" />
              <p className="mb-2 text-gray-700 dark:text-gray-300 font-medium">
                {isDragActive && !isDragReject
                  ? "Drop images here..."
                  : "Drag & drop car images here"
                }
              </p>

              {isDragReject && (
                <p className="text-red-500 mb-2 font-medium">Some files were rejected</p>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {images.length}/10 images uploaded
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-2 disabled:opacity-50"
                disabled={isSubmitting}
                onClick={triggerFileInput}
              >
                <Upload className="mr-2 w-4 h-4" />
                {isSubmitting ? 'Uploading...' : 'Browse Images'}
              </Button>
            </div>
            
            {errors.images && (
              <p className='text-red-500 text-sm'>{errors.images.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              disabled={isSubmitting || images.length === 0} 
              className="w-full sm:w-auto px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Car...
                </>
              ) : (
                'Add Car to Inventory'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

