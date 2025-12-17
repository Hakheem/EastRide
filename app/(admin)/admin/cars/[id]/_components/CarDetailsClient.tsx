'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    Calendar,
    Gauge,
    Palette,
    Fuel,
    Cog,
    Car as CarIcon,
    Users,
    CheckCircle2,
    XCircle,
    Star,
    ArrowLeft,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import Link from 'next/link'

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
    createdAt: Date
}

interface CarDetailsClientProps {
    car: Car
}

export default function CarDetailsClient({ car }: CarDetailsClientProps) {
    const [selectedImage, setSelectedImage] = useState(0)
    const [isImageLoading, setIsImageLoading] = useState(true)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusBadge = () => {
        const statusConfig = {
            AVAILABLE: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
            SOLD: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
            UNAVAILABLE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: XCircle }
        }
        
        const config = statusConfig[car.status as keyof typeof statusConfig] || statusConfig.AVAILABLE
        const Icon = config.icon

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {car.status}
            </Badge>
        )
    }

    const handleImageChange = (index: number) => {
        setIsImageLoading(true)
        setSelectedImage(index)
    }

    const handlePrevImage = () => {
        setSelectedImage((prev) => (prev === 0 ? car.images.length - 1 : prev - 1))
    }

    const handleNextImage = () => {
        setSelectedImage((prev) => (prev === car.images.length - 1 ? 0 : prev + 1))
    }

    const specs = [
        { icon: Calendar, label: 'Year', value: car.year },
        { icon: Gauge, label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
        { icon: Palette, label: 'Color', value: car.color },
        { icon: Fuel, label: 'Fuel Type', value: car.fuelType },
        { icon: Cog, label: 'Transmission', value: car.transmission },
        { icon: CarIcon, label: 'Body Type', value: car.bodyType },
        { icon: Users, label: 'Seats', value: car.seats },
    ]

    return (
        <div className="min-h-screen">
            <div className="">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/admin/cars">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Cars
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Image Gallery */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Main Image  */}
                        <Card className="overflow-hidden p-0">
                            <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative w-full h-full"
                                    >
                                        {isImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                            </div>
                                        )}
                                        <Image
                                            src={car.images[selectedImage]}
                                            alt={`${car.make} ${car.model} - Image ${selectedImage + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 66vw"
                                            priority={selectedImage === 0}
                                            onLoad={() => setIsImageLoading(false)}
                                            unoptimized
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                {car.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-20"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm z-20">
                                    {selectedImage + 1} / {car.images.length}
                                </div>
                            </div>
                        </Card>

                        {/* Thumbnail Gallery */}
                        {car.images.length > 1 && (
                            <div className="overflow-x-auto">
                                <div className="flex gap-2 pb-2">
                                    {car.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleImageChange(index)}
                                            className={`relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                                                selectedImage === index
                                                    ? 'border-primary ring-2 ring-primary/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                            }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={`Thumbnail ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                                unoptimized
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <Card className='p-0 bg-transparent shadow-none border-none'>
                            <CardContent className="py-6 px-0">
                                <h2 className="text-xl font-semibold mb-4">Description</h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {car.description || 'No description available.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Car Info */}
                    <div className="space-y-4">
                        <Card className='bg-gray-50 dark:bg-gray-900'>
                            <CardContent className="pt-6 space-y-6">
                                {/* Title and Status */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h1 className="text-3xl font-bold">
                                            {car.make} {car.model}
                                        </h1>
                                        {car.featured && (
                                            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge()}
                                    </div>
                                </div>

                                <Separator />

                                {/* Price */}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
                                    <p className="text-4xl font-bold text-gradient">
                                        {formatCurrency(car.price)}
                                    </p>
                                </div>

                                <Separator />

                                {/* Specifications */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                                    <div className="space-y-3">
                                        {specs.map((spec, index) => {
                                            const Icon = spec.icon
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                                        <Icon className="h-5 w-5" />
                                                        <span>{spec.label}</span>
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {spec.value}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <Separator />

                                {/* Action Buttons */}
                                <div className="">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/admin/cars/edit/${car.id}`}>
                                            Edit Car Details
                                        </Link>
                                    </Button>
                                </div>

                                {/* Additional Info */}
                                <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t">
                                    <p>Listed on {new Date(car.createdAt).toLocaleDateString()}</p>
                                    <p className="mt-1">Car ID: {car.id.slice(0, 8)}...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

