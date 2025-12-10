import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";

export default async function ReservationsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold mb-8">My Reservations</h1>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    You don't have any reservations yet.
                </p>
            </div>
        </div>
    );
}
