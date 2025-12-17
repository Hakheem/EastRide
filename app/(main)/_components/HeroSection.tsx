"use client"

import { motion } from 'framer-motion'
import HomeSearch from "@/components/general/HomeSearch";
import HeroImageGallery from "./HeroImageGallery";

export default function HeroSection() {
  return (
    <div className="
      bg-linear-to-br from-sky-200 via-white to-cyan-100
      dark:bg-linear-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800/50
      mx-4 md:mx-8 lg:mx-16 my-4 rounded-xl lg:max-h-fit
      relative overflow-hidden
    ">
      {/* Additional linear overlay for depth */}
      <div className="
        absolute inset-0 
        bg-linear-to-br from-transparent via-transparent to-primary/5
        dark:bg-linear-to-br dark:from-transparent dark:via-transparent dark:to-gray-700/20
        pointer-events-none
      " />
      
      <div className="relative overflow-hidden z-10">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column: Text Content */}
          <div className="flex flex-col px-4 md:pl-6 justify-center ">
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
                className="mb-6 mt-12 md:mt-0 inline-flex w-fit items-center rounded-full bg-primary/10 px-4 py-2 backdrop-blur-sm"
              >
                <span className="text-xs md:text-sm font-medium md:font-semibold  text-primary dark:text-primary-foreground">
                  🚗 East Africa's No. 1 Car Marketplace
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl"
              >
                Find Your Perfect{' '}
                <span className="
                  text-gradient
                ">
                  Ride
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-8 md:text-md  lg:max-w-[85%] text-gray-700 dark:text-gray-300"
              >
                Browse through hundreds of verified cars from across 
                East Africa. Advanced AI powered car search and test drive. Let's find the perfect vehicle that 
                matches your style and budget.
              </motion.p>

              {/* Search Component */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mb-4 md:max-w-[80%]  "
              >
                <HomeSearch />
              </motion.div>
            </motion.div>
          </div>

          {/* Image Gallery */}
          <div className="relative min-h-[300px] lg:min-h-[500px]">
            <HeroImageGallery intervalMinutes={0.6} /> 
          </div>
        </div>
      </div>
    </div>
  )
}

