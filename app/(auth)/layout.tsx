import { ReactNode } from "react"
import Image from 'next/image'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-lnear-to-br from-blue-200 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="min-h-screen grid grid-cols-1 xl:grid-cols-2">
        {/* Left Side - Hidden on ALL screens except desktop (xl) */}
        <div className="hidden xl:block relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-800">
            <div className="absolute inset-0 opacity-20 bg-[url('/gtr.png')] bg-cover bg-center"></div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-tl from-blue-900/80 via-transparent to-transparent"></div>
          
          {/* Content Overlay - Keep as it was (left-aligned) */}
          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="max-w-md">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="relative w-8 h-8">
                    <Image 
                      src="/logo.png" 
                      alt="EastRide Logo"
                      fill
                      className="object-contain"
                      sizes="32px"
                    />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white">
                  East<span className="text-blue-300">Ride</span>
                </h1>
              </div>
              
              {/* Full Name */}
              <h2 className="text-2xl font-bold text-white mb-2">
                East Africa Rides
              </h2>
              
              {/* Description */}
              <p className="text-blue-100/90 text-lg leading-relaxed">
                Your premier car marketplace across East Africa. 
                Discover, buy, and sell vehicles with confidence. 
                Join thousands of satisfied customers in our growing community.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 xl:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

