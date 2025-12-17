// lib/client/car-utils.ts - CLIENT ONLY (for components)
/**
 * Format price for display
 * @param price - Price in KSH
 * @param currency - Currency symbol (default: "KSH")
 */
export function formatPrice(price: number, currency: string = "KSH"): string {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  }
  return `${currency} ${price}`;
}

/**
 * Format mileage for display
 * @param mileage - Mileage in km
 */
export function formatMileage(mileage: number): string {
  if (mileage >= 1000) {
    return `${(mileage / 1000).toFixed(0)}k km`;
  }
  return `${mileage} km`;
}

/**
 * Price ranges for filtering (in KSH)
 */
export const priceRanges = [
  { label: "Under 1M", min: 0, max: 1000000 },
  { label: "1M - 3M", min: 1000000, max: 3000000 },
  { label: "3M - 6M", min: 3000000, max: 6000000 },
  { label: "6M - 10M", min: 6000000, max: 10000000 },
  { label: "Over 10M", min: 10000000, max: 999999999 }
];

// Simple car interface for client components
export interface SimpleCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  images: string[];
  image?: string;
  wishListed?: boolean;
}

