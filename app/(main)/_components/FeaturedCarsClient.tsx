"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import FeaturedCarsCard from "@/components/general/FeaturedCarsCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

type FeaturedCarsClientProps = {
  featuredCars: any[];
};

export default function FeaturedCarsClient({
  featuredCars, 
}: FeaturedCarsClientProps) {
  const [isHovering, setIsHovering] = useState(false);
 
  return (
    <div className=" py-12 md:py-16  lg:mt-8 padded">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
           Featured Cars
        </h2>
        <Button variant="outline" className="text-sm p-0" asChild>
          <Link href="/cars">
            View All
            <ChevronRight className="size-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {featuredCars.map((car) => (
            <div key={car.id} className="min-w-[280px] shrink-0">
              <FeaturedCarsCard car={car} />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-6">
        {featuredCars.slice(0, 6).map((car) => (
          <FeaturedCarsCard key={car.id} car={car} />
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Swiper
            modules={[Autoplay]}
            autoplay={{
              delay: 40000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            slidesPerView={4}
            spaceBetween={20}
            loop
            breakpoints={{
              1280: { slidesPerView: 4 },
              1536: { slidesPerView: 6 },
            }}
          >
            {featuredCars.map((car) => (
              <SwiperSlide key={car.id} className="h-auto">
                <FeaturedCarsCard car={car} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}

