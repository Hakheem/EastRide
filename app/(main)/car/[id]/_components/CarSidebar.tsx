"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Calendar, MessageCircle, Mail,
  Fuel, Cog, Gauge
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EMICalculatorDialog from "./EMICalculator";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

interface CarSidebarProps {
  car: any;
  isWishlisted: boolean;
  hasBookedTestDrive: boolean;
  testDriveBookingDate?: Date | null;
}

export default function CarSidebar({
  car,
  isWishlisted,
  hasBookedTestDrive,
  testDriveBookingDate
}: CarSidebarProps) {
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBookTestDrive = () => {
    // Check if user is logged in using session
    if (!session?.user) {
      toast.error("Please login to book a test drive");
      router.push("/login");
      return;
    }

    if (hasBookedTestDrive) {
      toast.info("You have already booked a test drive for this car");
      return;
    }

    // Redirect to test drive booking page
    router.push(`/test-drive/${car.id}`);
  };

  const estimatedEMI = Math.round((car.price * 0.05) / 56);

  return (
    <div className="space-y-6 sticky top-20 shadow-none">
      {/* Pricing & Actions Card */}
      <Card className='bg-gray-50 dark:bg-gray-900 shadow-none' >
        <CardContent className="p-6">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gradient">
                {formatPrice(car.price)}
              </span>
            </div>

            {/* Car details below price */}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Gauge className="w-4 h-4" />
                <span>{car.mileage?.toLocaleString() || 'N/A'} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-4 h-4" />
                <span>{car.fuelType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cog className="w-4 h-4" />
                <span>{car.transmission}</span>
              </div>
            </div>
          </div>

          {/* EMI Calculator Preview */}
          <div
            className="mb-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setShowEMICalculator(true)}
          >
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">EMI Calculator</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated monthly payment:</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(estimatedEMI)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                *Based on KES 0 down payment and 5% interest rate for 56 months
              </p>
            </div>
          </div>

          {/* Test Drive Button */}
          <div className="space-y-3">
            {car.status === 'AVAILABLE' ? (
              <Button
                className="w-full h-12 text-md "
                onClick={handleBookTestDrive}
              >
                <Calendar className="w-5 h-5 mr-1" />
                {hasBookedTestDrive && testDriveBookingDate ? (
                  `Booked for ${format(new Date(testDriveBookingDate), 'MMM d, yyyy')}`
                ) : (
                  'Book Test Drive'
                )}
              </Button>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 text-center font-medium">
                  {car.status === 'SOLD' ? 'This car has been sold' : 'This car is currently unavailable'}
                </p>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Have a question?</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Our representatives are available to answer any questions you may have about this vehicle.
            </p>
            <div className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:hakheem67@gmail.com">
                  <Mail className="w-4 h-4 mr-2" />
                  Request Info
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://wa.me/254769403162" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EMI Calculator Dialog */}
      <EMICalculatorDialog
        isOpen={showEMICalculator}
        onClose={() => setShowEMICalculator(false)}
        carPrice={car.price}
      />
    </div>
  );
}

