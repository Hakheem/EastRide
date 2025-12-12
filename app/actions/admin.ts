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
