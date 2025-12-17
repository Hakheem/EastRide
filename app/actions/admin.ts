"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function getAllUsers() {
  await requireAdmin();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
      },
      orderBy: { 
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function updateUserRole(
  userId: string,
  role: "USER" | "ADMIN" | "SUPERADMIN"
) {
  await requireSuperAdmin(); // Only superadmins can update roles

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return updated;
  } catch (error) {
    console.error("Failed to update user role:", error);
    throw new Error("Failed to update user role");
  }
}

export async function deleteUser(userId: string) {
  await requireSuperAdmin(); // Only superadmins can delete users

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function getAdminStats() {
  await requireAdmin();

  try {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    const superadmins = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    });
    const totalCars = await prisma.car.count();
    const totalReservations = await prisma.testDriveBooking.count();

    return {
      totalUsers,
      admins,
      superadmins,
      totalCars,
      totalReservations,
    };
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    throw new Error("Failed to fetch admin stats");
  }
} 


export async function getDashboardStats() {
  try {
    await requireAdmin();

    // Execute all database queries in parallel for performance
    const [
      totalCars,
      availableCars,
      soldCars,
      featuredCars,
      testDriveStats,
      completedTestDrives
    ] = await Promise.all([
      // Total cars count
      prisma.car.count(),
      
      // Available cars count
      prisma.car.count({ where: { status: "AVAILABLE" } }),
      
      // Sold cars count
      prisma.car.count({ where: { status: "SOLD" } }),
      
      // Featured cars count
      prisma.car.count({ where: { featured: true } }),
      
      // Test Drive Statistics by status
      prisma.testDriveBooking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      
      // Completed test drives for conversion calculation
      prisma.testDriveBooking.findMany({
        where: { status: "COMPLETED" },
        select: { carId: true }
      })
    ]);

    // Parse test drive stats
    const testDriveCounts = testDriveStats.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Calculate conversion rate
    const uniqueCarsTested = new Set(completedTestDrives.map(td => td.carId)).size;
    const conversionRate = soldCars > 0 && uniqueCarsTested > 0 
      ? Math.round((soldCars / uniqueCarsTested) * 100)
      : 0;

    // Get only the stats you requested
    return {
      cars: {
        total: totalCars,
        available: availableCars,
        sold: soldCars,
        featured: featuredCars
      },
      
      testDrives: {
        pending: testDriveCounts["PENDING"] || 0,
        confirmed: testDriveCounts["CONFIRMED"] || 0,
        completed: testDriveCounts["COMPLETED"] || 0,
        cancelled: testDriveCounts["CANCELLED"] || 0,
        noShow: testDriveCounts["NO_SHOW"] || 0,
        total: Object.values(testDriveCounts).reduce((a, b) => a + b, 0)
      },
      
      conversionRate: conversionRate
    };
    
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

