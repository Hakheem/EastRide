"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '../ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Eye, Fuel, Cog, Palette, Gauge } from 'lucide-react'
import Image from 'next/image'
import { formatPrice } from '@/data/data'

interface CarType {
  id: number
  name: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuelType: string
  bodyType: string
  color: string
  wishListed: boolean
  images: string[]
  features: string[]
  location: string
  rating: number
  sellerType: string
}

interface FeaturedCarsCardProps {
  car: CarType
}

const FeaturedCarsCard = ({ car }: FeaturedCarsCardProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [wishlisted, setWishlisted] = useState(car.wishListed)
  const galleryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedWishlist = localStorage.getItem('eastride-wishlist')
    if (savedWishlist) {
      const wishlistIds = JSON.parse(savedWishlist)
      if (wishlistIds.includes(car.id)) {
        setWishlisted(true)
      }
    }
  }, [car.id])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryRef.current || car.images.length <= 1) return
    
    const container = galleryRef.current
    const { left, width } = container.getBoundingClientRect()
    const x = e.clientX - left
    
    const segmentWidth = width / car.images.length
    const newIndex = Math.min(Math.floor(x / segmentWidth), car.images.length - 1)
    
    if (newIndex !== activeImageIndex) {
      setActiveImageIndex(newIndex)
    }
  }

  const handleMouseEnter = () => {
    if (car.images.length > 1) {
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setActiveImageIndex(0)
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const savedWishlist = localStorage.getItem('eastride-wishlist')
    let wishlistIds = savedWishlist ? JSON.parse(savedWishlist) : []
    
    if (wishlisted) {
      wishlistIds = wishlistIds.filter((id: number) => id !== car.id)
      setWishlisted(false)
    } else {
      if (!wishlistIds.includes(car.id)) {
        wishlistIds.push(car.id)
      }
      setWishlisted(true)
    }
    
    localStorage.setItem('eastride-wishlist', JSON.stringify(wishlistIds))
  }

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col p-0">
      
      {/* Image Gallery */}
      <div 
        ref={galleryRef}
        className="relative h-48 md:h-56 overflow-hidden shrink-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={car.images[activeImageIndex] || "/placeholder.jpg"}
            alt={`${car.name} - View ${activeImageIndex + 1}`}
            fill
            className="object-cover block !m-0 !p-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Wishlist Icon */}
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm hover:scale-110 active:scale-95"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{car.name}</h3>

        <div className="mb-3">
          <span className="text-2xl font-bold text-gradient">
            {formatPrice(car.price)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <Badge variant="outline" className="font-semibold">{car.year}</Badge>

          <span className="flex items-center gap-1">
            <Cog className="w-3.5 h-3.5" />
            {car.transmission}
          </span>

          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {car.fuelType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center">
            {car.bodyType}
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {car.mileage >= 1000 ? `${(car.mileage / 1000).toFixed(0)}k km` : `${car.mileage} km`}
          </Badge>

          <Badge variant="secondary" className="flex items-center gap-1">
            <Palette className="w-3 h-3" />
            {car.color.split(" ")[0]}
          </Badge>
        </div>

        <div className="mt-auto pt-2 mb-4">
          <Button className="w-full" asChild>
            <a href={`/cars/${car.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Car Details
            </a>
          </Button>
        </div>
      </div>

    </Card>
  )
}

export default FeaturedCarsCard

