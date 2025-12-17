"use client";

import { useState } from "react";
import { 
  MapPin, Phone, Mail, Clock, Building 
} from "lucide-react";

interface CarDetailsTabsProps {
  car: any; 
}

export default function CarDetailsTabs({ car }: CarDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  // Format day names for display
  const formatDayName = (day: string) => {
    const days: Record<string, string> = {
      monday: "Monday",
      tuesday: "Tuesday", 
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    };
    return days[day] || day;
  };

  // Format and sort working hours
  const formatWorkingHours = () => {
    if (!car.dealership?.hours) return null;
    
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Convert to array, sort by day order, then format
    return Object.entries(car.dealership.hours)
      .sort(([dayA], [dayB]) => dayOrder.indexOf(dayA) - dayOrder.indexOf(dayB))
      .map(([day, hours]: [string, any]) => ({
        day,
        formattedDay: formatDayName(day),
        hours
      }));
  };

  // Check if dealership exists
  const hasDealership = car.dealership && car.dealership.name;

  return (
    <div className=" lg:mt-4">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("description")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer " 
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "specifications"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("dealership")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "dealership"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
            }`}
          >
            Dealership
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === "description" && (
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              About This {car.make} {car.model}
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              {car.description ? (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {car.description}
                </p>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    This stunning {car.year} {car.make} {car.model} is in excellent condition and ready for its next owner. 
                    With only {car.mileage ? car.mileage.toLocaleString() : 'low'} km, this vehicle has been meticulously maintained and 
                    serviced regularly.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Featuring a {car.engineSize ? `${car.engineSize}L ` : ''}engine and smooth {car.transmission?.toLowerCase() || 'automatic'} transmission, 
                    this car delivers an exceptional driving experience. The interior is equipped with premium features 
                    including comfortable seating and modern amenities.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    This vehicle comes with a full service history and has passed all necessary inspections. 
                    Don't miss this opportunity to own a piece of automotive excellence.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Make & Model</span>
                <span className="font-medium">{car.make} {car.model}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Year</span>
                <span className="font-medium">{car.year}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Mileage</span>
                <span className="font-medium">{car.mileage?.toLocaleString() || 'N/A'} km</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Seats</span>
                <span className="font-medium">{car.seats || '5'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Color</span>
                <span className="font-medium capitalize">{car.color || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "dealership" && (
       <div className="space-y-6">
  <div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
      {hasDealership ? car.dealership.name : "EastRide Motors"}
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Working Hours
        </h4>
        <div className="space-y-2 text-sm">
          {hasDealership && car.dealership.hours ? (
            formatWorkingHours()?.map(({ day, formattedDay, hours }) => (
              <div key={day} className="flex justify-between">
                <span className="capitalize text-gray-600 dark:text-gray-400">
                  {formattedDay}:
                </span>
                <span className="font-medium">{hours}</span>
              </div>
            ))
          ) : (
            // Fallback if no dealership data
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monday - Friday:</span>
                <span className="font-medium">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Saturday:</span>
                <span className="font-medium">09:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sunday:</span>
                <span className="font-medium">10:00 - 15:00</span>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div>
        {/* Container: centered on md+ screens */}
        <div className="space-y-3 md:flex md:flex-col md:items-center md:justify-center md:h-full">
          {/* Each item: icon left, text right, but the whole item block is centered */}
          <div className="flex items-start gap-2 md:w-auto">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Address</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasDealership ? car.dealership.address : "Nairobi, Kenya"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 md:w-auto">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Phone</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasDealership ? car.dealership.phone : "+254 769 403 162"}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 md:w-auto">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Email</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasDealership ? car.dealership.email : "info@eastride.co.ke"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div className="">
    <p className="text-sm text-gray-600 dark:text-gray-400">
      Visit our dealership to see this car in person. Our friendly staff will be happy to assist you with any questions and arrange a test drive.
    </p>
  </div>
</div>


        )}
      </div>
    </div>
  );
}