"use client"

import { motion } from 'framer-motion'
import HomeSearch from "@/components/general/HomeSearch";
import HeroImageGallery from "./HeroImageGallery";

export default function HeroSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-700">
      <div className="overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2"
              >
                <span className="text-sm font-semibold text-primary dark:text-primary-foreground">
                  🚗 East Africa's No. 1 Car Marketplace
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl"
              >
                Find Your Perfect{' '}
                <span className="gradient-text">
                  Ride
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8 text-lg text-gray-600 dark:text-gray-300 md:text-xl"
              >
                Browse through hundreds of verified cars from across 
                East Afria. Advanced AI powered car search and test drive. Let's find the perfect vehicle that 
                matches your style and budget.
              </motion.p>

              {/* Search Component */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-6"
              >
                <HomeSearch />
              </motion.div>
            </motion.div>
          </div>

          {/* Image Gallery */}
          <div className="relative min-h-[300px] lg:min-h-[600px]">
            <HeroImageGallery intervalMinutes={0.75} /> {/* 45 seconds */}
          </div>
        </div>
      </div>
    </div>
  )
}
