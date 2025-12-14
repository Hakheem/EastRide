"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "@prisma/client";

export interface WorkingHoursData {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface DealershipData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: WorkingHoursData[];
  createdAt: Date;
  updatedAt: Date;
}


export async function getDealershipInfo() {
  await requireAdmin();

  try {
    const dealership = await prisma.dealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        }
      }
    });

    if (!dealership) {
      // Return default structure if no dealership exists
      return {
        success: true,
        data: null
      };
    }

    return {
      success: true,
      data: dealership
    };
  } catch (error) {
    console.error("Failed to fetch dealership info:", error);
    return {
      success: false,
      error: "Failed to fetch dealership information"
    };
  }
}


export async function updateDealershipInfo(data: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}) {
  const session = await requireAdmin();

  try {
    // Basic validation
    if (data.email && !isValidEmail(data.email)) {
      return { success: false, error: "Invalid email format" };
    }

    if (data.phone && !isValidPhone(data.phone)) {
      return { success: false, error: "Invalid phone format" };
    }

    // Check if dealership exists
    const existing = await prisma.dealershipInfo.findFirst();

    let dealership;
    if (existing) {
      dealership = await prisma.dealershipInfo.update({
        where: { id: existing.id },
        data,
        include: {
          workingHours: true
        }
      });
    } else {
      // Create new dealership with default working hours
      dealership = await prisma.dealershipInfo.create({
        data: {
          name: data.name || "East Africa Rides",
          address: data.address || "35/60 Nairobi Kenya",
          phone: data.phone || "+254769403162",
          email: data.email || "hakheem67@gmail.com",
        },
        include: {
          workingHours: true
        }
      });

      // Create default working hours
      await createDefaultWorkingHours(dealership.id);
    }

    // Revalidate relevant paths
    revalidatePath("/admin/management");
    revalidatePath("/superadmin/management");
    revalidatePath("/");

    console.log(`✅ Dealership info updated by ${session.user?.email}`);

    return { success: true, data: dealership };
  } catch (error) {
    console.error("Failed to update dealership info:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Failed to update dealership information" };
  }
}

/**
 * Update working hours for a specific day
 * Accessible by: ADMIN, SUPERADMIN
 */
export async function updateWorkingHoursForDay(
  dealershipId: string,
  dayOfWeek: DayOfWeek,
  data: {
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }
) {
  const session = await requireAdmin();

  try {
    // Validate time format (HH:MM)
    if (!isValidTime(data.openTime) || !isValidTime(data.closeTime)) {
      return { success: false, error: "Invalid time format. Use HH:MM (24-hour format)" };
    }

    // Check if working hours exist for this day
    const existing = await prisma.workingHours.findUnique({
      where: {
        dealershipId_dayOfWeek: {
          dealershipId,
          dayOfWeek
        }
      }
    });

    let workingHours;
    if (existing) {
      workingHours = await prisma.workingHours.update({
        where: {
          dealershipId_dayOfWeek: {
            dealershipId,
            dayOfWeek
          }
        },
        data
      });
    } else {
      workingHours = await prisma.workingHours.create({
        data: {
          dealershipId,
          dayOfWeek,
          ...data
        }
      });
    }

    revalidatePath("/admin/management");
    revalidatePath("/superadmin/management");
    revalidatePath("/");

    console.log(`✅ Working hours for ${dayOfWeek} updated by ${session.user?.email}`);

    return { success: true, data: workingHours };
  } catch (error) {
    console.error("Failed to update working hours:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Failed to update working hours" };
  }
}

/**
 * Bulk update working hours for all days
 * Accessible by: ADMIN, SUPERADMIN
 */
export async function updateAllWorkingHours(
  dealershipId: string,
  workingHoursData: Array<{
    dayOfWeek: DayOfWeek;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }>
) {
  const session = await requireAdmin();

  try {
    // Validate all time formats
    for (const day of workingHoursData) {
      if (!isValidTime(day.openTime) || !isValidTime(day.closeTime)) {
        return { success: false, error: `Invalid time format for ${day.dayOfWeek}` };
      }
    }

    // Update each day
    const updates = workingHoursData.map(async (day) => {
      return prisma.workingHours.upsert({
        where: {
          dealershipId_dayOfWeek: {
            dealershipId,
            dayOfWeek: day.dayOfWeek
          }
        },
        update: {
          openTime: day.openTime,
          closeTime: day.closeTime,
          isOpen: day.isOpen
        },
        create: {
          dealershipId,
          dayOfWeek: day.dayOfWeek,
          openTime: day.openTime,
          closeTime: day.closeTime,
          isOpen: day.isOpen
        }
      });
    });

    await Promise.all(updates);

    revalidatePath("/admin/management");
    revalidatePath("/superadmin/management");
    revalidatePath("/");

    console.log(`✅ All working hours updated by ${session.user?.email}`);

    return { success: true, message: "Working hours updated successfully" };
  } catch (error) {
    console.error("Failed to update working hours:", error);
    
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: "Failed to update working hours" };
  }
}

