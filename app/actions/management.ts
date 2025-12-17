"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DayOfWeek } from "@prisma/client";
import { headers } from "next/headers";

// Import SECURITY utilities
import { 
  sanitizeInput,
  checkIPReputation,
  recordIPViolation 
} from "@/lib/security/shield-protection";

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

// Helper to get IP address from headers
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-forwarded-for")?.split(",")[0].trim() || 
         headersList.get("x-real-ip") || 
         "unknown";
}

// Helper to check IP reputation before sensitive operations
async function checkIPBeforeAction(actionName: string): Promise<{ allowed: boolean; reason?: string }> {
  const ip = await getClientIP();
  const ipReputation = checkIPReputation(ip);
  
  if (ipReputation.blocked) {
    console.log(`🚫 Blocked IP attempting ${actionName}: ${ip} (${ipReputation.violations} violations)`);
    return { 
      allowed: false, 
      reason: "Your IP has been temporarily blocked due to suspicious activity. Please try again later." 
    };
  }

  if (ipReputation.shouldWarn) {
    console.log(`⚠️ Warning: IP ${ip} has ${ipReputation.violations} violations attempting ${actionName}`);
  }

  return { allowed: true };
}

// Enhanced validation with sanitization
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeInput(email);
  return emailRegex.test(sanitized) && sanitized.length <= 254;
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  const sanitized = sanitizeInput(phone);
  return phoneRegex.test(sanitized) && sanitized.replace(/\D/g, '').length >= 10;
}

