"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { CarStatus } from "@prisma/client";

// Import utilities from separate file
import {
  priceRanges,
  formatPrice,
  cleanPriceString,
  cleanMileageString,
  fileToBase64,
  validateImageFile,
  uploadToCloudinary,
  deleteCarImages,
  type RawCarDetails,
  type CleanedCarDetails,
  type AIResponse,
  type CarData,
} from "@/lib/car-utils";

// Ensure environment variables are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary environment variables are not configured");
}

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Gemini API key is not configured");
}

// 1. AI Image Analysis Function (with image validation)
export async function processCarImageWithAI(file: File): Promise<AIResponse> {
  try {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const base64Image = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      }
    };

    const prompt = `Analyze the car in the image and provide the following information:
1. Make (manufacturer)
2. Model
3. Year (approximately)
4. Color
5. BodyType (SUV, Sedan, Hatchback, etc)
6. Mileage (your best guess in kilometers)
7. Fuel type (your best guess: Petrol, Diesel, Electric, Hybrid)
8. Transmission type (Manual or Automatic, your best guess)
9. Price estimate in KENYA SHILLINGS (based on current market trends in Kenya)
10. A brief description of the car including its condition and any notable features.

IMPORTANT: Provide price in KENYA SHILLINGS (KSH), not USD.

Format all this info into a JSON object with keys:
{ 
  "make": "", 
  "model": "",
  "year": 0000, 
  "color": "", 
  "bodyType": "", 
  "mileage": "", 
  "fuelType": "", 
  "transmission": "", 
  "price": "", 
  "description": "",
  "confidence": 0.0 
}

For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
ONLY respond with the JSON object, nothing else.
`;

    const result = await model.generateContent([imagePart, prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, '').trim();

    try {
      const rawCarDetails: RawCarDetails = JSON.parse(cleanedText);

      const requiredFields = [
        "make", "model", "year", "color", "bodyType", "price", 
        "description", "mileage", "fuelType", "transmission", "confidence"
      ];

      const missingFields = requiredFields.filter(field => !(field in rawCarDetails));

      if (missingFields.length > 0) {
        throw new Error(`Missing fields in AI response: ${missingFields.join(", ")}`);
      }

      if (rawCarDetails.confidence < 0 || rawCarDetails.confidence > 1) {
        console.warn(`Invalid confidence score: ${rawCarDetails.confidence}`);
      }

      const cleanedCarDetails: CleanedCarDetails = {
        make: rawCarDetails.make,
        model: rawCarDetails.model,
        year: rawCarDetails.year,
        color: rawCarDetails.color,
        bodyType: rawCarDetails.bodyType,
        fuelType: rawCarDetails.fuelType,
        transmission: rawCarDetails.transmission,
        description: rawCarDetails.description,
        confidence: rawCarDetails.confidence,
        price: cleanPriceString(rawCarDetails.price),
        mileage: cleanMileageString(rawCarDetails.mileage)
      };

      return {
        success: true,
        data: cleanedCarDetails
      };
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error, cleanedText);
      return {
        success: false,
        error: "Failed to parse AI response. Raw output: " + cleanedText.substring(0, 200)
      };
    }
  } catch (error) {
    console.error("Error processing car image with AI:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// 2. ADD Car - Create new car with multiple images
export async function addNewCar({ carData, images }: { carData: CarData, images: File[] }) {
  try {
    const session = await requireAdmin();
    
    console.log(`✅ User ${session.user?.email} (${(session.user as any)?.role}) is adding a new car`);

    const requiredFields = ["make", "model", "year", "price", "mileage", "color", "fuelType", "transmission", "bodyType"];
    const missingFields = requiredFields.filter(field => !carData[field as keyof CarData]);

    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`
      };
    }

    if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
      return {
        success: false,
        error: `Invalid year: ${carData.year}`
      };
    }

    if (carData.price <= 0) {
      return {
        success: false,
        error: "Price must be greater than 0"
      };
    }

    if (carData.price > 100000000) {
      return {
        success: false,
        error: `Price (${formatPrice(carData.price)}) seems too high. Please verify. Maximum allowed: ${formatPrice(100000000)}`
      };
    }

    if (carData.price < 100000) {
      return {
        success: false,
        error: `Price (${formatPrice(carData.price)}) seems too low for a car. Please verify. Minimum expected: ${formatPrice(100000)}`
      };
    }

    if (carData.mileage < 0) {
      return {
        success: false,
        error: "Mileage cannot be negative"
      };
    }

    if (!images || images.length === 0) {
      return {
        success: false,
        error: "At least one image is required"
      };
    }

    if (images.length > 10) {
      return {
        success: false,
        error: "Maximum 10 images allowed"
      };
    }

    const imageUrls: string[] = [];
    
    for (const image of images) {
      const validation = validateImageFile(image);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      try {
        const cloudinaryUrl = await uploadToCloudinary(image);
        imageUrls.push(cloudinaryUrl);
        console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
      } catch (error) {
        console.error("Failed to upload image:", error);
        return {
          success: false,
          error: `Failed to upload image ${image.name}`
        };
      }
    }

    const car = await prisma.car.create({
      data: {
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats || 5,
        description: carData.description || "",
        status: carData.status || "AVAILABLE",
        featured: carData.featured || false,
        images: imageUrls,
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");

    console.log(`✅ Car ${car.make} ${car.model} (${formatPrice(car.price)}) created successfully by ${session.user?.email}`);

    return {
      success: true,
      data: car,
      message: "Car added successfully!",
      redirect: "/admin/cars"
    };

  } catch (error) {
    console.error("Error adding new car:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "A car with similar details already exists."
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: false,
      error: "Failed to add car. Please try again later."
    };
  }
}

// 3. GET All Cars
export async function getAllCars(
  page: number = 1, 
  limit: number = 10, 
  filters?: { 
    status?: CarStatus; 
    featured?: boolean;
    make?: string;
    minPrice?: number;
    maxPrice?: number;
    priceRange?: string;
  }
) {
  try {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (filters?.status) whereClause.status = filters.status;
    if (filters?.featured !== undefined) whereClause.featured = filters.featured;
    if (filters?.make) whereClause.make = { contains: filters.make, mode: 'insensitive' };
    
    if (filters?.priceRange) {
      const range = priceRanges.find(r => r.label === filters.priceRange);
      if (range) {
        whereClause.price = {
          gte: range.min,
          lte: range.max
        };
      }
    } else if (filters?.minPrice || filters?.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) whereClause.price.gte = filters.minPrice;
      if (filters.maxPrice) whereClause.price.lte = filters.maxPrice;
    }

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              savedBy: true,
              testDriveBookings: true,
            }
          }
        }
      }),
      prisma.car.count({ where: whereClause })
    ]);

    return {
      success: true,
      data: {
        cars,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: "Failed to fetch cars"
    };
  }
}

// 4. GET Single Car
export async function getCarById(carId: string) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        _count: {
          select: {
            savedBy: true,
            testDriveBookings: true,
          }
        }
      }
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found"
      };
    }

    return {
      success: true,
      data: car
    };
  } catch (error) {
    console.error("Error fetching car:", error);
    return {
      success: false,
      error: "Failed to fetch car"
    };
  }
}

// 5. UPDATE Car
export async function updateCar(
  carId: string, 
  carData: Partial<CarData>, 
  newImages?: File[],
  imagesToDelete?: string[]
) {
  try {
    await requireAdmin();
    
    const existingCar = await prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!existingCar) {
      return {
        success: false,
        error: "Car not found"
      };
    }
    
    let imageUrls = [...existingCar.images];
    
    if (imagesToDelete && imagesToDelete.length > 0) {
      await deleteCarImages(imagesToDelete);
      imageUrls = imageUrls.filter(url => !imagesToDelete.includes(url));
    }
    
    const totalAfterDeletion = imageUrls.length;
    const newImagesCount = newImages?.length || 0;
    
    if (totalAfterDeletion === 0 && newImagesCount === 0) {
      return {
        success: false,
        error: "At least one image is required"
      };
    }
    
    if (newImages && newImages.length > 0) {
      if (imageUrls.length + newImages.length > 10) {
        return {
          success: false,
          error: "Maximum 10 images allowed. Current: " + imageUrls.length + ", New: " + newImages.length
        };
      }
      
      for (const image of newImages) {
        const validation = validateImageFile(image);
        if (!validation.valid) {
          return {
            success: false,
            error: validation.error
          };
        }
        
        const cloudinaryUrl = await uploadToCloudinary(image);
        imageUrls.push(cloudinaryUrl);
      }
    }
    
    if (carData.price !== undefined) {
      if (carData.price <= 0) {
        return {
          success: false,
          error: "Price must be greater than 0"
        };
      }
      
      if (carData.price > 100000000) {
        return {
          success: false,
          error: `Price (${formatPrice(carData.price)}) seems too high. Maximum allowed: ${formatPrice(100000000)}`
        };
      }
      
      if (carData.price < 100000) {
        return {
          success: false,
          error: `Price (${formatPrice(carData.price)}) seems too low for a car. Minimum expected: ${formatPrice(100000)}`
        };
      }
    }
    
    if (carData.year !== undefined) {
      if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
        return {
          success: false,
          error: `Invalid year: ${carData.year}`
        };
      }
    }
    
    if (carData.mileage !== undefined && carData.mileage < 0) {
      return {
        success: false,
        error: "Mileage cannot be negative"
      };
    }
    
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        ...carData,
        images: imageUrls,
      },
    });
    
    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${carId}`);
    revalidatePath("/");
    
    return {
      success: true,
      data: updatedCar,
      message: "Car updated successfully!"
    };
    
  } catch (error) {
    console.error("Error updating car:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update car"
    };
  }
}

// 6. DELETE Car
export async function deleteCar(carId: string) {
  try {
    await requireAdmin();
    
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });
    
    if (!car) {
      return {
        success: false,
        error: "Car not found"
      };
    }
    
    if (car.images.length > 0) {
      await deleteCarImages(car.images);
    }
    
    await prisma.car.delete({
      where: { id: carId }
    });
    
    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    
    return {
      success: true,
      message: "Car deleted successfully!"
    };
    
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: "Failed to delete car"
    };
  }
}

