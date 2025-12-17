import type { Metadata } from "next";
import "@/app/globals.css";


export const metadata: Metadata = {
  title: "Browse Cars | EastRide",
  description: "Find your perfect car from our wide selection of vehicles",
};

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="padded pb-12">
        <h1 className="text-3xl text-gradient font-bold mb-6">Browse Cars</h1>
        {children}
      </div>
    </div>
  );
}
