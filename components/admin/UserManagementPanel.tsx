"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface User {
    _id: string
    email: string
    name?: string
    role: "user" | "admin" | "superadmin"
    image?: string
    createdAt?: string
}

export function UserManagementPanel() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/admin/users")

            if (!response.ok) {
                throw new Error("Failed to fetch users")
            }

            const data = await response.json()
            setUsers(data)
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    const updateUserRole = async (userId: string, newRole: "user" | "admin" | "superadmin") => {
        try {
            setUpdating(userId)
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role: newRole }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to update user")
            }

            // Update local state
            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: newRole } : user
            ))

            toast.success(`User role updated to ${newRole}`)
        } catch (error) {
            console.error("Error updating user:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update user role")
        } finally {
            setUpdating(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <p className="text-gray-500">Loading users...</p>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                    Manage user roles and permissions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.length === 0 ? (
                        <p className="text-sm text-gray-500">No users found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-4">Name</th>
                                        <th className="text-left py-2 px-4">Email</th>
                                        <th className="text-left py-2 px-4">Role</th>
                                        <th className="text-left py-2 px-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {user.image && (
                                                        <img
                                                            src={user.image}
                                                            alt={user.name || "User"}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    )}
                                                    <span>{user.name || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === "superadmin"
                                                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                                        : user.role === "admin"
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Select
                                                    value={user.role}
                                                    onValueChange={(value) =>
                                                        updateUserRole(user._id, value as "user" | "admin" | "superadmin")
                                                    }
                                                    disabled={updating === user._id}
                                                >
                                                    <SelectTrigger className="w-32">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
