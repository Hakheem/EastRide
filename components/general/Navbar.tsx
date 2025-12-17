'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, Car, LogOut, Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    window.location.reload()
  }

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(path)
  }

  const userRole = (session?.user as any)?.role

  return (
    <>
      <nav className={`
        fixed top-0 left-0 right-0 z-50
        bg-background/80 backdrop-blur-md border-b border-border/50
        transition-all duration-200
        ${isScrolled ? 'bg-background/90 backdrop-blur-lg' : ''}
      `}>
        {/* Full width container */}
        <div className="w-full padded  overflow-hidden">
          <div className='grid grid-cols-2 md:grid-cols-3  items-center  py-4'>
            
            {/* Left: Logo  */}
            <div className='flex justify-start'>
              <Link href='/' className="flex flex-row items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8"
                />
                <h1 className='text-2xl font-bold hidden sm:block'>
                  East<span className='text-primary'>Ride</span>
                </h1>
              </Link>
            </div>

            {/* Center: Desktop Navigation  */}
            <div className='hidden md:flex font-medium tracking-tight justify-center items-center gap-5'>
              <Link 
                href="/" 
                className={`
                  hover:text-primary transition-colors relative
                  ${isActive('/') ? 'text-primary' : 'text-foreground'}
                  after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
                  after:bg-primary after:transition-transform after:duration-300
                  ${isActive('/') ? 'after:scale-x-100' : 'after:scale-x-0'}
                  hover:after:scale-x-100
                `}
              >
                Home
              </Link>
              <Link 
                href="/cars" 
                className={`
                  hover:text-primary transition-colors relative
                  ${isActive('/cars') ? 'text-primary' : 'text-foreground'}
                  after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
                  after:bg-primary after:transition-transform after:duration-300
                  ${isActive('/cars') ? 'after:scale-x-100' : 'after:scale-x-0'}
                  hover:after:scale-x-100
                `}
              >
                Browse Cars
              </Link>
              <Link 
                href="/contact" 
                className={`
                  hover:text-primary transition-colors relative
                  ${isActive('/contact') ? 'text-primary' : 'text-foreground'}
                  after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full
                  after:bg-primary after:transition-transform after:duration-300
                  ${isActive('/contact') ? 'after:scale-x-100' : 'after:scale-x-0'}
                  hover:after:scale-x-100
                `}
              >
                Contact Us
              </Link>
            </div>

            {/* Right: User Actions */}
            <div className='flex justify-end items-center gap-2 sm:gap-4'>
              {session?.user ? (
                <>
                  {/* Desktop buttons */}
                  <Link href="/saved-cars" className='hidden sm:block'>
                    <Button 
                      variant="outline" 
                      className={`gap-2 ${isActive('/saved-cars') ? 'border-primary text-primary' : ''}`}
                    >
                      <Heart className='w-4 h-4' />
                      <span>Saved Cars</span>
                    </Button>
                  </Link>

                  <Link href="/reservations" className='hidden sm:block'>
                    <Button 
                      variant="outline" 
                      className={`gap-2 ${isActive('/reservations') ? 'border-primary text-primary' : ''}`}
                    >
                      <Car className='w-4 h-4' />
                      <span>Reservations</span>
                    </Button>
                  </Link>

                  {/* Mobile icons */}
                  <div className='flex items-center gap-2 md:hidden'>
                    <Link href="/saved-cars">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-9 w-9 ${isActive('/saved-cars') ? 'text-primary bg-primary/10' : ''}`}
                      >
                        <Heart className='w-4 h-4' />
                      </Button>
                    </Link>
                    <Link href="/reservations">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-9 w-9 ${isActive('/reservations') ? 'text-primary bg-primary/10' : ''}`}
                      >
                        <Car className='w-4 h-4' />
                      </Button>
                    </Link>
                  </div>

                  {/* Profile Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className='relative shrink-0 focus:outline-none'>
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={36}
                            height={36}
                            className={`
                              w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 
                              ${isActive('/profile') || isActive('/saved-cars') ? 'border-primary' : 'border-primary/20'}
                              hover:border-primary transition-colors cursor-pointer
                            `}
                            unoptimized
                          />
                        ) : (
                          <div className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full 
                            ${isActive('/profile') || isActive('/saved-cars') ? 'bg-primary/20' : 'bg-gray-300 dark:bg-gray-600'}
                            flex items-center justify-center transition-colors
                          `}>
                            <span className='text-xs font-bold'>
                              {session.user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className='px-2 py-1.5'>
                        {session.user.image && (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={36}
                            height={36}
                            className='w-10 h-10 rounded-full mb-2'
                            unoptimized
                          />
                        )}
                        <p className='font-semibold text-sm'>{session.user.name}</p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>{session.user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className={`md:hidden ${isActive('/saved-cars') ? 'text-primary' : ''}`}>
                        <Link href="/saved-cars">Saved Cars</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className={`md:hidden ${isActive('/reservations') ? 'text-primary' : ''}`}>
                        <Link href="/reservations">My Reservations</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className={isActive('/profile') ? 'text-primary' : ''}>
                        <Link href="/profile">Profile Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className={isActive('/saved-cars') ? 'text-primary' : ''}>
                        <Link href="/saved-cars">My Listings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setShowLogoutDialog(true)}
                        className='text-red-600 dark:text-red-400'
                      >
                        <LogOut className='w-4 h-4 mr-2' />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className='md:hidden'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className='w-5 h-5' />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        session={session}
        onLogoutClick={() => setShowLogoutDialog(true)}
        currentPath={pathname}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