function isValidTime(time: string): boolean {
  // Validate HH:MM format (24-hour)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

// Sanitize and validate dealership name
function validateDealershipName(name: string): { valid: boolean; sanitized?: string; error?: string } {
  const sanitized = sanitizeInput(name);
  
  if (sanitized.length < 2) {
    return { valid: false, error: "Dealership name must be at least 2 characters" };
  }
  
  if (sanitized.length > 100) {
    return { valid: false, error: "Dealership name must be less than 100 characters" };
  }
  
  // Check for suspicious patterns
  if (/<|>|javascript:|on\w+=/i.test(sanitized)) {
    return { valid: false, error: "Invalid characters in dealership name" };
  }
  
  return { valid: true, sanitized };
}

// Sanitize and validate address
function validateAddress(address: string): { valid: boolean; sanitized?: string; error?: string } {
  const sanitized = sanitizeInput(address);
  
  if (sanitized.length < 5) {
    return { valid: false, error: "Address must be at least 5 characters" };
  }
  
  if (sanitized.length > 500) {
    return { valid: false, error: "Address must be less than 500 characters" };
  }
  
  return { valid: true, sanitized };
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
  // Security check
  const ipCheck = await checkIPBeforeAction("update dealership info");
  if (!ipCheck.allowed) {
    return {
      success: false,
      error: ipCheck.reason || "Access denied"
    };
  }

  const session = await requireAdmin();
  const ip = await getClientIP();

  try {
    // Sanitize and validate inputs
    const sanitizedData: any = {};

    if (data.name) {
      const nameValidation = validateDealershipName(data.name);
      if (!nameValidation.valid) {
        recordIPViolation(ip);
        console.log(`⚠️ Invalid dealership name from ${ip}: ${nameValidation.error}`);
        return { success: false, error: nameValidation.error };
      }
      sanitizedData.name = nameValidation.sanitized;
    }

    if (data.address) {
      const addressValidation = validateAddress(data.address);
      if (!addressValidation.valid) {
        recordIPViolation(ip);
        console.log(`⚠️ Invalid address from ${ip}: ${addressValidation.error}`);
        return { success: false, error: addressValidation.error };
      }
      sanitizedData.address = addressValidation.sanitized;
    }

    if (data.email) {
      if (!isValidEmail(data.email)) {
        recordIPViolation(ip);
        console.log(`⚠️ Invalid email format from ${ip}`);
        return { success: false, error: "Invalid email format" };
      }
      sanitizedData.email = sanitizeInput(data.email);
    }

    if (data.phone) {
      if (!isValidPhone(data.phone)) {
        recordIPViolation(ip);
        console.log(`⚠️ Invalid phone format from ${ip}`);
        return { success: false, error: "Invalid phone format" };
      }
      sanitizedData.phone = sanitizeInput(data.phone);
    }

    // Check if dealership exists
    const existing = await prisma.dealershipInfo.findFirst();

    let dealership;
    if (existing) {
      dealership = await prisma.dealershipInfo.update({
        where: { id: existing.id },
        data: sanitizedData,
        include: {
          workingHours: true
        }
      });
    } else {
      // Create new dealership with default working hours
      dealership = await prisma.dealershipInfo.create({
        data: {
          name: sanitizedData.name || "East Africa Rides",
          address: sanitizedData.address || "35/60 Nairobi Kenya",
          phone: sanitizedData.phone || "+254769403162",
          email: sanitizedData.email || "hakheem67@gmail.com",
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

    console.log(`✅ Dealership info updated by ${session.user?.email} from ${ip}`);

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
  const ip = await getClientIP();

  try {
    // Validate time format (HH:MM)
    if (!isValidTime(data.openTime) || !isValidTime(data.closeTime)) {
      recordIPViolation(ip);
      console.log(`⚠️ Invalid time format from ${ip}: ${data.openTime} - ${data.closeTime}`);
      return { success: false, error: "Invalid time format. Use HH:MM (24-hour format)" };
    }

    // Additional validation: ensure open time is before close time
    if (data.isOpen) {
      const [openHour, openMin] = data.openTime.split(':').map(Number);
      const [closeHour, closeMin] = data.closeTime.split(':').map(Number);
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (openMinutes >= closeMinutes) {
        return { success: false, error: "Opening time must be before closing time" };
      }
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
  const ip = await getClientIP();

  try {
    // Validate all time formats
    for (const day of workingHoursData) {
      if (!isValidTime(day.openTime) || !isValidTime(day.closeTime)) {
        recordIPViolation(ip);
        console.log(`⚠️ Invalid time format for ${day.dayOfWeek} from ${ip}`);
        return { success: false, error: `Invalid time format for ${day.dayOfWeek}` };
      }

      // Validate open time is before close time
      if (day.isOpen) {
        const [openHour, openMin] = day.openTime.split(':').map(Number);
        const [closeHour, closeMin] = day.closeTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        if (openMinutes >= closeMinutes) {
          return { success: false, error: `Opening time must be before closing time for ${day.dayOfWeek}` };
        }
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
  // Security check
  const ipCheck = await checkIPBeforeAction("promote user");
  if (!ipCheck.allowed) {
    return {
      success: false,
      error: ipCheck.reason || "Access denied"
    };
  }

  const session = await requireSuperAdmin();
  const ip = await getClientIP();

  try {
    // Sanitize userId
    const sanitizedUserId = sanitizeInput(userId);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: sanitizedUserId },
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
      where: { id: sanitizedUserId },
      data: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    revalidatePath("/superadmin/management");

    console.log(`✅ User ${updated.email} promoted to ADMIN by ${session.user?.email} from ${ip}`);

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
  // Security check
  const ipCheck = await checkIPBeforeAction("demote admin");
  if (!ipCheck.allowed) {
    return {
      success: false,
      error: ipCheck.reason || "Access denied"
    };
  }

  const session = await requireSuperAdmin();
  const ip = await getClientIP();

  try {
    // Sanitize userId
    const sanitizedUserId = sanitizeInput(userId);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: sanitizedUserId },
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
      where: { id: sanitizedUserId },
      data: { role: "USER" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    revalidatePath("/superadmin/management");

    console.log(`✅ Admin ${updated.email} demoted to USER by ${session.user?.email} from ${ip}`);

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
