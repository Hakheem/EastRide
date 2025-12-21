"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FeaturedCarsCard from "@/components/general/FeaturedCarsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import { getCarListings } from "@/app/actions/car-listing";

interface CarGridProps {
  filters: any;
  sort: string;
  page: number;
}

export default function CarGrid({ filters, sort, page }: CarGridProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchCars = async () => { 
      setLoading(true);
      try {
        const result = await getCarListings(filters, sort as any, page, 15);
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters, sort, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/cars?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
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
      </div>
    );
  }

  if (!data || data.cars.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Car className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Cars Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Try adjusting your filters or search to find what you're looking for.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            const params = new URLSearchParams();
            const sort = searchParams.get("sort");
            if (sort) params.set("sort", sort);
            params.set("page", "1");
            router.push(`/cars?${params.toString()}`);
          }}
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Count */}
      <div className="flex justify-end items-center  ">
        <p className="text-gray-600 dark:text-gray-400 text-sm justify-end">
          Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, data.total)} of {data.total} cars
        </p>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.cars.map((car: any) => (
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (data.pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pagination.totalPages - 2) {
                pageNum = data.pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-10 h-10"
                >
                  {pageNum}
                </Button>
              );
            })}

            {data.pagination.totalPages > 5 && page < data.pagination.totalPages - 2 && (
              <>
                <span className="mx-2">...</span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.pagination.totalPages)}
                  className="w-10 h-10"
                >
                  {data.pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= data.pagination.totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

