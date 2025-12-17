"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { serializeCar } from "@/lib/shared/car-utils";
import { BookingStatus } from "@prisma/client";

//  check if time slot is available
async function isTimeSlotAvailable(
  carId: string,
  bookingDate: Date,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; message?: string }> {
  // Check existing bookings for this car on the same date
  const existingBookings = await prisma.testDriveBooking.findMany({
    where: {
      carId,
      bookingDate,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
  });

  // Parse times
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const requestStart = startHour * 60 + startMin;
  const requestEnd = endHour * 60 + endMin;

  // Check for conflicts
  for (const booking of existingBookings) {
    const [bookStartHour, bookStartMin] = booking.startTime.split(":").map(Number);
    const [bookEndHour, bookEndMin] = booking.endTime.split(":").map(Number);
    const bookStart = bookStartHour * 60 + bookStartMin;
    const bookEnd = bookEndHour * 60 + bookEndMin;

    // Check for overlap
    if (
      (requestStart >= bookStart && requestStart < bookEnd) ||
      (requestEnd > bookStart && requestEnd <= bookEnd) ||
      (requestStart <= bookStart && requestEnd >= bookEnd)
    ) {
      return {
        available: false,
        message: `Time slot conflicts with existing booking (${booking.startTime} - ${booking.endTime})`,
      };
    }
  }

  // Count bookings in the same hour
  const hourStart = Math.floor(requestStart / 60) * 60;
  const hourEnd = hourStart + 60;

  const bookingsInHour = existingBookings.filter((booking) => {
    const [bookStartHour, bookStartMin] = booking.startTime.split(":").map(Number);
    const bookStart = bookStartHour * 60 + bookStartMin;
    return bookStart >= hourStart && bookStart < hourEnd;
  });

  if (bookingsInHour.length >= 2) {
    return {
      available: false,
      message: "Maximum 2 bookings per hour reached. Please choose a different time.",
    };
  }

  return { available: true };
}

// Helper to check if time is within working hours
async function isWithinWorkingHours(
  dayOfWeek: string,
  startTime: string,
  endTime: string
): Promise<{ valid: boolean; message?: string }> {
  const dealership = await prisma.dealershipInfo.findFirst({
    include: {
      workingHours: true,
    },
  });

  if (!dealership) {
    return { valid: false, message: "Dealership information not found" };
  }

  const workingHour = dealership.workingHours.find(
    (wh) => wh.dayOfWeek === dayOfWeek.toUpperCase()
  );

  if (!workingHour || !workingHour.isOpen) {
    return { valid: false, message: `We are closed on ${dayOfWeek}` };
  }

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const [openHour, openMin] = workingHour.openTime.split(":").map(Number);
  const [closeHour, closeMin] = workingHour.closeTime.split(":").map(Number);

  const requestStart = startHour * 60 + startMin;
  const requestEnd = endHour * 60 + endMin;
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  if (requestStart < openTime || requestEnd > closeTime) {
    return {
      valid: false,
      message: `Booking must be between ${workingHour.openTime} and ${workingHour.closeTime}`,
    };
  }

  return { valid: true };
}

// Book a test drive
export async function bookTestDrive({
  carId,
  bookingDate,
  startTime,
  endTime,
  notes,
}: {
  carId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to book a test drive",
        requiresAuth: true,
      };
    }

    const userId = user.id;
    const userRole = (user as any)?.role;

    // Don't allow admins/superadmins to book test drives
    if (userRole === "ADMIN" || userRole === "SUPERADMIN") {
      return {
        success: false,
        error: "Admins cannot book test drives",
      };
    }

    // Check if car exists and is available
    const car = await prisma.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    if (car.status !== "AVAILABLE") {
      return {
        success: false,
        error: `This car is ${car.status.toLowerCase()} and cannot be booked for test drive`,
      };
    }

    // Parse booking date
    const parsedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      return {
        success: false,
        error: "Cannot book test drive for past dates",
      };
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return {
        success: false,
        error: "Invalid time format. Use HH:MM",
      };
    }

    // Check duration (max 1 hour, min 30 minutes)
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    if (durationMinutes > 60) {
      return {
        success: false,
        error: "Test drive duration cannot exceed 1 hour",
      };
    }

    if (durationMinutes < 30) {
      return {
        success: false,
        error: "Test drive duration must be at least 30 minutes",
      };
    }

    if (durationMinutes <= 0) {
      return {
        success: false,
        error: "End time must be after start time",
      };
    }

    // Check if within working hours
    const dayOfWeek = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
    const workingHoursCheck = await isWithinWorkingHours(dayOfWeek, startTime, endTime);
    
    if (!workingHoursCheck.valid) {
      return {
        success: false,
        error: workingHoursCheck.message,
      };
    }

    // Check if user already has a booking for this car
    const existingUserBooking = await prisma.testDriveBooking.findFirst({
      where: {
        userId,
        carId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (existingUserBooking) {
      return {
        success: false,
        error: "You already have a pending test drive booking for this car",
      };
    }

    // Check if time slot is available
    const availabilityCheck = await isTimeSlotAvailable(
      carId,
      parsedDate,
      startTime,
      endTime
    );

    if (!availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.message,
      };
    }

    // Create booking
    const booking = await prisma.testDriveBooking.create({
      data: {
        userId,
        carId,
        bookingDate: parsedDate,
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        car: true,
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);
    revalidatePath("/reservations");

    return {
      success: true,
      data: booking,
      message: "Test drive booked successfully! We will confirm your booking shortly.",
    };
  } catch (error) {
    console.error("Error booking test drive:", error);
    return {
      success: false,
      error: "Failed to book test drive. Please try again.",
    };
  }
}


// Get user's test drive bookings
export async function getUserTestDrives() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to view bookings",
        requiresAuth: true,
      };
    }

    const bookings = await prisma.testDriveBooking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        car: true,
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      car: serializeCar(booking.car),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching user test drives:", error);
    return {
      success: false,
      error: "Failed to fetch bookings",
    };
  }
}

