import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Cars | EastRide Admin",
    description: "Manage cars available in your dealership's inventory.",
}

export default function AdminCarsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
