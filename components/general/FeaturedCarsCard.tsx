"use client";

import React, { useState, useRef, useEffect } from "react"; 
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Fuel, Cog, Palette, Gauge } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleSaveCar } from "@/app/actions/car-listing";
import { formatPrice } from "@/lib/client/car-utils";

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color?: string;
  images: string[];
  image?: string;
  wishListed?: boolean;
}

interface FeaturedCarsCardProps {
  car: Car;
}

const FeaturedCarsCard = ({ car }: FeaturedCarsCardProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [wishlisted, setWishlisted] = useState(car.wishListed || false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Ensure we always have valid images
  const images = React.useMemo(() => {
    const carImages = car.images || [];
    const validImages = carImages.filter(img => img && img.trim() !== "");
    return validImages.length > 0 ? validImages : ["/placeholder.jpg"];
  }, [car.images]);

  const carName = `${car.make} ${car.model}`;

  // Reset activeImageIndex if it's out of bounds
  useEffect(() => {
    if (activeImageIndex >= images.length) {
      setActiveImageIndex(0);
    }
  }, [images.length, activeImageIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!galleryRef.current || images.length <= 1) return;

    const { left, width } = galleryRef.current.getBoundingClientRect();
    const x = e.clientX - left;

    const segmentWidth = width / images.length;
    const newIndex = Math.min(Math.floor(x / segmentWidth), images.length - 1);

    if (newIndex !== activeImageIndex) setActiveImageIndex(newIndex);
  };

  const handleMouseEnter = () => {
    if (images.length > 1) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveImageIndex(0);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTogglingWishlist) return;

    setIsTogglingWishlist(true);

    try {
      const result = await toggleSaveCar(car.id);

      if (result.success) {
        setWishlisted(result.saved ?? false);
        toast.success(result.message);
      } else if (result.requiresAuth) {
        toast.error("Please login to save cars");
        router.push("/login");
      } else {
        toast.error(result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Something went wrong");
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  // Get the current image, ensuring it's not empty
  const currentImage = images[activeImageIndex] || images[0] || "/placeholder.jpg";

  return (
    <Card className="overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col p-0">
      {/* Image Gallery */} 
      <div
        ref={galleryRef}
        className="relative h-48 md:h-56 overflow-hidden shrink-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
          <Image
            src={currentImage}
            alt={`${carName} - View ${activeImageIndex + 1}`}
            fill
            className="object-contain block m-0 p-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.png";
            }}
          />

          {/* Wishlist Icon */}
          <button
            onClick={toggleWishlist}
            disabled={isTogglingWishlist}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-red-500"
              }`}
            />
          </button>

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all ${
                    index === activeImageIndex
                      ? "w-6 bg-white"
                      : "w-1 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{carName}</h3>

        <div className="mb-2">
          <span className="text-2xl font-bold text-gradient">{formatPrice(car.price)}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Badge variant="outline" className="font-semibold">
            {car.year}
          </Badge>
          <span className="flex items-center gap-1">
            <Cog className="w-3.5 h-3.5" />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" />
            {car.fuelType}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="secondary" className="flex items-center">
            {car.bodyType}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {car.mileage >= 1000
              ? `${(car.mileage / 1000).toFixed(0)}k km`
              : `${car.mileage} km`}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Palette className="w-3 h-3" />
            {car.color ?? "Unknown"}
          </Badge>
        </div>

        <div className="mt-auto pt-2">
          <Button className="w-full" asChild>
            <a href={`/car/${car.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View Car Details
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FeaturedCarsCard;

