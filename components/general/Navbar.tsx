'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Car } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function Navbar() {
    const { data: session } = useSession()
    const router = useRouter()

    // Redirect admins/superadmins to their respective pages if they try to access main site
    useEffect(() => {
        const userRole = (session?.user as any)?.role
        if (userRole === 'superadmin') {
            router.push('/superadmin')
        } else if (userRole === 'admin') {
            router.push('/admin')
        }
    }, [(session?.user as any)?.role, router])

    const handleLogout = async () => {
        await signOut({ redirectTo: '/login' })
    }

    return (
        <nav className='flex justify-between items-center padded py-4'>
            <Link href='/' className="flex items-center gap-2">
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

            <div className='flex items-center gap-2 sm:gap-4'>
                {session?.user ? (
                    <>
                        {/* Saved Cars Button - hidden on mobile */}
                        <Link href="/saved-cars" className='hidden sm:block'>
                            <Button variant="outline"  className='gap-2'>
                                <Heart className='w-4 h-4' />
                                <span>Saved Cars</span>
                            </Button>
                        </Link>

                        {/* Reservations Button - hidden on mobile */}
                        <Link href="/reservations" className='hidden sm:block'>
                            <Button variant="outline"  className='gap-2'>
                                <Car className='w-4 h-4' />
                                <span>Reservations</span>
                            </Button>
                        </Link>

                        {/* Mobile Icons */}
                        <div className='flex gap-2 sm:hidden'>
                            <Link href="/saved-cars">
                                <Button variant="ghost" size="icon" className='h-9 w-9'>
                                    <Heart className='w-4 h-4' />
                                </Button>
                            </Link>
                            <Link href="/reservations">
                                <Button variant="ghost" size="icon" className='h-9 w-9'>
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
                                            alt={session.user.name || "User"}
                                            width={32}
                                            height={32}
                                            className='w-8 h-8  rounded-full  cursor-pointer'
                                            unoptimized
                                        />
                                    ) : (
                                        <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center'>
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
                                            width={48}
                                            height={48}
                                            className='w-12 h-12 rounded-full mb-2'
                                            unoptimized
                                        />
                                    )}
                                    <p className='font-semibold text-sm'>{session.user.name}</p>
                                    <p className='text-xs text-gray-500 dark:text-gray-400'>{session.user.email}</p>
                                    {(session.user as any)?.role && (
                                        <p className='text-xs text-primary font-medium mt-1'>
                                            {((session.user as any)?.role as string).charAt(0).toUpperCase() + ((session.user as any)?.role as string).slice(1)}
                                        </p>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className='sm:hidden'>
                                    <Link href="/saved-cars">Saved Cars</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className='sm:hidden'>
                                    <Link href="/reservations">My Reservations</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">Profile Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className='text-red-600 dark:text-red-400'>
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button>Login</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

