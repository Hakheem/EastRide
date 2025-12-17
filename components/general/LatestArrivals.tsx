"use client";

import React, { useEffect, useState } from "react";
import { CarType } from "@/types/car";
import FeaturedCarsCard from "./FeaturedCarsCard";
import { getHomeCars } from "@/app/actions/home";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          images: car.images?.length ? car.images : ["/placeholder.jpg"],
          image: car.images?.[0] ?? "/placeholder.jpg",
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

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12 padded">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Arrivals
          </h2>
          <Button variant="outline" className="text-sm p-0" asChild>
            <Link href="/cars">
              View All
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Skeleton */}
        <div className="md:hidden">
          <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="min-w-[280px] shrink-0">
                <div className="space-y-3">
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
              </div>
            ))}
          </div>
        </div>

        {/* Tablet & Desktop Skeleton */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Arrivals
          </h2>
          <Button variant="outline" className="text-sm p-0" asChild>
            <Link href="/cars">
              View All
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No New Arrivals Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Check back soon! We're constantly adding new cars to our inventory.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Latest Arrivals
        </h2>
        <Button variant="outline" className="text-sm p-0" asChild>
          <Link href="/cars">
            View All
            <ChevronRight className="size-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Mobile - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {latestCars.map((car) => (
            <div key={car.id} className="min-w-[280px] shrink-0">
              <FeaturedCarsCard car={car} />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden md:grid lg:hidden md:grid-cols-2 gap-6">
        {latestCars.slice(0, 4).map((car) => (
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {latestCars.map((car) => (
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>
    </section>
  );
};

export default LatestArrivals;

