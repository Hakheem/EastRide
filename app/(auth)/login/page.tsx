// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/forms/LoginForm'
import Image from 'next/image'

export default async function LoginPage() { 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
      {/* Left Side - Image with Overlay */}
      <div className="relative h-full overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-400 to-blue-800">
          <div className="absolute inset-0 opacity-20 bg-[url('/gtr.png')] bg-center"></div>
        </div>
        
        {/* Gradient Overlay (top right to bottom left) */}
        <div className="absolute inset-0 bg-linear-to-tl from-blue-900/80 via-transparent to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-end p-8">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white"></div>
              </div>
              <h1 className="text-4xl font-bold text-white">
                East<span className="text-gradient">Ride</span>
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

      {/* Right Side - Form */}
      <div className="p-8 lg:p-10">
        {/* Form Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            {/* Logo for mobile/tablet */}
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center lg:hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              East<span className="text-blue-600 dark:text-blue-400">Ride</span>
            </h1>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />


        {/* Privacy and Policy */}
        <div className="mt-8 ">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By continuing, you agree to East Africa Rides' {' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms of Service</a>{' '}
            and {' '}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-5">
            © {new Date().getFullYear()} East Africa Rides. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

