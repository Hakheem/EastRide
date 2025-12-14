import { DayOfWeek, UserRole } from "@prisma/client";

export interface WorkingHoursFormData {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface DealershipFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface UserWithDetails {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  accounts: Array<{ provider: string }>;
  _count: {
    savedCars: number;
    testDriveBookings: number;
  };
}
