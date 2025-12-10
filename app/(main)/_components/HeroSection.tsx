import HomeSearch from "@/components/general/HomeSearch";
import HeroImageGallery from "./HeroImageGallery";

export default function HeroSection() {
  return (
    <div className="mx-auto bg-blue-100 dark:bg-gray-900 p-4">
      <div className="overflow-hidden ">
        <div className="grid lg:grid-cols-2">
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center p-2">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2">
              <span className="text-sm font-semibold text-primary dark:text-primary-foreground">
                🚗 East Africa's No. 1 Car Marketplace
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
              Find Your Perfect{' '}
              <span className="bg-linear-to-br from-primary to-cyan-500 bg-clip-text text-transparent">
                Ride
              </span>
            </h1>

            {/* Description */}
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 md:text-xl">
              Browse through hundreds of verified cars from trusted sellers across 
              Kenya, Tanzania, Uganda, and Rwanda. Find the perfect vehicle that 
              matches your style and budget.
            </p>

            {/* Search Component */}
            <div className="mb-6">
              <HomeSearch />
            </div>
          </div>

          {/* Right Column: Image Gallery */}
          <div className="relative min-h-[300px] lg:min-h-[400px]">
            <HeroImageGallery intervalMinutes={2} />
          </div>
        </div>
      </div>
    </div>
  )
}

