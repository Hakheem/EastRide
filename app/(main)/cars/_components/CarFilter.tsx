"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sliders, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCarListings } from "@/app/actions/car-listing";

interface CarFiltersProps {
  currentFilters: {
    make?: string;
    bodyType?: string;
    transmission?: string;
    fuelType?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export default function CarFilters({ currentFilters }: CarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    make: currentFilters.make || "",
    bodyType: currentFilters.bodyType || "",
    transmission: currentFilters.transmission || "",
    fuelType: currentFilters.fuelType || "",
    minPrice: currentFilters.minPrice?.toString() || "",
    maxPrice: currentFilters.maxPrice?.toString() || "",
  });

  const [filterOptions, setFilterOptions] = useState({
    makes: [] as string[],
    bodyTypes: [] as string[],
    transmissions: [] as string[],
    fuelTypes: [] as string[],
    priceRange: { min: 0, max: 10000000 },
  });

  // Sync filters when URL changes
  useEffect(() => {
    setFilters({
      make: currentFilters.make || "",
      bodyType: currentFilters.bodyType || "",
      transmission: currentFilters.transmission || "",
      fuelType: currentFilters.fuelType || "",
      minPrice: currentFilters.minPrice?.toString() || "",
      maxPrice: currentFilters.maxPrice?.toString() || "",
    });
  }, [currentFilters]);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const result = await getCarListings({}, "NEWEST", 1, 1);
      if (result.success && result.data) {
        setFilterOptions({
          makes: result.data.filters.makes,
          bodyTypes: result.data.filters.bodyTypes,
          transmissions: result.data.filters.transmissions,
          fuelTypes: result.data.filters.fuelTypes,
          priceRange: result.data.filters.price,
        });
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    console.log(`Filter changed: ${key} = ${value}`);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    console.log("Applying filters:", filters);
    
    // Create new params object
    const params = new URLSearchParams();
    
    // Keep existing sort if it exists
    const sort = searchParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }
    
    // Add non-empty filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim() !== "") {
        params.set(key, value.toString());
      }
    });
    
    // Always reset to page 1 when filters change
    params.set("page", "1");
    
    const newUrl = `/cars?${params.toString()}`;
    console.log("Navigating to:", newUrl);
    router.push(newUrl);
  };

  const clearFilters = () => {
    console.log("Clearing all filters");
    setFilters({
      make: "",
      bodyType: "",
      transmission: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
    });

    const params = new URLSearchParams();
    // Keep sort if it exists
    const sort = searchParams.get("sort");
    if (sort) params.set("sort", sort);
    params.set("page", "1");
    
    console.log("Navigating to cleared URL");
    router.push(`/cars?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
    return `${price}`;
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full ">
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Make */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full ">
            Make
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {filterOptions.makes.map((make) => (
              <button
                key={make}
                onClick={() => handleFilterChange("make", filters.make === make ? "" : make)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filters.make === make
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-primary"
                }`}
              >
                {make}
              </button>
            ))}
          </div>
        </div>

        {/* Body Type */}
        <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full ">
            Body Type
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {filterOptions.bodyTypes.map((type) => (
              <button
                key={type}
                onClick={() =>
                  handleFilterChange("bodyType", filters.bodyType === type ? "" : type)
                }
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filters.bodyType === type
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-primary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission */}
        <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full ">
            Transmission
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {filterOptions.transmissions.map((trans) => (
              <button
                key={trans}
                onClick={() =>
                  handleFilterChange("transmission", filters.transmission === trans ? "" : trans)
                }
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filters.transmission === trans
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-primary"
                }`}
              >
                {trans}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel Type */}
        <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-full ">
            Fuel Type
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {filterOptions.fuelTypes.map((fuel) => (
              <button
                key={fuel}
                onClick={() =>
                  handleFilterChange("fuelType", filters.fuelType === fuel ? "" : fuel)
                }
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  filters.fuelType === fuel
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-primary"
                }`}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <Button onClick={applyFilters} className="w-full mt-6">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