// Get all test drive bookings (Admin/SuperAdmin only)
export async function getAllTestDrives(
  filters?: {
    status?: BookingStatus;
    carId?: string;
    userId?: string;
  }
) {
  try {
    await requireAdmin();

    const whereClause: any = {};
    
    if (filters?.status) whereClause.status = filters.status;
    if (filters?.carId) whereClause.carId = filters.carId;
    if (filters?.userId) whereClause.userId = filters.userId;

    const bookings = await prisma.testDriveBooking.findMany({
      where: whereClause,
      include: {
        car: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        bookingDate: "desc",
      },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      car: serializeCar(booking.car),
      user: {
        id: booking.user.id,
        name: booking.user.name,
        email: booking.user.email,
        image: booking.user.image,
      },
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    console.error("Error fetching all test drives:", error);
    return {
      success: false,
      error: "Failed to fetch bookings",
    };
  }
}

// Cancel test drive booking
export async function cancelTestDrive(bookingId: string, reason?: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to cancel bookings",
        requiresAuth: true,
      };
    }

    // Fetch the booking
    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Check if user owns this booking
    if (booking.userId !== user.id) {
      return {
        success: false,
        error: "You can only cancel your own bookings",
      };
    }

    // Check if already cancelled or completed
    if (booking.status === "CANCELLED") {
      return {
        success: false,
        error: "This booking is already cancelled",
      };
    }

    if (booking.status === "COMPLETED") {
      return {
        success: false,
        error: "Cannot cancel a completed test drive",
      };
    }

    // Update booking to cancelled
    await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        notes: reason 
          ? `${booking.notes ? booking.notes + "\n\n" : ""}Cancellation reason: ${reason}`
          : booking.notes,
      },
    });

    revalidatePath("/reservations");
    revalidatePath("/admin/test-drives");
    revalidatePath("/superadmin/test-drives");
    revalidatePath(`/cars/${booking.carId}`);

    return {
      success: true,
      message: "Test drive booking cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling test drive:", error);
    return {
      success: false,
      error: "Failed to cancel booking",
    };
  }
}

// Update booking status (Admin/SuperAdmin only)
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  adminNotes?: string
) {
  try {
    await requireAdmin();

    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: {
        status,
        notes: adminNotes 
          ? `${booking.notes ? booking.notes + "\n\n" : ""}Admin notes: ${adminNotes}`
          : booking.notes,
      },
    });

    revalidatePath("/admin/test-drives");
    revalidatePath("/superadmin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: `Booking status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return {
      success: false,
      error: "Failed to update booking status",
    };
  }
}

// Check if user has booked test drive for a car
export async function checkUserTestDrive(carId: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: true,
        hasBooked: false,
        bookingDate: null,
      };
    }

    const booking = await prisma.testDriveBooking.findFirst({
      where: {
        userId: user.id,
        carId,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      orderBy: {
        bookingDate: "asc",
      },
    });

    return {
      success: true,
      hasBooked: !!booking,
      bookingDate: booking?.bookingDate || null,
      booking: booking ? {
        id: booking.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      } : null,
    };
  } catch (error) {
    console.error("Error checking user test drive:", error);
    return {
      success: false,
      hasBooked: false,
      bookingDate: null,
    };
  }
}

