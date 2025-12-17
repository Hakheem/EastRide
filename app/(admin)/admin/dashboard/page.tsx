import { requireAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import DashboardStats from '@/components/admin/DashboardStats'

export const metadata = {
  title: 'Admin Dashboard Panel',
  description: 'Admin dashboard with key metrics and statistics',
}

export default async function AdminDashboardPage() {
  try {
    await requireAdmin()
  } catch (error) {
    redirect('/')
  }

  return (
    <DashboardStats 
      title="Admin Dashboard"
      description="Overview of dealership performance and key metrics"
      userRole="admin"
    />
  )
}
