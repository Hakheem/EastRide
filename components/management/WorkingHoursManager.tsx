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
import { Switch } from '@/components/ui/switch'
import { Loader2, Clock, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { DayOfWeek } from '@prisma/client'
import { updateAllWorkingHours } from '@/app/actions/management'

const workingHoursSchema = z.object({
  hours: z.array(z.object({
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
    closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
    isOpen: z.boolean()
  }))
})

type WorkingHoursFormValues = z.infer<typeof workingHoursSchema>

interface WorkingHoursManagerProps {
  dealershipId: string | null
  initialHours?: Array<{
    dayOfWeek: DayOfWeek
    openTime: string
    closeTime: string
    isOpen: boolean
  }>
}

const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

const DEFAULT_HOURS = DAYS.map(day => ({
  dayOfWeek: day,
  openTime: day === "SUNDAY" ? "00:00" : day === "SATURDAY" ? "10:00" : "09:00",
  closeTime: day === "SUNDAY" ? "00:00" : day === "SATURDAY" ? "16:00" : "18:00",
  isOpen: day !== "SUNDAY"
}))

export default function WorkingHoursManager({ dealershipId, initialHours }: WorkingHoursManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorkingHoursFormValues>({
    resolver: zodResolver(workingHoursSchema),
    defaultValues: {
      hours: initialHours || DEFAULT_HOURS
    }
  })

  const hours = watch('hours')

  const onSubmit = async (data: WorkingHoursFormValues) => {
    if (!dealershipId) {
      toast.error('Please set up dealership information first')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await updateAllWorkingHours(dealershipId, data.hours)

      if (result.success) {
        toast.success('Working hours updated successfully.')
      } else {
        toast.error(result.error || 'Failed to update working hours')
      }
    } catch (error) {
      console.error('Error updating working hours:', error)
      toast.error('An error occurred while updating working hours')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDayLabel = (day: DayOfWeek) => {
    return day.charAt(0) + day.slice(1).toLowerCase()
  }

  return (
    <Card className='bg-gray-50 dark:bg-gray-900' >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Working Hours
        </CardTitle>
        <CardDescription>
          Set your business operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {DAYS.map((day, index) => {
            const isOpen = hours[index]?.isOpen

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-gray-200 dark:bg-gray-700"
              >
                <input
                  type="hidden"
                  {...register(`hours.${index}.dayOfWeek`)}
                  value={day}
                />

                <div className="w-full sm:w-32 font-medium ">
                  {getDayLabel(day)}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isOpen}
                    onCheckedChange={(checked) => setValue(`hours.${index}.isOpen`, checked)}
                    disabled={isSubmitting}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {isOpen ? 'Open' : 'Closed'}
                  </Label>
                </div>

                {isOpen && (
                  <div className="flex flex-1 items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Opening</Label>
                      <Input
                        type="time"
                        {...register(`hours.${index}.openTime`)}
                        disabled={isSubmitting}
                        className="w-full bg-gray-50 dark:bg-gray-900 "
                      />
                      {errors.hours?.[index]?.openTime && (
                        <p className="text-xs text-red-500">{errors.hours[index]?.openTime?.message}</p>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">Closing</Label>
                      <Input
                        type="time"
                        {...register(`hours.${index}.closeTime`)}
                        disabled={isSubmitting}
                        className="w-full bg-gray-50 dark:bg-gray-900"
                      />
                      {errors.hours?.[index]?.closeTime && (
                        <p className="text-xs text-red-500">{errors.hours[index]?.closeTime?.message}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}

          <Button type="submit" disabled={isSubmitting || !dealershipId} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Working Hours
              </>
            )}
          </Button>

          {!dealershipId && (
            <p className="text-sm text-amber-600 text-center">
              Please initialize dealership information first
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

