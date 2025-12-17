'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Session } from 'next-auth'
import { Home, Car, Phone, X, LogOut, Heart, User, List } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  onLogoutClick: () => void
  currentPath: string
} 

export default function MobileMenu({ isOpen, session, onClose, onLogoutClick, currentPath }: MobileMenuProps) {
  
  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/'
    }
    return currentPath?.startsWith(path)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-background z-50 md:hidden shadow-xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                  />
                  <span className="text-xl font-bold">
                    East<span className="text-primary">Ride</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="space-y-2">
                  {/* Main Navigation */}
                  <div className="pb-4 mb-4 border-b">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                      Navigation
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link 
                        href="/" 
                        className={`
                          flex items-center gap-3 p-3 rounded-lg transition-colors
                          ${isActive('/') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                        `}
                        onClick={onClose}
                      >
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                        {isActive('/') && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Link 
                        href="/cars" 
                        className={`
                          flex items-center gap-3 p-3 rounded-lg transition-colors
                          ${isActive('/cars') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                        `}
                        onClick={onClose}
                      >
                        <Car className="w-5 h-5" />
                        <span>Browse Cars</span>
                        {isActive('/cars') && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Link 
                        href="/contact" 
                        className={`
                          flex items-center gap-3 p-3 rounded-lg transition-colors
                          ${isActive('/contact') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                        `}
                        onClick={onClose}
                      >
                        <Phone className="w-5 h-5" />
                        <span>Contact Us</span>
                        {isActive('/contact') && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                        )}
                      </Link>
                    </motion.div>
                  </div>

                  {/* User Navigation (only for logged in users) */}
                  {session && (
                    <>
                      <div className="pb-4 mb-4 border-b">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                          My Account
                        </p>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                        >
                          <Link 
                            href="/profile" 
                            className={`
                              flex items-center gap-3 p-3 rounded-lg transition-colors
                              ${isActive('/profile') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                            `}
                            onClick={onClose}
                          >
                            <User className="w-5 h-5" />
                            <span>Profile Settings</span>
                            {isActive('/profile') && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                            )}
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <Link 
                            href="/saved-cars" 
                            className={`
                              flex items-center gap-3 p-3 rounded-lg transition-colors
                              ${isActive('/saved-cars') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                            `}
                            onClick={onClose}
                          >
                            <Heart className="w-5 h-5" />
                            <span>Saved Cars</span>
                            {isActive('/saved-cars') && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                            )}
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                        >
                          <Link 
                            href="/reservations" 
                            className={`
                              flex items-center gap-3 p-3 rounded-lg transition-colors
                              ${isActive('/reservations') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                            `}
                            onClick={onClose}
                          >
                            <Car className="w-5 h-5" />
                            <span>My Reservations</span>
                            {isActive('/reservations') && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                            )}
                          </Link>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Link 
                            href="/listings" 
                            className={`
                              flex items-center gap-3 p-3 rounded-lg transition-colors
                              ${isActive('/listings') ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}
                            `}
                            onClick={onClose}
                          >
                            <List className="w-5 h-5" />
                            <span>My Listings</span>
                            {isActive('/listings') && (
                              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                            )}
                          </Link>
                        </motion.div>
                      </div>

                      {/* User Info */}
                      <div className="mb-4 p-4 bg-accent rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          {session.user?.image && (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full"
                              unoptimized
                            />
                          )}
                          <div>
                            <p className="font-semibold text-sm">{session.user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </nav>
              </div>

              {/* Footer with Logout/Get Started */}
              <div className="p-6 border-t">
                {session ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-3 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        onLogoutClick()
                        onClose()
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link href="/login" onClick={onClose}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

