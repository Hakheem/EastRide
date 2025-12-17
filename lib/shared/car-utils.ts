// lib/shared/car-utils.ts - SHARED between client and server (NO Cloudinary)
import { Car } from "@prisma/client";

// Price Ranges (in KSH) - SHARED
export const priceRanges = [
  { label: "Under 1M", min: 0, max: 1000000 },
  { label: "1M - 3M", min: 1000000, max: 3000000 },
  { label: "3M - 6M", min: 3000000, max: 6000000 },
  { label: "6M - 10M", min: 6000000, max: 10000000 },
  { label: "Over 10M", min: 10000000, max: 999999999 }
];

// Helper function to format price - SHARED
export function formatPrice(price: number, currency: string = "KSH"): string {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  }
  return `${currency} ${price}`;
}

// TypeScript interfaces - SHARED
export interface RawCarDetails {
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  price: string;
  description: string;
  confidence: number;
}

export interface CleanedCarDetails {
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;
  mileage: number;
  fuelType: string;
  transmission: string;
  price: number;
  description: string;
  confidence: number;
}

export interface AIResponse {
  success: boolean;
  data?: CleanedCarDetails;
  error?: string;
}

export interface CarData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  seats?: number;
  description?: string; 
  status?: "AVAILABLE" | "UNAVAILABLE" | "SOLD";
  featured?: boolean;
}

// Serialize car function - SHARED
export function serializeCar(car: Car) {
  return {
    id: car.id.toString(),
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
    images: car.images.length ? car.images : ["/placeholder.jpg"],
    image: car.images?.[0] ?? "/placeholder.jpg",
    createdAt: car.createdAt,
  };
}

