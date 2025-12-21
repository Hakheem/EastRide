"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleSaveCar } from "@/app/actions/car-listing";
import { useSession } from "next-auth/react";

interface CarImagesProps {
  car: any;
  isWishlisted: boolean;
}

export default function CarImages({ 
  car, 
  isWishlisted: initialIsWishlisted 
}: CarImagesProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const carImages = car.images && car.images.length > 0 
    ? car.images.map((url: string, index: number) => ({
        id: index,
        src: url,
        alt: `${car.make} ${car.model} - Image ${index + 1}`
      }))
    : [{ id: 1, src: "/placeholder.png", alt: "Car image not available" }];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car.make} ${car.model} ${car.year}`,
        text: `Check out this ${car.make} ${car.model} for sale on EastRide!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleWishlistToggle = async () => {
    // Check if user is logged in using session
    if (!session?.user) {
      toast.error("Please login to save cars");
      router.push("/login");
      return;
    }

    if (isTogglingWishlist) return;
    
    setIsTogglingWishlist(true);
    try {
      const result = await toggleSaveCar(car.id);
      
      if (result.success) {
        const newState = result.saved ?? !isWishlisted;
        setIsWishlisted(newState);
        toast.success(result.message || (newState ? "Added to wishlist" : "Removed from wishlist"));
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

  return (
    <>
      {/* Main Image */}
      <div className="rounded-lg overflow-hidden shadow-sm relative bg-linear-to-br from-sky-200 via-white to-cyan-100 dark:bg-linear-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800/50 ">
        {carImages[selectedImage] && (
          <div className="relative h-[500px] w-full">
            <Image
              src={carImages[selectedImage].src}
              alt={carImages[selectedImage].alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.png";
              }}
            />
          </div>
        )}
        
        {/* Image Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button 
            size="icon" 
            variant="secondary" 
            className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {selectedImage + 1} / {carImages.length}
        </div>
      </div>

      {/* Image Thumbnails */}
      {carImages.length > 1 && (
        <div className="">
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {carImages.map((image: any, index: number) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 relative w-24 h-20 rounded overflow-hidden border-2 transition-all hover:border-primary ${
                    selectedImage === index 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover cursor-pointer"
                    sizes="100px"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

