"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { carBrands } from '@/data/data'

const CarMakes = () => {
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [scrollPosition, setScrollPosition] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

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
        const newPos = prev + 0.8 // Increased from 0.5 for faster scrolling
        
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
            className="flex items-center gap-3 md:gap-4" 
            animate={{ x: -scrollPosition }}
            transition={{ type: "tween", ease: "linear", duration: 0 }}
            style={{ width: 'max-content' }}
          >
            {carBrands.map((brand, index) => (
              <motion.div
                key={brand.brand}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="shrink-0"
              >
                <Link 
                  href={`/cars?make=${brand.brand}`}  
                  className="group block"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="
                    w-20 h-20         
                    sm:w-24 sm:h-24   
                    md:w-28 md:h-28   
                    lg:w-32 lg:h-32   
                    xl:w-36 xl:h-36   
                    2xl:w-40 2xl:h-40 
                    flex flex-col items-center justify-center p-2
                    bg-white dark:bg-gray-800 
                    rounded-lg         
                    shadow-sm hover:shadow-md
                    transition-all duration-300 
                    border border-gray-100 dark:border-gray-700
                    hover:border-primary/30
                    my-2             
                  ">
                    <div className="
                      relative 
                      w-10 h-10        
                      sm:w-12 sm:h-12  
                      md:w-14 md:h-14 
                      lg:w-16 lg:h-16  
                      xl:w-18 xl:h-18  
                      2xl:w-20 2xl:h-20 
                      mb-2
                    ">
                      <Image
                        src={brand.image}
                        alt={brand.brand}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, (max-width: 1024px) 56px, (max-width: 1280px) 64px, 80px"
                      />
                    </div>
                    <span className="
                      text-xs         
                      font-medium
                      text-gray-700 dark:text-gray-300 
                      group-hover:text-primary 
                      transition-colors
                      text-center
                      px-2
                      line-clamp-1   
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
                  href={`/cars?make=${brand.brand}`}  
                  className="group block"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="
                    w-20 h-20
                    sm:w-24 sm:h-24
                    md:w-28 md:h-28
                    lg:w-32 lg:h-32
                    xl:w-36 xl:h-36
                    2xl:w-40 2xl:h-40
                    flex flex-col items-center justify-center p-2
                    bg-white dark:bg-gray-800 
                    rounded-lg
                    shadow-sm hover:shadow-md
                    transition-all duration-300 
                    border border-gray-100 dark:border-gray-700
                    hover:border-primary/30
                    my-1
                  ">
                    <div className="
                      relative 
                      w-10 h-10
                      sm:w-12 sm:h-12
                      md:w-14 md:h-14
                      lg:w-16 lg:h-16
                      xl:w-18 xl:h-18
                      2xl:w-20 2xl:h-20
                      mb-1
                    ">
                      <Image
                        src={brand.image}
                        alt={brand.brand}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, (max-width: 1024px) 56px, (max-width: 1280px) 64px, 80px"
                      />
                    </div>
                    <span className="
                      text-xs
                      font-medium
                      text-gray-700 dark:text-gray-300 
                      group-hover:text-primary 
                      transition-colors
                      text-center
                      px-1
                      line-clamp-1
                      mt-2
                    ">
                      {brand.brand}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background dark:from-background to-transparent pointer-events-none" />
<div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background dark:from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}

export default CarMakes

