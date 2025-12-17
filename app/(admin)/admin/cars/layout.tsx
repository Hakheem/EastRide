import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Admin Cars | EastRide",
    description: "Manage cars available in your dealership's inventory.",
}

export default function CarsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
