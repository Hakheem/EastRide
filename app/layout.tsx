import type { Metadata } from "next";
import { Lato, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/general/ThemeProvider"
import { SessionProvider } from "@/components/providers/SessionProviders";
import { ThemeToggle } from "@/components/general/ThemeToggle";
import { Toaster } from "sonner";


const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EastRide",
  description: "EastRide — a modern and sleek car marketplace platform for East Africa, featuring clean design and easy browsing.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <body className={`${lato.variable} ${grotesk.variable} antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange 
          >
            {children}
          </ThemeProvider>
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}

