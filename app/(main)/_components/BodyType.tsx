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
      <div className="py-12 padded">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
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
            spaceBetween={20}
            slidesPerView={2} // Phones: 2 slides
            breakpoints={{
              640: { // Tablets: 3 slides
                slidesPerView: 3,
                spaceBetween: 24
              },
              1024: { // Laptops: 4 slides
                slidesPerView: 4,
                spaceBetween: 24
              },
              1280: { 
                slidesPerView: 4,
                spaceBetween: 24
              },
            }}
            className="pb-12" 
          >
            {bodyTypes.map((type) => (
              <SwiperSlide
                key={type.name}
                className="rounded-lg overflow-hidden relative group"
              >
                <Link href={`/cars?bodyType=${type.name}`}>
                  <div className="relative w-full h-52 sm:h-56 md:h-64  overflow-hidden">
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
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 25vw"
                      priority={true}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <span
                      className="
                        absolute bottom-4 left-4 
                        text-sm font-medium
                        px-2 py-1
                        bg-white/60 dark:bg-gray-900/60
                        backdrop-blur-sm 
                        rounded
                        shadow
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

