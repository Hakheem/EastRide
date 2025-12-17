
import type { Metadata } from "next";
import "@/app/globals.css";


export const metadata: Metadata = {
  title: "Contact Us | East Africa Rides",
  description: "Get in touch with East Africa Rides for car sales, test drives, financing, or vehicle services in Nairobi, Kenya.",
}


export default function ContactPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
        {children}
    </div>
  );
}

