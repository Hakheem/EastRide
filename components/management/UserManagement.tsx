
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { UserRole } from '@prisma/client'
import { promoteUserToAdmin, demoteAdminToUser } from '@/app/actions/management'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  createdAt: Date
  accounts: Array<{ provider: string }>
  _count: {
    savedCars: number
    testDriveBookings: number
  }
}

interface UserManagementProps {
  users: User[]
}

export default function UserManagement({ users }: UserManagementProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionType, setActionType] = useState<'promote' | 'demote' | null>(null)
  const router = useRouter()

  const handleAction = async (user: User, action: 'promote' | 'demote') => {
    setIsLoading(user.id)

    try {
      const isPromote = action === 'promote'
      const apiCall = isPromote ? promoteUserToAdmin : demoteAdminToUser
      const result = await apiCall(user.id)

      if (result.success) {
        toast.success(result.message || `User successfully ${isPromote ? 'promoted' : 'demoted'}.`)
        router.refresh()
      } else {
        toast.error(result.error || `Failed to ${action} user.`)
      }
    } catch (error) {
      console.error(`Error performing action ${action} on user:`, error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(null)
      setDialogOpen(false)
    }
  }

  const openDialog = (user: User, action: 'promote' | 'demote') => {
    setSelectedUser(user)
    setActionType(action)
    setDialogOpen(true)
  }

  const confirmAction = () => {
    if (!selectedUser || !actionType) return
    handleAction(selectedUser, actionType)
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, { variant: "default" | "secondary" | "destructive", color: string }> = {
      USER: { variant: "secondary", color: "bg-gray-500" },
      ADMIN: { variant: "default", color: "bg-blue-500" },
      SUPERADMIN: { variant: "destructive", color: "bg-purple-500" }
    }

    const { variant, color } = variants[role]

    return (
      <Badge variant={variant} className={color}>
        {role}
      </Badge>
    )
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <>
      <Card className='bg-gray-50 dark:bg-gray-900'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions ({users.length} users)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-center">Saved Cars</TableHead>
                  <TableHead className="text-center">Bookings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.accounts[0]?.provider || 'Email'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{user._count.savedCars}</TableCell>
                    <TableCell className="text-center">{user._count.testDriveBookings}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.role === 'USER' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(user, 'promote')}
                            disabled={isLoading === user.id}
                          >
                            {isLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowUp className="h-4 w-4 mr-1" />
                                Promote
                              </>
                            )}
                          </Button>
                        )}
                        {user.role === 'ADMIN' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(user, 'demote')}
                            disabled={isLoading === user.id}
                          >
                            {isLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowDown className="h-4 w-4 mr-1" />
                                Demote
                              </>
                            )}
                          </Button>
                        )}
                        {user.role === 'SUPERADMIN' && (
                          <Badge variant="secondary" className="cursor-not-allowed">
                            Protected
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'promote' ? 'Promote User to Admin' : 'Demote Admin to User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'promote' ? (
                <>
                  Are you sure you want to promote <strong>{selectedUser?.name || selectedUser?.email}</strong> to Admin?
                  They will gain access to the admin dashboard and car management features.
                </>
              ) : (
                <>
                  Are you sure you want to demote <strong>{selectedUser?.name || selectedUser?.email}</strong> to regular User?
                  They will lose access to admin features.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
