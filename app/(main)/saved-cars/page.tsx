import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";

export default async function SavedCarsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="py-12">
            <h1 className="text-4xl font-bold mb-8">Saved Cars</h1>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                    You haven't saved any cars yet. Start exploring!
                </p>
            </div>
        </div>
    );
}
