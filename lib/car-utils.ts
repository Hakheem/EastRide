// lib/car-utils.ts (or utils/car-utils.ts)
// Shared utilities and constants for car operations

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Price Ranges (in KSH)
export const priceRanges = [
  { label: "Under 1M", min: 0, max: 1000000 },
  { label: "1M - 3M", min: 1000000, max: 3000000 },
  { label: "3M - 6M", min: 3000000, max: 6000000 },
  { label: "6M - 10M", min: 6000000, max: 10000000 },
  { label: "Over 10M", min: 10000000, max: 999999999 }
];

// Helper function to format price
export function formatPrice(price: number, currency: string = "KSH"): string {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  }
  return `${currency} ${price}`;
}

// Helper function to clean price string from AI
export function cleanPriceString(priceStr: string): number {
  if (!priceStr || typeof priceStr !== 'string') return 0;
  
  const cleaned = priceStr
    .replace(/[^\d.-]/g, '')
    .replace(/(\..*)\./g, '$1');
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : Math.abs(price);
}

// Helper function to clean mileage string from AI
export function cleanMileageString(mileageStr: string): number {
  if (!mileageStr || typeof mileageStr !== 'string') return 0;
  
  const cleaned = mileageStr
    .replace(/[^\d]/g, '')
    .replace(/^0+/, '');
  
  const mileage = parseInt(cleaned);
  return isNaN(mileage) ? 0 : Math.abs(mileage);
}

// Helper function to convert file to base64 for AI
export async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid image type. Allowed: JPG, PNG, WebP` 
    };
  }
  
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `Image too large. Maximum size is 10MB` 
    };
  }
  
  return { valid: true };
}

// Upload image to Cloudinary with automatic format
export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const format = file.type.split('/')[1] || 'jpeg';
    const base64Image = `data:image/${format};base64,${buffer.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "eastride/cars",
      resource_type: "image",
      format: format,
    });
    
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

// Delete images from Cloudinary
export async function deleteCarImages(imageUrls: string[]): Promise<void> {
  try {
    for (const url of imageUrls) {
      const publicIdMatch = url.match(/\/v\d+\/(.+)\.\w+$/);
      if (publicIdMatch) {
        const publicId = publicIdMatch[1];
        await cloudinary.uploader.destroy(publicId);
        console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
      }
    }
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }
}

// TypeScript interfaces
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

