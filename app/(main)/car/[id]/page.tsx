import { notFound } from "next/navigation";
import { getCarById } from "@/app/actions/cars";
import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import CarDetailClient from "./_components/CarDetailClient";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch car data and user data in parallel
  const [carResult, user] = await Promise.all([
    getCarById(id),
    getCurrentUser(),
  ]);
  
  if (!carResult.success || !carResult.data) {
    notFound();
  }

  const car = carResult.data;
  
  // Check if car is wishlisted for the current user
  let isWishlisted = false;
  if (user?.id) {
    const userRole = (user as any)?.role;
    // Only check wishlist for regular users, not admins/superadmins
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      try {
        const wishlistItem = await prisma.userSavedCar.findUnique({
          where: {
            userId_carId: {
              userId: user.id,
              carId: id,
            }
          }
        });
        isWishlisted = !!wishlistItem;
      } catch (error) {
        console.error("Error checking wishlist:", error);
        // Don't break the page if wishlist check fails
      }
    }
  }

  // Check if user has booked a test drive for this car
  let hasBookedTestDrive = false;
  let testDriveBookingDate = null;
  
  if (user?.id) {
    try {
      // Use bookingDate instead of scheduledDate
      const testDrive = await prisma.testDriveBooking.findFirst({
        where: {
          userId: user.id,
          carId: id,
          // You might want to check for specific status like "CONFIRMED" or "APPROVED"
          // status: "CONFIRMED",
        },
        select: {
          bookingDate: true, // Changed from scheduledDate to bookingDate
        },
        orderBy: {
          createdAt: 'desc', // Get the most recent booking
        }
      });
      
      if (testDrive) {
        hasBookedTestDrive = true;
        testDriveBookingDate = testDrive.bookingDate; // Changed from scheduledDate to bookingDate
      }
    } catch (error) {
      console.error("Error checking test drive:", error);
      // Don't break the page if test drive check fails
      // The table might not exist yet or have a different name
    }
  }

  return (
    <CarDetailClient 
      car={car} 
      isWishlisted={isWishlisted}
      hasBookedTestDrive={hasBookedTestDrive}
      testDriveBookingDate={testDriveBookingDate}
    />
  );
}

