
import { Suspense } from 'react'
import { requireSuperAdmin } from '@/lib/auth-utils'
import { getDealershipInfo, getAllUsersForManagement } from '@/app/actions/management'
import WorkingHoursManager from '@/components/management/WorkingHoursManager'
import DealershipInfoManager from '@/components/management/DealershipInfoManager'
import UserManagement from '@/components/management/UserManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Clock, Users } from 'lucide-react'

export const metadata = {
  title: 'Management | Superadmin Dashboard',
  description: 'Manage dealership settings, working hours, and users'
}

async function SuperAdminManagementContent() {
  await requireSuperAdmin()
  
  const [dealershipResult, usersResult] = await Promise.all([
    getDealershipInfo(),
    getAllUsersForManagement()
  ])

  const dealership = dealershipResult.success ? dealershipResult.data : null
  const users = (usersResult.success && usersResult.data) ? usersResult.data : []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your dealership, working hours, and user permissions
        </p>
      </div>

      <Tabs defaultValue="dealership" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="dealership" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dealership
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Working Hours
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealership" className="space-y-6">
          <DealershipInfoManager initialData={dealership} />
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <WorkingHoursManager 
            dealershipId={dealership?.id || null}
            initialHours={dealership?.workingHours}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement users={users} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SuperAdminManagementSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-2xl" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SuperAdminManagementPage() {
  return (
    <Suspense fallback={<SuperAdminManagementSkeleton />}>
      <SuperAdminManagementContent />
    </Suspense>
  )
}
