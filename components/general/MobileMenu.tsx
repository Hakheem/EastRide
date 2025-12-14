'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Session } from 'next-auth'
import { Home, Car, Phone, X, LogOut } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  onLogoutClick: () => void
}

export default function MobileMenu({ isOpen, session, onClose, onLogoutClick }: MobileMenuProps) {
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
                <nav className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link 
                      href="/" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={onClose}
                    >
                      <Home className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Link 
                      href="/cars" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={onClose}
                    >
                      <Car className="w-5 h-5" />
                      <span>Browse Cars</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link 
                      href="/contact" 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                      onClick={onClose}
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contact Us</span>
                    </Link>
                  </motion.div>

                  {/* Logout button for logged in users */}
                  {session && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-8"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 text-red-600 dark:text-red-400"
                        onClick={() => {
                          onLogoutClick()
                          onClose()
                        }}
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </motion.div>
                  )}
                </nav>
              </div>

              {/* For non-logged in users */}
              {!session && (
                <div className="p-6 border-t">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link href="/login" onClick={onClose}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
