
"use server";

import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";

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
  limit: number = 12
) {
  try {
    const skip = (page - 1) * limit;

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
        orderBy = { createdAt: "desc" }; // NEWEST
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
        }),
        prisma.car.findMany({
          distinct: ["bodyType"],
          select: { bodyType: true },
          where: { status: "AVAILABLE" },
        }),
        prisma.car.findMany({
          distinct: ["transmission"],
          select: { transmission: true },
          where: { status: "AVAILABLE" },
        }),
        prisma.car.findMany({
          distinct: ["fuelType"],
          select: { fuelType: true },
          where: { status: "AVAILABLE" },
        }),
      ]);

    const normalizedCars = cars.map((car) => ({
      ...car,
      id: car.id.toString(),
      color: car.color?.trim() && car.color !== "" ? car.color : "Unknown",
      images: car.images.length ? car.images : ["/placeholder.jpg"],
    }));

    return {
      success: true,
      data: {
        cars: normalizedCars,
        total,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          price: { min: priceRange._min.price ?? 0, max: priceRange._max.price ?? 0 },
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

