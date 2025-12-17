'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2, Save } from 'lucide-react'
import { updateDealershipInfo, initializeDealership } from '@/app/actions/management'
import { useRouter } from 'next/navigation'

const dealershipSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address")
})

type DealershipFormValues = z.infer<typeof dealershipSchema>

interface DealershipInfoManagerProps {
  initialData?: {
    id: string
    name: string
    address: string
    phone: string
    email: string
  } | null
}

export default function DealershipInfoManager({ initialData }: DealershipInfoManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<DealershipFormValues>({
    resolver: zodResolver(dealershipSchema),
    defaultValues: initialData || {
      name: "East Africa Rides",
      address: "35/60 Nairobi Kenya",
      phone: "+254769403162",
      email: "hakheem67@gmail.com"
    }
  })

  const onSubmit = async (data: DealershipFormValues) => {
    setIsSubmitting(true)

    try {
      let result;
      
      if (!initialData) {
        // Initialize dealership first
        const initResult = await initializeDealership()
        if (!initResult.success) {
          toast.error(initResult.error || 'Failed to initialize dealership')
          return
        }
      }

      result = await updateDealershipInfo(data)

      if (result.success) {
        toast.success('Dealership information updated successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update dealership information')
      }
    } catch (error) {
      console.error('Error updating dealership:', error)
      toast.error('An error occurred while updating dealership information')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className='bg-gray-50 dark:bg-gray-900'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Dealership Information
        </CardTitle>
        <CardDescription>
          Update your dealership's basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="East Africa Rides"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="35/60 Nairobi Kenya"
              disabled={isSubmitting}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+254769403162"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="hakheem67@gmail.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Information
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}