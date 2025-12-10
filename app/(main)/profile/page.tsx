import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="py-12 max-w-2xl">
            <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
                <div className="space-y-6">
                    {/* Profile Info */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                    Name
                                </label>
                                <p className="text-lg font-medium">{session.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                    Email
                                </label>
                                <p className="text-lg font-medium">{session.user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                    Role
                                </label>
                                <p className="text-lg font-medium capitalize">
                                    {session.user.role || "user"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="dark:border-gray-700" />

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                        <div className="space-y-2">
                            <Link href="/saved-cars">
                                <Button variant="outline" className="w-full justify-start">
                                    View Saved Cars
                                </Button>
                            </Link>
                            <Link href="/reservations">
                                <Button variant="outline" className="w-full justify-start">
                                    View Reservations
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
