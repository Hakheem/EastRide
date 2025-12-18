import Image from "next/image";
import HeroSection from "./_components/HeroSection";
import FeaturedCars from "./_components/FeaturedCars";
import CarMakes from "./_components/CarMakes";
import WhyChooseUs from "@/components/general/WhyChooseUs"
import LatestArrivals from "@/components/general/LatestArrivals"
import BodyType from "./_components/BodyType"
import FAQ from "@/components/general/FAQ"
import CTA from "@/components/general/CTA"


export default function Home() {
  return (
    <div className=" ">
     <HeroSection /> 
     <FeaturedCars/>
     <CarMakes />
     <LatestArrivals />
     <BodyType />
     <WhyChooseUs />
     <CTA />
     <FAQ />
    </div>
  );
}
