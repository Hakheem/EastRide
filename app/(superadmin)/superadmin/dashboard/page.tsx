// /app/superadmin/dashboard/page.tsx
import { requireSuperAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import DashboardStats from '@/components/admin/DashboardStats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BarChart3, Download } from 'lucide-react'

export const metadata = {
  title: 'Super Admin Panel',
  description: 'Super admin dashboard with advanced analytics',
}

export default async function SuperAdminDashboardPage() {
  try {
    await requireSuperAdmin()
  } catch (error) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete overview with advanced analytics and system controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div> 
      </div>

      <DashboardStats 
        title="Dealership Performance"
        description="Key metrics across all dealerships and departments"
        userRole="superadmin"
      />

      {/* Additional SuperAdmin Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage admin accounts, permissions, and user roles across the platform.
            </p>
            <Button className="w-full mt-4" variant="outline">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database:</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Status:</span>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime:</span>
                <span className="text-sm font-medium">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor system logs, audit trails, and recent administrative actions.
            </p>
            <Button className="w-full mt-4" variant="outline">
              View Activity Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

