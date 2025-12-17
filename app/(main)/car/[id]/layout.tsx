import type { Metadata } from "next";
import { getCarById } from "@/app/actions/cars";

interface CarLayoutProps {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  
  const result = await getCarById(id);
  
  if (!result.success || !result.data) {
    return {
      title: "Car Not Found",
      description: "The car you're looking for could not be found.",
    };
  }
  
  const car = result.data;
  
  return {
    title: `${car.year} ${car.make} ${car.model} | Car Details`,
    description: car.description || `Buy this ${car.year} ${car.make} ${car.model}. Features: ${car.color} color, ${car.fuelType} fuel, ${car.transmission} transmission. Price: $${car.price.toLocaleString()}.`,
    keywords: [
      car.make,
      car.model,
      car.year.toString(),
      "car for sale",
      "used car",
      "vehicle",
      car.bodyType,
      car.color,
      car.fuelType,
      car.transmission,
    ],
    openGraph: {
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description || `Available for purchase at $${car.price.toLocaleString()}`,
      type: "website",
      images: car.images && car.images.length > 0 ? [car.images[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${car.year} ${car.make} ${car.model}`,
      description: car.description || `Available for purchase at $${car.price.toLocaleString()}`,
      images: car.images && car.images.length > 0 ? [car.images[0]] : [],
    },
  };
}

export default function CarLayout({ children }: CarLayoutProps) {
  return children;
}
