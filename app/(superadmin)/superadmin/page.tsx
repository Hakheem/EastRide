import { auth } from "@/app/utils/auth";

export default async function SuperAdminPage() {
    const session = await auth();

    console.log("📄 SuperAdmin Page - User Role:", (session?.user as any)?.role);

    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold mb-8">SuperAdmin Dashboard</h1>
            <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-lg p-8">
                <p className="text-lg">Welcome, {session?.user?.name}!</p>
                <p className="text-sm opacity-90 mt-2">
                    You have full system access as a SuperAdmin.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">User Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Manage all users and their roles
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">System Settings</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Configure system-wide settings
                    </p>
                </div>
            </div>
        </div>
    );
}

