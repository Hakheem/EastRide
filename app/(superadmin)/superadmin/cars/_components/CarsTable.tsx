'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
    Eye, 
    Edit, 
    Trash2, 
    Star, 
    MoreVertical,
    Car,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteCar, toggleFeatured, updateCarStatus } from '@/app/actions/cars'

interface Car {
    id: string
    make: string
    model: string
    year: number
    price: number
    mileage: number
    color: string
    status: string
    featured: boolean
    images: string[]
    createdAt: string | Date
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface CarsTableProps {
    cars: Car[]
    pagination: Pagination | null
    searchParams: Record<string, string>
}

export default function CarsTable({ cars, pagination, searchParams }: CarsTableProps) {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [carToDelete, setCarToDelete] = useState<Car | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null)
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            case 'SOLD': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            case 'UNAVAILABLE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const handleDeleteClick = (car: Car) => {
        setCarToDelete(car)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!carToDelete) return

        setIsDeleting(true)
        try {
            const result = await deleteCar(carToDelete.id)
            
            if (result.success) {
                toast.success(`${carToDelete.make} ${carToDelete.model} deleted successfully`)
                setDeleteDialogOpen(false)
                setCarToDelete(null)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to delete car')
            }
        } catch (error) {
            console.error('Error deleting car:', error)
            toast.error('Failed to delete car')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleFeatured = async (car: Car, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        setTogglingFeatured(car.id)
        try {
            const result = await toggleFeatured(car.id)
            
            if (result.success) {
                toast.success(result.message)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update featured status')
            }
        } catch (error) {
            console.error('Error toggling featured:', error)
            toast.error('Failed to update featured status')
        } finally {
            setTogglingFeatured(null)
        }
    }

    const handleStatusUpdate = async (carId: string, newStatus: "AVAILABLE" | "UNAVAILABLE" | "SOLD") => {
        setUpdatingStatus(carId)
        try {
            const result = await updateCarStatus(carId, newStatus)
            
            if (result.success) {
                toast.success(result.message)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        } finally {
            setUpdatingStatus(null)
        }
    }

    return (
        <TooltipProvider>
            <div className="mt-6">
                {/* Summary */}
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Showing {cars.length} of {pagination?.total || 0} cars
                    {pagination && (
                        <span className="ml-2">
                            (Page {pagination.page} of {pagination.totalPages})
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%]">Car</TableHead>
                                <TableHead className="w-[10%]">Year</TableHead>
                                <TableHead className="w-[15%]">Price</TableHead>
                                <TableHead className="w-[15%]">Mileage</TableHead>
                                <TableHead className="w-[12%]">Status</TableHead>
                                <TableHead className="w-[8%]">Featured</TableHead>
                                <TableHead className="w-[10%] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cars.map((car) => (
                                <TableRow key={car.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {car.images?.[0] ? (
                                                <div className="relative w-12 h-12 rounded overflow-hidden shrink-0">
                                                    <Image
                                                        src={car.images[0]}
                                                        alt={`${car.make} ${car.model}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="48px"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                    <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {car.make} {car.model}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {car.color}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{car.year}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(car.price)}
                                    </TableCell>
                                    <TableCell>
                                        {car.mileage.toLocaleString()} km
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(car.status)}>
                                            {car.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={(e) => handleToggleFeatured(car, e)}
                                                    disabled={togglingFeatured === car.id}
                                                    className="transition-all hover:scale-110 disabled:opacity-50 cursor-pointer"
                                                >
                                                    {togglingFeatured === car.id ? (
                                                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                                    ) : car.featured ? (
                                                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <Star className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                                                    )}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{car.featured ? 'Remove from featured' : 'Add to featured'}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="cursor-pointer">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href={`/superadmin/cars/${car.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <Link href={`/superadmin/cars/edit/${car.id}`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger className="cursor-pointer">
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        Update Status
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusUpdate(car.id, "AVAILABLE")}
                                                            disabled={updatingStatus === car.id || car.status === "AVAILABLE"}
                                                            className="cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                                            Available
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusUpdate(car.id, "UNAVAILABLE")}
                                                            disabled={updatingStatus === car.id || car.status === "UNAVAILABLE"}
                                                            className="cursor-pointer"
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4 text-yellow-600" />
                                                            Unavailable
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleStatusUpdate(car.id, "SOLD")}
                                                            disabled={updatingStatus === car.id || car.status === "SOLD"}
                                                            className="cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-red-600" />
                                                            Sold
                                                        </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-red-600 dark:text-red-400 cursor-pointer"
                                                    onClick={() => handleDeleteClick(car)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === 1}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('page', (pagination.page - 1).toString())
                                    router.push(`/superadmin/cars?${params.toString()}`)
                                }}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page === pagination.totalPages}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams)
                                    params.set('page', (pagination.page + 1).toString())
                                    router.push(`/superadmin/cars?${params.toString()}`)
                                }}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{carToDelete?.make} {carToDelete?.model} ({carToDelete?.year})</strong> from your inventory.
                            This action cannot be undone and will also delete all associated images.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </TooltipProvider>
    )
}

