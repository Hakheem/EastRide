"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { serializeCar } from "@/lib/shared/car-utils";

export async function getUserReservations() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to view reservations",
        requiresAuth: true,
      };
    }

    const reservations = await prisma.testDriveBooking.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      include: {
        car: {
          include: {
            savedBy: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
      orderBy: {
        bookingDate: "asc",
      },
    });

    const formattedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      bookingDate: reservation.bookingDate.toISOString(),
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      status: reservation.status,
      notes: reservation.notes,
      createdAt: reservation.createdAt.toISOString(),
      car: serializeCar(reservation.car),
    }));

    return {
      success: true,
      data: formattedReservations,
    };
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return {
      success: false,
      error: "Failed to fetch reservations",
    };
  }
}

export async function cancelReservation(bookingId: string, reason?: string) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "You must be logged in to cancel reservations",
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
        error: "Reservation not found",
      };
    }

    // Check if user owns this reservation
    if (booking.userId !== user.id) {
      return {
        success: false,
        error: "You can only cancel your own reservations",
      };
    }

    // Check if already cancelled or completed
    if (booking.status === "CANCELLED") {
      return {
        success: false,
        error: "This reservation is already cancelled",
      };
    }

    if (booking.status === "COMPLETED") {
      return {
        success: false,
        error: "Cannot cancel a completed test drive",
      };
    }

    // Check if it's less than 24 hours before the booking
    const bookingDate = new Date(booking.bookingDate);
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      parseInt(booking.startTime.split(":")[0]),
      parseInt(booking.startTime.split(":")[1])
    );
    
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Update booking to cancelled
    await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        notes: reason 
          ? `${booking.notes ? booking.notes + "\n\n" : ""}Cancellation reason: ${reason} (${hoursUntilBooking < 24 ? 'Late cancellation' : 'Standard cancellation'})`
          : booking.notes,
      },
    });

    revalidatePath("/reservations");
    revalidatePath(`/cars/${booking.carId}`);

    return {
      success: true,
      message: hoursUntilBooking < 24 
        ? "Reservation cancelled. Note: Late cancellation may be subject to a fee."
        : "Reservation cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return {
      success: false,
      error: "Failed to cancel reservation",
    };
  }
}

export async function updateReservationStatus(
  bookingId: string,
  status: string,
  adminNotes?: string
) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: "Authentication required",
        requiresAuth: true,
      };
    }

    // Check if user is admin
    const userRole = (user as any)?.role;
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      return {
        success: false,
        error: "Admin privileges required",
      };
    }

    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Reservation not found",
      };
    }

    await prisma.testDriveBooking.update({
      where: { id: bookingId },
      data: {
        status: status as any,
        notes: adminNotes 
          ? `${booking.notes ? booking.notes + "\n\n" : ""}Admin update: ${adminNotes}`
          : booking.notes,
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/reservations");

    return {
      success: true,
      message: `Reservation status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return {
      success: false,
      error: "Failed to update reservation status",
    };
  }
}
