import { auth } from "@/app/utils/auth"
import { UserManagementPanel } from "@/components/admin/UserManagementPanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
    const session = await auth()
    const userRole = (session?.user as any)?.role

    console.log("📄 Admin Page - User Role:", userRole);

    return (
        <div className="min-h-screen   ">
          
        </div>
    )
}

