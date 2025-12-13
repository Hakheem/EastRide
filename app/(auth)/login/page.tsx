import { LoginForm } from '@/components/forms/LoginForm'
import Image from 'next/image'

export default async function LoginPage() { 
  return (
    <div className="w-full">
      {/* Form Header  */}
      <div className="flex flex-col items-center text-center gap-3 mb-8">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
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
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          East<span className="text-blue-600 dark:text-blue-400">Ride</span>
        </h1>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Privacy and Policy */}
      <div className="mt-4 ">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By continuing, you agree to East Africa Rides' {' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms of Service</a>{' '}
          and {' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</a>
        </p>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          © {new Date().getFullYear()} East Africa Rides. All rights reserved.
        </p>
      </div>
    </div>
  )
}

