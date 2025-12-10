import { auth } from "@/app/utils/auth"
import { redirect } from "next/navigation"
import { UserManagementPanel } from "@/components/admin/UserManagementPanel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
    const session = await auth()

    // Check if user is authenticated and is admin or superadmin
    if (!session?.user) {
        redirect("/login")
    }

    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
        redirect("/admin")
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Welcome, <span className="font-semibold">{session.user.name}</span>
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">
                                {session.user.role}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Email</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm truncate">
                                {session.user.email}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                Active
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Management */}
                <UserManagementPanel />
            </div>
        </div>
    )
}
