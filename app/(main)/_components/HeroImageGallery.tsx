"use client"

import { useState, useEffect } from 'react'

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

export default function HeroImageGallery({ intervalMinutes = 3 }: HeroImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const changeImage = () => {
      setOpacity(0)
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          (prevIndex + 1) % carImages.length
        )
        setOpacity(1)
      }, 1000)
    }

    const intervalMs = intervalMinutes * 60 * 1000
    const interval = setInterval(changeImage, intervalMs)
    return () => clearInterval(interval)
  }, [isMounted, intervalMinutes])

  if (!isMounted) {
    return (
      <div className="relative h-[300px] lg:h-full w-full overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-white">
            <p>Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[300px] lg:h-full w-full overflow-hidden">
      {/* Current Image with Fade Transition */}
      <div 
        className="h-full w-full bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${carImages[currentImageIndex]})`,
          opacity: opacity
        }}
      />
    </div>
  )
}