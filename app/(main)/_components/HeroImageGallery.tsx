"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton' // Make sure to import your Skeleton
import { Car } from 'lucide-react' // Add car icon

interface HeroImageGalleryProps {
  intervalMinutes?: number 
}

const carImages = [
  '/hero_1.png',
  '/hero_2.png',
  '/hero_3.png',
  '/hero_4.png',
  '/gtr.png',
]

export default function HeroImageGallery({ intervalMinutes = 0.75 }: HeroImageGalleryProps) { // 0.75 minutes = 45 seconds
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const intervalMs = intervalMinutes * 60 * 1000 // 45 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % carImages.length
      )
    }, intervalMs)
    
    return () => clearInterval(interval)
  }, [isMounted, intervalMinutes])

  if (!isMounted) {
    return (
      <div className="relative h-[300px] lg:max-h-[80vh] lg:h-full w-full overflow-hidden ">
        {/* Skeleton loader with car icon */}
        <div className="h-full w-full flex flex-col items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 py-4">
          {/* Animated car icon */}
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <Car className="h-12 w-12 text-primary dark:text-primary-foreground" />
          </motion.div>
          
          {/* Text skeleton */}
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
          
          {/* Image area skeleton */}
          <div className="mt-6 w-full">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] lg:max-h-[80vh] lg:h-full w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="h-full w-full bg-cover bg-center absolute inset-0"
          style={{
            backgroundImage: `url(${carImages[currentImageIndex]})`,
            backgroundPosition: 'left center',
            backgroundSize: 'cover'
          }}
        />
      </AnimatePresence>
    </div>
  )
}
