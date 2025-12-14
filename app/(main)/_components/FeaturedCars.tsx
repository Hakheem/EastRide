import { getFeaturedCars } from "../../actions/home";
import FeaturedCarsClient from "./FeaturedCarsClient";
import { CarType } from "@/types/car";

export default async function FeaturedCars() {
  const response = await getFeaturedCars(6);

  if (!response.success || !response.data) return null; 

  const featuredCars: CarType[] = response.data.map((car: any) => ({
    id: car.id.toString(),
    name: `${car.make} ${car.model}`,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    mileage: car.mileage,
    fuelType: car.fuelType,
    transmission: car.transmission,
    bodyType: car.bodyType,
    status: car.status,
    featured: car.featured,
    color: car.color?.trim() && car.color !== "" ? car.color : "Unknown",
    wishListed: false,
    images: car.images?.length ? car.images : car.image ? [car.image] : ["/placeholder.jpg"],
    features: car.features ?? [],
    createdAt: car.createdAt ? new Date(car.createdAt) : undefined,
  }));

  return <FeaturedCarsClient featuredCars={featuredCars} />;
}


