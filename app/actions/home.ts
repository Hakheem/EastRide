'use server'

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { CarStatus } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";

// Import SHARED utilities (from shared/car-utils)
import {
  priceRanges,
  formatPrice,
  type RawCarDetails,
  type CleanedCarDetails,
  type AIResponse,
  type CarData,
  serializeCar, // ✅ Added this
} from "@/lib/shared/car-utils";

// Import SERVER-ONLY utilities (from car-utils)
import {
  cleanPriceString,
  cleanMileageString,
  fileToBase64,
  validateImageFile,
  uploadToCloudinary,
  deleteCarImages,
} from "@/lib/car-utils";

export interface CarSearchResult {
  make: string | null;
  bodyType: string | null;
  color: string | null;
  confidence: number;
}

export async function getFeaturedCars(limit: number = 6) {
  try {
    const cars = await prisma.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Normalize cars - use serializeCar from shared
    const normalizedCars = cars.map((car) => serializeCar(car));

    return {
      success: true,
      data: normalizedCars,
    };
  } catch (error) {
    console.error("Error fetching featured cars:", error);
    return { success: false, error: "Failed to fetch featured cars" };
  }
}

// Ensure environment variables are loaded
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn("⚠️ Cloudinary environment variables are not configured");
}

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ Gemini API key is not configured");
}

export async function processCarImageSearch(file: File): Promise<{ success: boolean; data?: CarSearchResult; error?: string }> {
  try {
    // 🛑 Rate limit (10/hour/IP)
    const limit = await rateLimit();
    if (!limit.success) {
      return { success: false, error: "Too many image searches. Please try again in 1 hour." };
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "AI service is not configured." };
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const base64Image = await fileToBase64(file);

    const prompt = `
Analyze the image of a car and extract search-relevant attributes.

Return ONLY valid JSON in the following format:

{
  "make": "string | null",
  "bodyType": "string | null",
  "color": "string | null",
  "confidence": number
}

Rules:
- confidence must be between 0 and 1
- If unsure, set field to null
- Do not include any extra text
`;

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: file.type } },
      prompt,
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?/g, "").trim();

    const raw = JSON.parse(cleaned);

    const cleanedData: CarSearchResult = {
      make: raw.make ?? null,
      bodyType: raw.bodyType ?? null,
      color: raw.color ?? null,
      confidence: raw.confidence ?? 0,
    };

    return { success: true, data: cleanedData };
  } catch (error) {
    console.error("AI image search failed:", error);
    return { success: false, error: "Failed to analyze image. Please try again." };
  }
}

export async function getHomeCars() {
  try {
    const latestCars = await prisma.car.findMany({
      where: {
        status: "AVAILABLE",
        featured: false, 
      },
      take: 12,
      orderBy: { createdAt: "desc" },
    });

    // Use serializeCar from shared
    return latestCars.map((car) => serializeCar(car));
  } catch (error) {
    console.error("Error fetching latest cars:", error);
    return [];
  }
}

