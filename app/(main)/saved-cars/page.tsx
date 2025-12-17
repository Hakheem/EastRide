import { auth } from "@/app/utils/auth";
import { redirect } from "next/navigation";
import { getSavedCars } from "@/app/actions/saved-cars";
import FeaturedCarsCard from "@/components/general/FeaturedCarsCard";
import { Button } from "@/components/ui/button";
import { Heart, Car } from 'lucide-react';
import Link from 'next/link';

export default async function SavedCarsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const savedCarsResult = await getSavedCars();

    if (!savedCarsResult.success) {
        return (
            <div className="padded pb-12">
                <h1 className="text-4xl font-bold mb-6">Saved Cars</h1>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
                    <Heart className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">
                        {savedCarsResult.error}
                    </h2>
                    <p className="text-red-600 dark:text-red-400">
                        Please try again later
                    </p>
                </div>
            </div>
        );
    }

    const savedCars = savedCarsResult.data || [];

    if (savedCars.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">No saved cars yet</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Save your favorite cars by clicking the heart icon on car listings
                    </p>
                    <Button asChild size="lg">
                        <Link href="/cars">
                            <Car className="w-5 h-5 mr-2" />
                            Browse Available Cars
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="padded pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Saved Cars</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {savedCars.length} {savedCars.length === 1 ? 'car' : 'cars'} saved
                    </p>
                </div>
                <Button asChild variant="outline" className="mt-4 md:mt-0">
                    <Link href="/cars">
                        <Car className="w-4 h-4 mr-2" />
                        Browse More Cars
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedCars.map((car) => (
                    <FeaturedCarsCard key={car.id} car={car} />
                ))}
            </div>
        </div>
    );
}

