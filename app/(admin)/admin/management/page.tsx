import { Suspense } from 'react'
import { requireAdmin } from '@/lib/auth-utils'
import { getDealershipInfo } from '@/app/actions/management'
import WorkingHoursManager from '@/components/management/WorkingHoursManager'
import DealershipInfoManager from '@/components/management/DealershipInfoManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Management | Admin Dashboard',
  description: 'Manage dealership settings and working hours'
}

async function ManagementContent() {
  await requireAdmin()
  
  const result = await getDealershipInfo()
  const dealership = result.success ? result.data : null

  return (
    <div className="container mx-auto pb-8 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your dealership information and operating hours
        </p>
      </div>

      <Tabs defaultValue="dealership" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dealership" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dealership Info
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Working Hours
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
      </Tabs>
    </div>
  )
}

function ManagementSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
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

export default function AdminManagementPage() {
  return (
    <Suspense fallback={<ManagementSkeleton />}>
      <ManagementContent />
    </Suspense>
  )
}

