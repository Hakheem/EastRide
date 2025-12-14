// types/car.ts
import { CarStatus } from "@prisma/client";

export interface CarType {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  status: CarStatus;
  featured: boolean;
  color: string;
  wishListed: boolean;
  images: string[];
  features: string[];
  createdAt?: Date;
}


