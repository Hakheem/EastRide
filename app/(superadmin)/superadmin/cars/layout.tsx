import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Cars | EastRide Super Admin",
    description: "Super admin management for cars inventory.",
}

export default function SuperAdminCarsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}

