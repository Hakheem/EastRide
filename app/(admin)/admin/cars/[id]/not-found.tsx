// app/cars/[id]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Car, Home, Search } from 'lucide-react'

export default function CarNotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
                <CardContent className="pt-6 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
                            <Car className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Car Not Found</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            The car you're looking for doesn't exist or has been removed from our inventory.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button asChild className="flex-1">
                            <Link href="/cars">
                                <Search className="mr-2 h-4 w-4" />
                                Browse Cars
                            </Link>
                        </Button>
                        <Button variant="outline" asChild className="flex-1">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
