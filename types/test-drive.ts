import { BookingStatus } from "@prisma/client";
import { CarType } from "./car";

// In your types file (e.g., types/test-drive.ts)
export interface TestDriveBooking {
  id: string;
  carId: string;
  userId: string;
  bookingDate: string; // ISO string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: BookingStatus;
  notes?: string | null;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
  car?: CarType & {
    dealership?: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface BookTestDriveParams {
  carId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface TestDriveFilters {
  status?: BookingStatus;
  carId?: string;
  userId?: string;
}

export interface WorkingHours {
  [day: string]: string; // e.g., "monday": "09:00 - 18:00"
}