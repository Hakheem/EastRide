"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";

// Only fetch saved cars
export async function getSavedCars() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to view saved cars",
        requiresAuth: true,
        data: null,
      };
    }

    const savedCars = await prisma.userSavedCar.findMany({
      where: {
        userId: user.id,
      },
      include: {
        car: true,
      },
      orderBy: {
        savedAt: "desc",
      },
    });

    // Format the response to match your Car interface
    const formattedCars = savedCars.map((savedCar) => ({
      id: savedCar.car.id,
      make: savedCar.car.make,
      model: savedCar.car.model,
      year: savedCar.car.year,
      price: savedCar.car.price,
      mileage: savedCar.car.mileage,
      fuelType: savedCar.car.fuelType,
      transmission: savedCar.car.transmission,
      bodyType: savedCar.car.bodyType,
      color: savedCar.car.color,
      images: savedCar.car.images,
      wishListed: true, // All saved cars are wishlisted
    }));

    return {
      success: true,
      data: formattedCars,
      count: formattedCars.length,
    };
  } catch (error) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: "Failed to fetch saved cars",
      data: null,
    };
  }
}