// 7. TOGGLE Featured Status
export async function toggleFeatured(carId: string) {
  try {
    await requireAdmin();
    
    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: { featured: true }
    });
    
    if (!car) {
      return {
        success: false,
        error: "Car not found"
      };
    }
    
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        featured: !car.featured
      }
    });
    
    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    revalidatePath("/");
    
    return {
      success: true,
      data: updatedCar,
      message: `Car ${updatedCar.featured ? 'marked as' : 'removed from'} featured`
    };
    
  } catch (error) {
    console.error("Error toggling featured:", error);
    return {
      success: false,
      error: "Failed to update featured status"
    };
  }
}

// 8. UPDATE Car Status
export async function updateCarStatus(carId: string, status: "AVAILABLE" | "UNAVAILABLE" | "SOLD") {
  try {
    await requireAdmin();
    
    const car = await prisma.car.update({
      where: { id: carId },
      data: { status }
    });
    
    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${carId}`);
    
    return {
      success: true,
      data: car,
      message: `Car status updated to ${status}`
    };
    
  } catch (error) {
    console.error("Error updating car status:", error);
    return {
      success: false,
      error: "Failed to update car status"
    };
  }
}

// 9. GET Featured Cars
export async function getFeaturedCars(limit: number = 6) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE"
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: cars
    };
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return {
      success: false,
      error: "Failed to fetch featured cars"
    };
  }
}

// 10. Search Cars
export async function searchCars(
  query: string,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    year?: number;
    bodyType?: string;
    fuelType?: string;
    priceRange?: string;
  }
) {
  try {
    const whereClause: any = {
      OR: [
        { make: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters) {
      if (filters.priceRange) {
        const range = priceRanges.find(r => r.label === filters.priceRange);
        if (range) {
          whereClause.price = {
            gte: range.min,
            lte: range.max
          };
        }
      } else if (filters.minPrice || filters.maxPrice) {
        whereClause.price = {};
        if (filters.minPrice) whereClause.price.gte = filters.minPrice;
        if (filters.maxPrice) whereClause.price.lte = filters.maxPrice;
      }
      
      if (filters.year) whereClause.year = filters.year;
      if (filters.bodyType) whereClause.bodyType = filters.bodyType;
      if (filters.fuelType) whereClause.fuelType = filters.fuelType;
    }

    const cars = await prisma.car.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: cars
    };
  } catch (error) {
    console.error("Error searching cars:", error);
    return {
      success: false,
      error: "Failed to search cars"
    };
  }
}

// 11. GET Cars by Price Range
export async function getCarsByPriceRange(priceRangeLabel: string) {
  try {
    const range = priceRanges.find(r => r.label === priceRangeLabel);
    
    if (!range) {
      return {
        success: false,
        error: "Invalid price range"
      };
    }

    const cars = await prisma.car.findMany({
      where: {
        price: {
          gte: range.min,
          lte: range.max
        },
        status: "AVAILABLE"
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: cars
    };
  } catch (error) {
    console.error("Error fetching cars by price range:", error);
    return {
      success: false,
      error: "Failed to fetch cars"
    };
  }
}

// 12. GET Available Car Makes
export async function getAvailableMakes() {
  try {
    const makes = await prisma.car.findMany({
      select: {
        make: true
      },
      distinct: ['make'],
      orderBy: {
        make: 'asc'
      }
    });

    return {
      success: true,
      data: makes.map(m => m.make)
    };
  } catch (error) {
    console.error("Error fetching car makes:", error);
    return {
      success: false,
      error: "Failed to fetch car makes"
    };
  }
}

