"use client";

import React, { useEffect, useState } from "react";
import { CarType } from "@/types/car";
import FeaturedCarsCard from "./FeaturedCarsCard";
import { getHomeCars } from "@/app/actions/home";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, AlertCircle } from "lucide-react";

const LatestArrivals = () => {
  const [latestCars, setLatestCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const data = await getHomeCars();

        const normalizedCars: CarType[] = data.map((car: any) => ({
          id: car.id.toString(),
          name: `${car.make} ${car.model}`,
          make: car.make,
          model: car.model,
          year: car.year,
          price: car.price,
          mileage: car.mileage,
          fuelType: car.fuelType,
          transmission: car.transmission,
          bodyType: car.bodyType,
          status: car.status,
          featured: car.featured,
          color: car.color?.trim() && car.color !== "" ? car.color : "Unknown",
          wishListed: false,
          images: car.images?.length ? car.images : car.image ? [car.image] : ["/placeholder.jpg"],
          features: car.features ?? [],
          createdAt: car.createdAt ? new Date(car.createdAt) : undefined,
        }));

        setLatestCars(normalizedCars);
      } catch (err) {
        console.error("Failed to fetch latest cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Loading skeleton - one row only
  if (loading) {
    return (
      <section className="py-12 padded">
        <h2 className="text-2xl font-bold mb-6">Latest Arrivals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Empty state
  if (!latestCars.length) {
    return (
      <section className="py-12 padded">
        <h2 className="text-2xl font-bold mb-6">Latest Arrivals</h2>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No New Arrivals Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Check back soon! We're constantly adding new cars to our inventory.
          </p>
          <div className="flex gap-3">
            <a 
              href="/cars" 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Cars
            </a>
            <a 
              href="/sell" 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sell Your Car
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 padded">
      <h2 className="text-2xl font-bold mb-6">Latest Arrivals</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 max-h-[calc(3*20rem)]">
        {latestCars.map((car) => (
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
};

export default LatestArrivals;

