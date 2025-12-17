'use client'

import React,{ useState, useRef } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Upload, X, Loader2, Camera } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { updateCar } from '@/app/actions/cars'

// Zod schema for edit form
const editCarSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900, "Year must be after 1900").max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  price: z.number().positive("Price must be greater than 0").min(100000, "Price seems too low for a car").max(100000000, "Price seems unrealistic"),
  mileage: z.number().nonnegative("Mileage cannot be negative"),
  color: z.string().min(1, "Color is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  seats: z.number().int().min(2, "Seats must be at least 2").max(9, "Seats cannot exceed 9"),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "UNAVAILABLE", "SOLD"]),
  featured: z.boolean(),
})

type EditCarFormValues = z.infer<typeof editCarSchema>

interface Car {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    color: string
    fuelType: string
    transmission: string
    bodyType: string
    seats: number
    description: string | null
    status: string
    featured: boolean
    images: string[]
}

interface EditCarFormProps {
    car: Car
}

export default function EditCarForm({ car }: EditCarFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
    const [newImages, setNewImages] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<EditCarFormValues>({
        resolver: zodResolver(editCarSchema),
        defaultValues: {
            make: car.make,
            model: car.model,
            year: car.year,
            price: car.price,
            mileage: car.mileage,
            color: car.color,
            fuelType: car.fuelType,
            transmission: car.transmission,
            bodyType: car.bodyType,
            seats: car.seats,
            description: car.description || '',
            status: car.status as "AVAILABLE" | "UNAVAILABLE" | "SOLD",
            featured: car.featured,
        }
    })

    const currentImages = car.images.filter(img => !imagesToDelete.includes(img))
    const totalImages = currentImages.length + newImages.length

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            if (totalImages + acceptedFiles.length > 10) {
                toast.error("Maximum 10 images allowed. You can upload " + (10 - totalImages) + " more")
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
                setNewImages(prev => [...prev, ...validFiles])
                const newPreviews = validFiles.map(file => URL.createObjectURL(file))
                setPreviewUrls(prev => [...prev, ...newPreviews])
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

        if (totalImages + files.length > 10) {
            toast.error("Maximum 10 images allowed. You can upload " + (10 - totalImages) + " more")
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
            setNewImages(prev => [...prev, ...validFiles])
            const newPreviews = validFiles.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newPreviews])
            toast.success(`Added ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}`)
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleRemoveExistingImage = (imageUrl: string) => {
        const remainingImages = currentImages.length - 1
        const totalAfterRemoval = remainingImages + newImages.length
        
        if (totalAfterRemoval < 1) {
            toast.error('At least one image is required')
            return
        }
        
        setImagesToDelete(prev => [...prev, imageUrl])
        toast.info('Image marked for deletion')
    }

    const handleRemoveNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
        toast.info('Image removed')
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    const calculateTotalSize = () => {
        if (!newImages.length) return '0 MB'
        const totalBytes = newImages.reduce((acc: number, file: File) => {
            return acc + (file.size || 0)
        }, 0)
        return (totalBytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const onSubmit: SubmitHandler<EditCarFormValues> = async (data) => {
        setIsSubmitting(true)

        try {
            // Final validation check
            if (totalImages < 1) {
                toast.error('At least one image is required')
                setIsSubmitting(false)
                return
            }

            const validatedData = editCarSchema.parse(data)

            const result = await updateCar(
                car.id,
                validatedData,
                newImages.length > 0 ? newImages : undefined,
                imagesToDelete.length > 0 ? imagesToDelete : undefined
            )

            if (result.success) {
                toast.success('Car updated successfully!')
                router.push('/admin/cars')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update car')
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.issues.forEach((issue) => {
                    toast.error(issue.message)
                })
            } else {
                console.error('Error updating car:', error)
                toast.error('An error occurred while updating the car')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
               
                <div>
                <h1 className="text-2xl font-bold">Edit Car</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Update details for {car.make} {car.model}
                </p>
                </div>

 <Button variant="ghost" asChild className="mb-4">
                    <Link href="/admin/cars">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cars
                    </Link>
                </Button>


            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
                {/* Basic Information */}
                <Card className='bg-gray-100 dark:bg-gray-900' >
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Update the core details of the vehicle</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="make">Make *</Label>
                                <Input
                                    id="make"
                                    {...register("make")}
                                    placeholder="e.g., Toyota"
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.make && (
                                    <p className="text-red-500 text-sm">{errors.make.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="model">Model *</Label>
                                <Input
                                    id="model"
                                    {...register("model")}
                                    placeholder="e.g., Corolla"
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.model && (
                                    <p className="text-red-500 text-sm">{errors.model.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="year">Year *</Label>
                                <Input
                                    id="year"
                                    type="number"
                                    {...register("year", { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.year && (
                                    <p className="text-red-500 text-sm">{errors.year.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (KES) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    {...register("price", { valueAsNumber: true })}
                                    step="1000"
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-sm">{errors.price.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mileage">Mileage (km) *</Label>
                                <Input
                                    id="mileage"
                                    type="number"
                                    {...register("mileage", { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.mileage && (
                                    <p className="text-red-500 text-sm">{errors.mileage.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="color">Color *</Label>
                            <Input
                                id="color"
                                {...register("color")}
                                placeholder="e.g., White"
                                disabled={isSubmitting}
                                className="w-full"
                            />
                            {errors.color && (
                                <p className="text-red-500 text-sm">{errors.color.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Specifications */}
                <Card className='bg-gray-100 dark:bg-gray-900' >
                    <CardHeader>
                        <CardTitle>Specifications</CardTitle>
                        <CardDescription>Technical details and features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fuelType">Fuel Type *</Label>
                                <Select
                                    value={watch("fuelType")}
                                    onValueChange={(value) => setValue("fuelType", value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.fuelType && (
                                    <p className="text-red-500 text-sm">{errors.fuelType.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transmission">Transmission *</Label>
                                <Select
                                    value={watch("transmission")}
                                    onValueChange={(value) => setValue("transmission", value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Manual">Manual</SelectItem>
                                        <SelectItem value="Automatic">Automatic</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.transmission && (
                                    <p className="text-red-500 text-sm">{errors.transmission.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bodyType">Body Type *</Label>
                                <Select
                                    value={watch("bodyType")}
                                    onValueChange={(value) => setValue("bodyType", value)}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sedan">Sedan</SelectItem>
                                        <SelectItem value="SUV">SUV</SelectItem>
                                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                                        <SelectItem value="Coupe">Coupe</SelectItem>
                                        <SelectItem value="Wagon">Wagon</SelectItem>
                                        <SelectItem value="Van">Van</SelectItem>
                                        <SelectItem value="Truck">Truck</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.bodyType && (
                                    <p className="text-red-500 text-sm">{errors.bodyType.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seats">Seats *</Label>
                                <Input
                                    id="seats"
                                    type="number"
                                    {...register("seats", { valueAsNumber: true })}
                                    disabled={isSubmitting}
                                    className="w-full"
                                />
                                {errors.seats && (
                                    <p className="text-red-500 text-sm">{errors.seats.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                rows={4}
                                placeholder="Describe the car's features, condition, and any notable details..."
                                disabled={isSubmitting}
                                className="w-full"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm">{errors.description.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status and Featured */}
                <Card className='bg-gray-100 dark:bg-gray-900'>
                    <CardHeader>
                        <CardTitle>Status & Visibility</CardTitle>
                        <CardDescription>Set availability and featured status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={watch("status")}
                                    onValueChange={(value) => setValue("status", value as "AVAILABLE" | "UNAVAILABLE" | "SOLD")}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                        <SelectItem value="SOLD">Sold</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="featured">Featured</Label>
                                <Select
                                    value={watch("featured").toString()}
                                    onValueChange={(value) => setValue("featured", value === 'true')}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="false">No</SelectItem>
                                        <SelectItem value="true">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card className='bg-gray-100 dark:bg-gray-900' >
                    <CardHeader>
                        <CardTitle>Images</CardTitle>
                        <CardDescription>
                            Manage car images ({totalImages}/10) - At least 1 image required
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Existing Images */}
                        {currentImages.length > 0 && (
                            <div>
                                <Label className="mb-2 block">Current Images</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {currentImages.map((imageUrl, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="relative group"
                                        >
                                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                                <Image
                                                    src={imageUrl}
                                                    alt={`Car image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="200px"
                                                    unoptimized
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(imageUrl)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Images marked for deletion */}
                        {imagesToDelete.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {imagesToDelete.length} image{imagesToDelete.length > 1 ? 's' : ''} will be deleted
                                </p>
                            </div>
                        )}

                        {/* New Images */}
                        <AnimatePresence>
                            {newImages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Label className="mb-2 block">New Images</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="relative group"
                                            >
                                                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary">
                                                    <Image
                                                        src={url}
                                                        alt={`New image ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="200px"
                                                    />
                                                    <Badge className="absolute top-2 left-2 bg-primary">New</Badge>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                    disabled={isSubmitting}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {newImages.length} new image{newImages.length !== 1 ? 's' : ''} ({calculateTotalSize()})
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence> 

                        {/* Upload New Images */}
                        {totalImages < 10 && (
                            <div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    className="hidden"
                                    multiple
                                    disabled={isSubmitting}
                                />
                                
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                        isDragActive
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-primary dark:hover:border-primary'
                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <input {...getInputProps()} />
                                    
                                    <Camera className="mx-auto mb-4 text-gray-400 dark:text-gray-500 size-12" />
                                    <p className="mb-2 text-gray-700 dark:text-gray-300 font-medium">
                                        {isDragActive && !isDragReject
                                            ? "Drop images here..."
                                            : "Drag & drop more car images here"
                                        }
                                    </p>

                                    {isDragReject && (
                                        <p className="text-red-500 mb-2 font-medium">Some files were rejected</p>
                                    )}

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        {totalImages}/10 images • Can upload {10 - totalImages} more
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-2"
                                        disabled={isSubmitting}
                                        onClick={triggerFileInput}
                                    >
                                        <Upload className="mr-2 w-4 h-4" />
                                        Browse Images
                                    </Button>
                                </div>
                            </div>
                        )}

                        {totalImages < 1 && (
                            <p className="text-red-500 text-sm">At least one image is required</p>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting || totalImages < 1}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating Car...
                            </>
                        ) : (
                            'Update Car'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/cars')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}

