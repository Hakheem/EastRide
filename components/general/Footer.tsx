 "use client"

import Link from "next/link"
import Image from "next/image"
import { 
  Facebook, Twitter, Instagram, Youtube, 
  Mail, Phone, MapPin, Car, Shield, 
  Clock, CreditCard, HeadphonesIcon as Headphones 
} from "lucide-react"
import { Button } from "@/components/ui/button"

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      {/* Main Footer Content */}
      <div className="padded py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="EastRide Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-white">
                East<span className="text-primary">Ride</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              East Africa's premier car marketplace connecting buyers and sellers across Kenya, 
              Tanzania, Uganda, and Rwanda. Find your perfect ride with confidence.
            </p>
            <div className="flex gap-4 mb-8">
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary transition-colors rounded-full">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary transition-colors rounded-full">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary transition-colors rounded-full">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-primary transition-colors rounded-full">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/cars" className="hover:text-primary transition-colors">Browse Cars</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">Sell Your Car</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Car Types</h3>
            <ul className="space-y-3">
              <li><Link href="/cars?type=suv" className="hover:text-primary transition-colors">SUVs</Link></li>
              <li><Link href="/cars?type=sedan" className="hover:text-primary transition-colors">Sedans</Link></li>
              <li><Link href="/cars?type=hatchback" className="hover:text-primary transition-colors">Hatchbacks</Link></li>
              <li><Link href="/cars?type=pickup" className="hover:text-primary transition-colors">Pickup Trucks</Link></li>
              <li><Link href="/cars?type=luxury" className="hover:text-primary transition-colors">Luxury Cars</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">Get the latest car deals and updates</p>
            <form className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>support@eastride.co.ke</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-medium">Verified Sellers</h4>
              <p className="text-sm text-gray-400">All sellers verified</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-medium">150+ Point Check</h4>
              <p className="text-sm text-gray-400">Comprehensive inspection</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Headphones className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-medium">24/7 Support</h4>
              <p className="text-sm text-gray-400">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="text-white font-medium">Secure Payment</h4>
              <p className="text-sm text-gray-400">100% safe transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="padded flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} EastRide. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

