'use client'

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
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
import { Loader2, Upload, X, Camera, Wand2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CarFormFields } from '@/app/(admin)/admin/cars/_components/CarFormFields'
import { carFormSchema, CarFormValues } from '@/app/(admin)/admin/cars/_components/AddCarForm'
import { addNewCar, processCarImageWithAI } from '@/app/actions/cars'

interface AIUploadCarFormProps {
  onSuccess?: () => void
}

export function AIUploadCarForm({ onSuccess }: AIUploadCarFormProps) {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiImage, setAiImage] = useState<File | null>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
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
      const file = acceptedFiles[0]
      if (file) {
        handleAIImageUpload(file)
      }
    },
    accept: {
      'image/*': [".jpeg", ".jpg", ".png", ".webp"]
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: true,
  })

  const handleAIImageUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error("Image must be JPG, PNG, or WebP")
      return
    }

    setAiImage(file)
    setIsAnalyzing(true)

    try {
      const result = await processCarImageWithAI(file)
      
      if (result.success && result.data) {
        setAiResult(result.data)
        
        setValue('make', result.data.make || '')
        setValue('model', result.data.model || '')
        setValue('year', result.data.year || new Date().getFullYear())
        setValue('color', result.data.color || '')
        setValue('bodyType', result.data.bodyType || '')
        setValue('fuelType', result.data.fuelType || '')
        setValue('transmission', result.data.transmission || '')
        
        const priceStr = result.data.price ? String(result.data.price).replace(/[^0-9.]/g, '') : '0'
        setValue('price', parseFloat(priceStr) || 0)
        
        const mileageStr = result.data.mileage ? String(result.data.mileage).replace(/[^0-9]/g, '') : '0'
        setValue('mileage', parseInt(mileageStr) || 0)
        
        setValue('description', result.data.description || '')
        setValue('images', [file], { shouldValidate: true })
        
        setShowForm(true)
        toast.success(`AI analysis complete! Confidence: ${(result.data.confidence * 100).toFixed(1)}%`)
      } else {
        toast.error(result.error || 'Failed to analyze image')
        setAiImage(null)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      toast.error('Failed to analyze image')
      setAiImage(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAIImageUpload(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const resetAI = () => {
    setAiImage(null)
    setAiResult(null)
    setShowForm(false)
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: CarFormValues) => {
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
        toast.success('Car added successfully using AI!')
        resetAI()
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
        <CardTitle>AI-Powered Car Upload</CardTitle>
        <CardDescription>Upload a car image and let AI analyze it to automatically fill the details</CardDescription>
      </CardHeader>
      
      <CardContent>
        {!showForm ? (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
              } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <input {...getInputProps()} />
              
              <Camera className="mx-auto mb-4 text-gray-400 dark:text-gray-500 size-16" />
              <p className="mb-2 text-gray-700 dark:text-gray-300 font-medium text-lg">
                {isDragActive && !isDragReject
                  ? "Drop car image here for AI analysis..."
                  : "Upload a car image for AI analysis"
                }
              </p>

              {isDragReject && (
                <p className="text-red-500 mb-2 font-medium">Invalid image type</p>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Our AI will analyze the image and automatically fill in car details
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-2 disabled:opacity-50"
                disabled={isAnalyzing}
                onClick={triggerFileInput}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-4 h-4" />
                    Select Car Image
                  </>
                )}
              </Button>
            </div>

            {aiImage && isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="text-center">
                  <div className="relative w-full max-w-md mx-auto h-64 mb-4">
                    <Image
                      src={URL.createObjectURL(aiImage)}
                      alt="Uploaded Car Image"
                      fill
                      className="object-contain rounded-xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      AI is analyzing your car image...
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Detecting make, model, year, and other details
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                      AI Analysis Complete
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Confidence: </span>
                        <span className="font-medium">{aiResult.confidence ? (aiResult.confidence * 100).toFixed(1) : '0'}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Make: </span>
                        <span className="font-medium">{aiResult.make || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Model: </span>
                        <span className="font-medium">{aiResult.model || 'Unknown'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Review and edit the details below as needed
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetAI}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {aiImage && (
              <div className="text-center">
                <div className="relative w-full max-w-md mx-auto h-64 mb-4">
                  <Image
                    src={URL.createObjectURL(aiImage)}
                    alt="Car Image for AI Analysis"
                    fill
                    className="object-contain rounded-xl"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
              <CarFormFields 
                register={register}
                errors={errors}
                setValue={setValue}
                isSubmitting={isSubmitting}
                defaultValues={aiResult}
              />

              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetAI}
                  disabled={isSubmitting}
                >
                  Start Over
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || images.length === 0} 
                  className="px-8"
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}

