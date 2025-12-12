"use server";

import { requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function getAllUsersWithDetails() {
  const session = await requireSuperAdmin();

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
        _count: {
          select: {
            savedCars: true,
            testDriveBookings: true,
          },
        },
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

export async function promoteToAdmin(userId: string) {
  await requireSuperAdmin();

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return updated;
  } catch (error) {
    console.error("Failed to promote user:", error);
    throw new Error("Failed to promote user to admin");
  }
}

export async function demoteAdmin(userId: string) {
  await requireSuperAdmin();

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: "USER" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return updated;
  } catch (error) {
    console.error("Failed to demote admin:", error);
    throw new Error("Failed to demote admin");
  }
}

export async function deleteSuperAdminUser(userId: string) {
  const session = await requireSuperAdmin();

  // Prevent deleting yourself
  if (session.user?.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  try {
    // Delete related data first
    await prisma.userSavedCar.deleteMany({
      where: { userId },
    });

    await prisma.testDriveBooking.deleteMany({
      where: { userId },
    });

    await prisma.session.deleteMany({
      where: { userId },
    });

    await prisma.account.deleteMany({
      where: { userId },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
}

export async function getSuperAdminStats() {
  await requireSuperAdmin();

  try {
    const totalUsers = await prisma.user.count();
    const admins = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    const superadmins = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    });
    const regularUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    const totalCars = await prisma.car.count();
    const totalReservations = await prisma.testDriveBooking.count();
    const pendingReservations = await prisma.testDriveBooking.count({
      where: { status: "PENDING" },
    });

    const totalSavedCars = await prisma.userSavedCar.count();

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      users: {
        total: totalUsers,
        admins,
        superadmins,
        regular: regularUsers,
      },
      cars: {
        total: totalCars,
      },
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
      },
      savedCars: totalSavedCars,
      recentUsers,
    };
  } catch (error) {
    console.error("Failed to fetch superadmin stats:", error);
    throw new Error("Failed to fetch superadmin stats");
  }
}

export async function bulkDeleteUsers(userIds: string[]) {
  const session = await requireSuperAdmin();

  // Prevent deleting yourself
  if (userIds.includes(session.user?.id || "")) {
    throw new Error("You cannot delete your own account");
  }

  try {
    // Delete all related data for these users
    await prisma.userSavedCar.deleteMany({
      where: { userId: { in: userIds } },
    });

    await prisma.testDriveBooking.deleteMany({
      where: { userId: { in: userIds } },
    });

    await prisma.session.deleteMany({
      where: { userId: { in: userIds } },
    });

    await prisma.account.deleteMany({
      where: { userId: { in: userIds } },
    });

    // Delete users
    const result = await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });

    return { deleted: result.count };
  } catch (error) {
    console.error("Failed to delete users:", error);
    throw new Error("Failed to delete users");
  }
}
