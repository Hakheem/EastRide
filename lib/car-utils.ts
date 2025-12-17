// lib/car-utils.ts - SERVER-SIDE ONLY (imported by server actions)
import { v2 as cloudinary } from "cloudinary";
import { Car } from "@prisma/client";

// Configure Cloudinary with timeout settings
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

// Compress image if needed (reduces file size for faster uploads)
async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  // For very large images, we can reduce quality
  // This is a simple approach - you might want to use sharp library for better compression
  const size = buffer.length;
  
  // If image is over 5MB, we should compress it
  if (size > 5 * 1024 * 1024) {
    console.log(`⚠️ Large image detected (${(size / 1024 / 1024).toFixed(2)}MB). Consider using sharp library for compression.`);
  }
  
  return buffer;
}

// Upload image to Cloudinary with retry logic and timeout handling
export async function uploadToCloudinary(
  file: File, 
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Upload attempt ${attempt}/${maxRetries} for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Compress if needed
      const processedBuffer = await compressImage(buffer, file.type);
      
      const format = file.type.split('/')[1] || 'jpeg';
      const base64Image = `data:image/${format};base64,${processedBuffer.toString('base64')}`;
      
      // Upload with optimized settings
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "eastride/cars",
        resource_type: "image",
        format: format,
        // Optimize upload settings
        transformation: [
          {
            quality: "auto:good",  // Automatic quality optimization
            fetch_format: "auto"   // Automatic format selection
          }
        ],
        // Add timeout (60 seconds)
        timeout: 60000,
        // Use smaller chunk size for uploads
        chunk_size: 6000000, // 6MB chunks
      });
      
      console.log(`✅ Successfully uploaded ${file.name} on attempt ${attempt}`);
      return result.secure_url;
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Upload attempt ${attempt}/${maxRetries} failed for ${file.name}:`, {
        error: error.message || error,
        code: error.code,
        http_code: error.http_code
      });
      
      // Check if it's a retryable error
      const isRetryable = 
        error.code === 'ECONNRESET' || 
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.http_code === 499 ||
        error.http_code === 408 ||
        error.http_code === 503 ||
        error.http_code === 504;
      
      // If not retryable or last attempt, throw
      if (!isRetryable || attempt === maxRetries) {
        throw new Error(`Failed to upload image after ${attempt} attempts: ${error.message || 'Unknown error'}`);
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = retryDelay * attempt;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to upload image after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
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

// Serialize car function
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

