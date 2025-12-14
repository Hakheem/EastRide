"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from 'swiper/modules'
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/autoplay"
import { bodyTypes } from "@/data/data"

const BodyType = () => {
  return (
    <section>
      <div className="py-12 lg:mt-8 padded">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Browse by Body Type
          </h2>

          <Button variant="outline" className="text-sm p-0" asChild>
            <Link href="/cars">
              View All
              <ChevronRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ 
              clickable: true, 
              dynamicBullets: true,
              el: '.body-type-pagination',
            }}
            loop={true}
            autoplay={{ 
              delay: 15000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            spaceBetween={16} 
            slidesPerView={2} 
            breakpoints={{
              640: { 
                slidesPerView: 3,
                spaceBetween: 18
              },
              1024: { 
                slidesPerView: 5,
                spaceBetween: 20
              },
              1280: { 
                slidesPerView: 5,
                spaceBetween: 20
              },
              1536: { 
                slidesPerView: 5,
                spaceBetween: 22
              },
            }}
            className="pb-8" 
          >
            {bodyTypes.map((type) => (
              <SwiperSlide
                key={type.name}
                className="rounded-lg overflow-hidden relative group"
              >
                <Link href={`/cars?bodyType=${encodeURIComponent(type.name)}`}>
                  <div className="relative w-full h-40 sm:h-44 md:h-48 overflow-hidden"> 
                    <Image
                      src={type.image}
                      alt={type.name}
                      fill
                      className="
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16.67vw" 
                      priority={true}
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

                    <span
                      className="
                        absolute bottom-3 left-3 
                        text-xs font-medium // Smaller text
                        px-2 py-1
                        bg-white/70 dark:bg-gray-900/70
                        backdrop-blur-sm 
                        rounded
                        shadow-sm
                      "
                    >
                      {type.name}
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  )
}

export default BodyType

