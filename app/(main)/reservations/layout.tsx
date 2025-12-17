import type { Metadata } from "next"

export const metadata: Metadata = {
  title: 'My Test Drive Bookings | EastRide',
  description: 'View and manage your upcoming and past test drive reservations.',
}

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
