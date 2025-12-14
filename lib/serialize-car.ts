import { Car } from "@prisma/client";

export function serializeCar(car: Car) {
  return {
    id: car.id.toString(), // ensures no NaN keys
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
    images: car.images.length ? car.images : ["/placeholder.jpg"], // all images
    image: car.images?.[0] ?? "/placeholder.jpg", // hero-friendly
    createdAt: car.createdAt,
  };
}

