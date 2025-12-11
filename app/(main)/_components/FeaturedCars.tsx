"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import FeaturedCarsCard from "@/components/general/FeaturedCarsCard"
import { featuredCars } from '@/data/data'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'

export default function FeaturedCars() {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <div className="py-12 padded">
      <div className='flex items-center justify-between mb-8'>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Featured Cars
        </h2>
        <Button variant="outline" className="text-sm p-0" asChild>
          <Link href="/cars">
            View All
            <ChevronRight className='size-4 ml-1' />
          </Link>
        </Button>
      </div>

      {/* Mobile: 2 cards, horizontal scroll */}
      <div className="md:hidden">
        <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {featuredCars.map((car) => (
            <div key={car.id} className="min-w-[280px] shrink-0">
              <FeaturedCarsCard car={car} />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: 3 cards grid */}
      <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-6">
        {featuredCars.slice(0, 6).map((car) => ( // Show 6 cards (3x2 rows)
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>

      {/* Laptop and larger */}
      <div className="hidden lg:block">
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 40000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            slidesPerView={4}
            spaceBetween={20}
            grabCursor={false}
            loop={true}
            breakpoints={{
              1280: { // xl screens
                slidesPerView: 4,
              },
              1536: { // 2xl screens
                slidesPerView: 6,
              },
            }}
            className="featured-cars-swiper"
          >
            {featuredCars.map((car) => (
              <SwiperSlide key={car.id} className="!h-auto">
                <div className="h-full">
                  <FeaturedCarsCard car={car} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}

