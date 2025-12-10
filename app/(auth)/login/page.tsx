import { LoginForm } from '@/components/forms/LoginForm'
import Image from 'next/image'
import { auth } from '@/app/utils/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    redirect('/')
  }

  return (
    <>
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-4">
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="w-12 h-12"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            East<span className="text-primary">Ride</span>
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />

      {/* Privacy and Policy */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By continuing, you agree to EastRide's{' '}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          © {new Date().getFullYear()} EastRide. All rights reserved.
        </p>
      </div>
    </>
  )
}

