"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { Check, Car, Shield, BadgeCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'


export default function CTA() {
    const { data: session } = useSession()
    const showSignUpButton = !session?.user

    return (
        <section className="relative py-20 md:py-28">
            {/* Single container div with background and everything */}
            <div className="relative flex items-center justify-center bg-linear-to-br from-primary/15 via-background/95 to-cyan-500/20 dark:from-primary/10 dark:via-background/95 dark:to-cyan-500/10 rounded-3xl mx-4 md:mx-8 lg:mx-12 overflow-hidden py-16 md:py-24">

                {/* Background pattern  */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/50 to-background/80 dark:from-background/85 dark:via-background/70 dark:to-background/85" />

                    <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,currentColor_49%,currentColor_51%,transparent_52%)] bg-size-[60px_60px]" />
                    </div>
                </div>

                {/* decorative elements */}
                <motion.div
                    animate={{
                        rotate: [0, 5, 0, -5, 0],
                        y: [0, -10, 0, 10, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-6 left-6 w-16 h-16 opacity-30 dark:opacity-15"
                >
                    <Car className="w-full h-full text-primary/40 dark:text-primary/20" />
                </motion.div>

                <motion.div
                    animate={{
                        rotate: [0, -8, 0, 8, 0],
                        y: [0, 15, 0, -15, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-8 right-8 w-20 h-20 opacity-30 dark:opacity-15"
                >
                    <Shield className="w-full h-full text-primary/40 dark:text-primary/20" />
                </motion.div>

                {/* Left Car - Adjusted positioning */}
                <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.2
                    }}
                    className="absolute -left-32 md:-left-24 top-1/2 -translate-y-1/2 w-1/3 md:w-2/5 h-3/5"
                >
                    <div
                        className="h-full w-full bg-cover rounded-r-xl"
                        style={{
                            backgroundImage: 'url("/cta-left.png")',
                            backgroundPosition: 'right center',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                    {/* Enhanced gradient overlay - stronger for light mode */}
                    <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/50 to-transparent dark:from-background/90 dark:via-background/50 dark:to-transparent" />
                </motion.div>

                {/* Right Car - Adjusted positioning */}
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.2
                    }}
                    className="absolute -right-32 md:-right-24 top-1/2 -translate-y-1/2 w-1/3 md:w-2/5 h-3/5"
                >
                    <div
                        className="h-full w-full bg-cover rounded-l-xl"
                        style={{
                            backgroundImage: 'url("/cta-right.png")',
                            backgroundPosition: 'left center',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                    <div className="absolute inset-0 bg-linear-to-l from-background/90 via-background/50 to-transparent dark:from-background/90 dark:via-background/50 dark:to-transparent" />
                </motion.div>

                {/* Center Content */}
                <div className="relative z-20 text-center max-w-2xl mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 }}
                        className="text-3xl  lg:text-5xl capitalize font-bold text-gray-900 dark:text-white mb-6"
                    >
                        Ready to find your <br /> <span className="text-gradient">Dream Car?</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                        className="text-lg max-w-xl text-gray-800 dark:text-gray-200 mb-10"
                    >
                        Join thousands of satisfied customers who found their perfect vehicle
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
                    >
                        <Button asChild size="lg" className="text-base px-8 py-6 shadow hover:shadow-sm transition-shadow">
                            <Link href="/cars">
                                View All Cars
                            </Link>
                        </Button>

                        {showSignUpButton && (
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="text-base px-8 py-6 shadow hover:shadow-sm transition-shadow"
                            >
                                <Link href="/login">
                                    Sign Up Now
                                </Link>
                            </Button>
                        )}
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1 }}
                        className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 text-sm text-gray-700 dark:text-gray-300"
                    >
                        <Badge variant='secondary' className="flex items-center justify-center gap-2 px-4 py-2 rounded-full">
                            <BadgeCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                            150+ Point Inspection
                        </Badge>
                        <Badge variant='secondary' className="flex items-center justify-center gap-2 px-4 py-2 rounded-full">
                            <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            7-Day Return Policy
                        </Badge>
                        <Badge variant='secondary' className="flex items-center justify-center gap-2 px-4 py-2 rounded-full">
                            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            Verified Sellers
                        </Badge>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

