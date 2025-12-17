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
   

      <DashboardStats 
        title="Dealership Performance"
        description="Key metrics across all dealerships and departments"
        userRole="superadmin"
      />

    
    </div>
  )
}