/**
 * Initialize dealership if it doesn't exist
 * Accessible by: ADMIN, SUPERADMIN
 */
export async function initializeDealership() {
  await requireAdmin();

  try {
    const existing = await prisma.dealershipInfo.findFirst();
    
    if (existing) {
      return { success: true, data: existing, message: "Dealership already exists" };
    }

    // Create dealership with default values
    const dealership = await prisma.dealershipInfo.create({
      data: {
        name: "East Africa Rides",
        address: "35/60 Nairobi Kenya",
        phone: "+254769403162",
        email: "hakheem67@gmail.com"
      },
      include: {
        workingHours: true
      }
    });

    // Create default working hours
    await createDefaultWorkingHours(dealership.id);

    // Fetch with working hours
    const dealershipWithHours = await prisma.dealershipInfo.findUnique({
      where: { id: dealership.id },
      include: { workingHours: true }
    });

    revalidatePath("/admin/management");
    revalidatePath("/superadmin/management");

    return { success: true, data: dealershipWithHours };
  } catch (error) {
    console.error("Failed to initialize dealership:", error);
    return { success: false, error: "Failed to initialize dealership" };
  }
}

// ============================================
// USER MANAGEMENT (SUPERADMIN ONLY)
// ============================================

/**
 * Get all users with details
 * Accessible by: SUPERADMIN only
 */
export async function getAllUsersForManagement() {
  await requireSuperAdmin();

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

    return { success: true, data: users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

/**
 * Promote user to ADMIN role
 * Accessible by: SUPERADMIN only
 */
export async function promoteUserToAdmin(userId: string) {
  const session = await requireSuperAdmin();

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role === "ADMIN") {
      return { success: false, error: "User is already an admin" };
    }

    if (user.role === "SUPERADMIN") {
      return { success: false, error: "Cannot modify superadmin role" };
    }

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

    revalidatePath("/superadmin/management");

    console.log(`✅ User ${updated.email} promoted to ADMIN by ${session.user?.email}`);

    return { success: true, data: updated, message: `${user.name || user.email} promoted to Admin` };
  } catch (error) {
    console.error("Failed to promote user:", error);
    return { success: false, error: "Failed to promote user to admin" };
  }
}

/**
 * Demote admin to USER role
 * Accessible by: SUPERADMIN only
 */
export async function demoteAdminToUser(userId: string) {
  const session = await requireSuperAdmin();

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.role === "USER") {
      return { success: false, error: "User is already a regular user" };
    }

    if (user.role === "SUPERADMIN") {
      return { success: false, error: "Cannot demote superadmin" };
    }

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

    revalidatePath("/superadmin/management");

    console.log(`✅ Admin ${updated.email} demoted to USER by ${session.user?.email}`);

    return { success: true, data: updated, message: `${user.name || user.email} demoted to User` };
  } catch (error) {
    console.error("Failed to demote admin:", error);
    return { success: false, error: "Failed to demote admin" };
  }
}

/**
 * Get management statistics
 * Accessible by: ADMIN, SUPERADMIN
 */
export async function getManagementStats() {
  await requireAdmin();

  try {
    const [
      totalUsers,
      admins,
      superadmins,
      regularUsers,
      totalCars,
      availableCars,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      dealership
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "SUPERADMIN" } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.car.count(),
      prisma.car.count({ where: { status: "AVAILABLE" } }),
      prisma.testDriveBooking.count(),
      prisma.testDriveBooking.count({ where: { status: "PENDING" } }),
      prisma.testDriveBooking.count({ where: { status: "CONFIRMED" } }),
      prisma.dealershipInfo.findFirst({ select: { name: true } })
    ]);

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins,
          superadmins,
          regular: regularUsers,
        },
        cars: {
          total: totalCars,
          available: availableCars,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
        },
        dealership: {
          name: dealership?.name || "Not Set"
        }
      },
    };
  } catch (error) {
    console.error("Failed to fetch management stats:", error);
    return { success: false, error: "Failed to fetch statistics" };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createDefaultWorkingHours(dealershipId: string) {
  const days: DayOfWeek[] = [
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", 
    "FRIDAY", "SATURDAY", "SUNDAY"
  ];

  const workingHours = days.map((day) => ({
    dealershipId,
    dayOfWeek: day,
    openTime: day === "SUNDAY" ? "00:00" : day === "SATURDAY" ? "10:00" : "09:00",
    closeTime: day === "SUNDAY" ? "00:00" : day === "SATURDAY" ? "16:00" : "18:00",
    isOpen: day !== "SUNDAY"
  }));

  await prisma.workingHours.createMany({
    data: workingHours
  });
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

function isValidTime(time: string): boolean {
  // Validate HH:MM format (24-hour)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}
