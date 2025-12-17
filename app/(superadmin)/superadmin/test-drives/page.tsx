import { requireSuperAdmin } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import TestDriveManagement from '@/components/admin/TestDriveManagement'

export const metadata = {
  title: 'Test Drive Management | Super Admin Dashboard',
  description: 'Manage all test drive bookings',
}

export default async function SuperAdminTestDrivesPage() {
  try {
    await requireSuperAdmin()
  } catch (error) {
    redirect('/')
  }

  return (
    <TestDriveManagement
      title="Test Drive Management"
      description="Manage all test drive bookings across the dealership. Update statuses, view details, and communicate with customers."
    />
  )
}

