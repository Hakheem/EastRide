// types/car.ts
import { CarStatus } from "@prisma/client";

export interface CarType {
  id: string; // Changed from number to string (MongoDB ObjectId)
  name?: string; // Optional - can be constructed from make + model
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
  color?: string; // Optional since it can be "Unknown"
  wishListed?: boolean; // Optional - depends on user auth
  images: string[];
  image?: string; // Optional - first image for hero displays
  features?: string[]; // Optional
  seats?: number; // Optional
  description?: string; // Optional
  createdAt?: Date;
  updatedAt?: Date; // Optional
}
