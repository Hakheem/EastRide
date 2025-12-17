"use client";

import Breadcrumb from "./Breadcrumb";
import CarImages from "./CarImages";
import CarDetailsTabs from "./CarDetailsTabs";
import CarSidebar from "./CarSidebar";

interface CarDetailClientProps {
  car: any;
  isWishlisted: boolean;
  hasBookedTestDrive: boolean;
  testDriveBookingDate?: Date | null;
}

export default function CarDetailClient({ 
  car, 
  isWishlisted,
  hasBookedTestDrive,
  testDriveBookingDate 
}: CarDetailClientProps) {
  return (
    <div className="min-h-screen ">
      <div className="padded">
        <Breadcrumb make={car.make} model={car.model} year={car.year} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Image and Gallery - Span 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <CarImages 
              car={car} 
              isWishlisted={isWishlisted}
            />
            <CarDetailsTabs car={car} />
          </div>

          {/* Sidebar - Span 1 column */}
          <div className="lg:col-span-1">
            <CarSidebar 
              car={car} 
              isWishlisted={isWishlisted}
              hasBookedTestDrive={hasBookedTestDrive}
              testDriveBookingDate={testDriveBookingDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

