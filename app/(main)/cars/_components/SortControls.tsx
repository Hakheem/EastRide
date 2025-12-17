"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown } from "lucide-react";

interface SortControlsProps {
  currentSort: string;
}

export default function SortControls({ currentSort }: SortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", "1");
    router.push(`/cars?${params.toString()}`);
  };

  const sortOptions = [
    { value: "NEWEST", label: "Newest First" },
    { value: "PRICE_LOW_HIGH", label: "Price: Low to High" },
    { value: "PRICE_HIGH_LOW", label: "Price: High to Low" },
  ];

  return (
    <div className="bg-gray-50 sticky dark:bg-gray-900 rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sort By
        </span>
      </div>
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)} 
          className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

