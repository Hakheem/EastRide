"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { carBrands } from '@/data/data'

const CarMakes = () => {
  const [isPaused, setIsPaused] = useState<boolean>(false) // Added type
  const [scrollPosition, setScrollPosition] = useState<number>(0) // Added type
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined) // Added type

  useEffect(() => {
    if (isPaused || !containerRef.current || !contentRef.current) return

    const container = containerRef.current
    const content = contentRef.current
    const containerWidth = container.offsetWidth
    const contentWidth = content.scrollWidth
    const maxScroll = contentWidth - containerWidth

    // If content fits in container, don't animate
    if (contentWidth <= containerWidth) return

    const animate = () => {
      setScrollPosition(prev => {
        const newPos = prev + 0.5 // Adjust speed here (lower = slower)
        
        // Reset position when reaching the end
        if (newPos >= maxScroll) {
          return 0
        }
        return newPos
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused])

  return (
    <section>
      <div className='py-12 padded'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Browse by Make
          </h2>
          <Button variant="link" className="text-sm p-0" asChild>
            <Link href="/cars">
              View All
              <ChevronRight className='size-4 ml-1'/>
            </Link>
          </Button>
        </div>

        <div 
          ref={containerRef}
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            ref={contentRef}
            className="flex items-center gap-4 md:gap-6"
            animate={{ x: -scrollPosition }}
            transition={{ type: "tween", ease: "linear", duration: 0 }}
            style={{ width: 'max-content' }}
          >
            {carBrands.map((brand, index) => (
              <motion.div
                key={brand.brand}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="shrink-0"
               
              >
                <Link 
                  href={`/cars?brand=${brand.brand}`}  
                  className="group block"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="
                    w-28 h-28 
                    sm:w-32 sm:h-32 
                    md:w-36 md:h-36 
                    lg:w-40 lg:h-40 
                    xl:w-44 xl:h-44 
                    2xl:w-48 2xl:h-48 
                    flex flex-col items-center justify-center p-3 
                    // bg-white dark:bg-gray-800 
                    // rounded-lg 
                    shadow hover:shadow-sm
                    transition-all duration-300 
                    // border border-gray-100 dark:border-gray-700
                    my-2
                  ">
                    <div className="
                      relative 
                      w-12 h-12 
                      sm:w-14 sm:h-14 
                      md:w-16 md:h-16 
                      lg:w-18 lg:h-18 
                      xl:w-20 xl:h-20 
                      2xl:w-24 2xl:h-24 
                      mb-2 md:mb-3
                    ">
                      <Image
                        src={brand.image}
                        alt={brand.brand}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, (max-width: 1280px) 72px, 96px"
                      />
                    </div>
                    <span className="
                      text-xs 
                      sm:text-sm 
                      md:text-base 
                      font-semibold 
                      text-gray-700 dark:text-gray-300 
                      group-hover:text-primary 
                      transition-colors
                      text-center
                      px-1
                    ">
                      {brand.brand}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
            
            {/* Duplicate brands for looping */}
            {carBrands.map((brand, index) => (
              <motion.div
                key={`${brand.brand}-duplicate-${index}`}
                className="shrink-0"
              >
                <Link 
                  href={`/cars?brand=${brand.brand}`}  
                  className="group block"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="
                    w-28 h-28 
                    sm:w-32 sm:h-32 
                    md:w-36 md:h-36 
                    lg:w-40 lg:h-40 
                    xl:w-44 xl:h-44 
                    2xl:w-48 2xl:h-48 
                    flex flex-col items-center justify-center p-3 
                    bg-white dark:bg-gray-800 
                    rounded-lg
                    shadow
                    transition-all duration-300 
                    border border-gray-100 dark:border-gray-700
                  ">
                    <div className="
                      relative 
                      w-12 h-12 
                      sm:w-14 sm:h-14 
                      md:w-16 md:h-16 
                      lg:w-18 lg:h-18 
                      xl:w-20 xl:h-20 
                      2xl:w-24 2xl:h-24 
                      mb-2 md:mb-3
                    ">
                      <Image
                        src={brand.image}
                        alt={brand.brand}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, (max-width: 1280px) 72px, 96px"
                      />
                    </div>
                    <span className="
                      text-xs 
                      sm:text-sm 
                      md:text-base 
                      font-semibold 
                      text-gray-700 dark:text-gray-300 
                      group-hover:text-primary 
                      transition-colors
                      text-center
                      px-1
                    ">
                      {brand.brand}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-white dark:from-black to-transparent pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-white dark:from-black to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}

export default CarMakes

