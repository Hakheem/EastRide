"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

import { revalidatePath } from "next/cache";
import { serializeCar } from "@/lib/shared/car-utils";

type CarFilters = {
  make?: string;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
};

type CarSort = "NEWEST" | "PRICE_LOW_HIGH" | "PRICE_HIGH_LOW";

export async function getCarListings(
  filters?: CarFilters,
  sort: CarSort = "NEWEST",
  page: number = 1,
  limit: number = 15
) {
  try {
    const skip = (page - 1) * limit;

    // Get current user for wishlist
    const user = await getCurrentUser();
    const userId = user?.id;

    const whereClause: any = {
      status: "AVAILABLE",
    };

    if (filters?.make) whereClause.make = filters.make;
    if (filters?.bodyType) whereClause.bodyType = filters.bodyType;
    if (filters?.transmission) whereClause.transmission = filters.transmission;
    if (filters?.fuelType) whereClause.fuelType = filters.fuelType;
    if (filters?.minPrice || filters?.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) whereClause.price.gte = filters.minPrice;
      if (filters.maxPrice) whereClause.price.lte = filters.maxPrice;
    }

    // Sorting
    let orderBy: any;
    switch (sort) {
      case "PRICE_LOW_HIGH":
        orderBy = { price: "asc" };
        break;
      case "PRICE_HIGH_LOW":
        orderBy = { price: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch wishlisted cars for the user if logged in
    let wishlistedCarIds = new Set<string>();
    if (userId) {
      const userRole = (user as any)?.role;
      // Only get wishlist for regular users, not admins/superadmins
      if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
        const wishlistedCars = await prisma.userSavedCar.findMany({
          where: { userId },
          select: { carId: true },
        });
        wishlistedCarIds = new Set(wishlistedCars.map((w: any) => w.carId));
      }
    }

    const [cars, total, priceRange, makes, bodyTypes, transmissions, fuelTypes] =
      await Promise.all([
        prisma.car.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.car.count({ where: whereClause }),
        prisma.car.aggregate({
          _min: { price: true },
          _max: { price: true },
          where: { status: "AVAILABLE" },
        }),
        prisma.car.findMany({
          distinct: ["make"],
          select: { make: true },
          where: { status: "AVAILABLE" },
          orderBy: { make: "asc" },
        }),
        prisma.car.findMany({
          distinct: ["bodyType"],
          select: { bodyType: true },
          where: { status: "AVAILABLE" },
          orderBy: { bodyType: "asc" },
        }),
        prisma.car.findMany({
          distinct: ["transmission"],
          select: { transmission: true },
          where: { status: "AVAILABLE" },
          orderBy: { transmission: "asc" },
        }),
        prisma.car.findMany({
          distinct: ["fuelType"],
          select: { fuelType: true },
          where: { status: "AVAILABLE" },
          orderBy: { fuelType: "asc" },
        }),
      ]);

    // Serialize cars and add wishlist status
    const serializedCars = cars.map((car) => {
      const serialized = serializeCar(car);
      return {
        ...serialized,
        wishListed: wishlistedCarIds.has(car.id),
      };
    });

    return {
      success: true,
      data: {
        cars: serializedCars,
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          price: {
            min: priceRange._min.price ?? 0,
            max: priceRange._max.price ?? 0,
          },
          makes: makes.map((m) => m.make),
          bodyTypes: bodyTypes.map((b) => b.bodyType),
          transmissions: transmissions.map((t) => t.transmission),
          fuelTypes: fuelTypes.map((f) => f.fuelType),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching car listings:", error);
    return { success: false, error: "Failed to fetch car listings" };
  }
}

// Toggle save/unsave car
export async function toggleSaveCar(carId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to save cars",
        requiresAuth: true,
      };
    }

    const userId = user.id;
    const userRole = (user as any)?.role;

    // Don't allow admins/superadmins to save cars
    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      return {
        success: false,
        error: "Admins cannot save cars to wishlist",
      };
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if already saved
    const existingSave = await prisma.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: userId,
          carId: carId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: userId,
            carId: carId,
          },
        },
      });

      revalidatePath("/cars");
      revalidatePath(`/cars/${carId}`);

      return {
        success: true,
        saved: false,
        message: "Car removed from wishlist",
      };
    } else {
      // Save
      await prisma.userSavedCar.create({
        data: {
          userId: userId,
          carId: carId,
        },
      });

      revalidatePath("/cars");
      revalidatePath(`/cars/${carId}`);

      return {
        success: true,
        saved: true,
        message: "Car saved to wishlist",
      };
    }
  } catch (error) {
    console.error("Error toggling save car:", error);
    return {
      success: false,
      error: "Failed to update wishlist",
    };
  }
}

