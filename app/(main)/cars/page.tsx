import CarFilters from "./_components/CarFilter";
import CarGrid from "./_components/CarsGrid";
import SortControls from "./_components/SortControls";

// Add this to prevent caching and ensure dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ IMPORTANT: Await the searchParams Promise
  const params = await searchParams;
  
  // Extract params with defaults
  const page = params.page ? parseInt(params.page as string) : 1;
  const sort = (params.sort as string) || "NEWEST";
  const make = params.make as string;
  const bodyType = params.bodyType as string;
  const transmission = params.transmission as string;
  const fuelType = params.fuelType as string;
  const minPrice = params.minPrice
    ? parseInt(params.minPrice as string)
    : undefined;
  const maxPrice = params.maxPrice
    ? parseInt(params.maxPrice as string)
    : undefined;

  console.log("🚀 CarsPage rendering with params:", {
    page,
    sort,
    make,
    bodyType,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar - Sticky */}
      <aside className="lg:w-1/4 lg:sticky lg:block">
        <div className="sticky lg:block top-24 space-y-4">
          {/* Sort Controls */}
          <SortControls currentSort={sort} />

          {/* Filters */}
          <CarFilters
            currentFilters={{
              make,
              bodyType,
              transmission,
              fuelType,
              minPrice,
              maxPrice,
            }}
          />
        </div>
      </aside>

      {/* Cars Grid */}
      <main className="lg:w-3/4">
        <CarGrid
          filters={{
            make,
            bodyType,
            transmission,
            fuelType,
            minPrice,
            maxPrice,
          }}
          sort={sort as any}
          page={page}
        />
      </main>
    </div>
  );
}

