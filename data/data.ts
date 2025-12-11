
// FAQ Data
export const faqs = [
  {
    id: 1,
    question: "How do I know the cars listed are in good condition?",
    answer: "All cars on EastRide undergo a 150-point inspection process. We verify vehicle history, check for accidents, inspect mechanical components, and ensure proper documentation. Each listing includes an inspection report with photos of any imperfections."
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer: "We accept multiple payment options: bank transfers, mobile money (M-Pesa, Airtel Money), credit/debit cards, and secure escrow services. For high-value purchases, we recommend using our escrow service which holds funds until you receive and inspect the vehicle."
  },
  {
    id: 3,
    question: "Can I test drive a car before buying?",
    answer: "Yes, test drives are arranged through the seller. We recommend scheduling test drives during daylight hours and bringing a friend along. Sellers are required to have valid insurance and registration for test drives. You can request a test drive directly through the car listing page."
  },
  {
    id: 4,
    question: "Do you offer delivery services?",
    answer: "We offer delivery within major cities in East Africa. Delivery fees vary based on distance: free within 50km, $50 for 50-100km, and custom quotes for longer distances. Delivery can be arranged after purchase confirmation and payment verification."
  },
  {
    id: 5,
    question: "What if I have issues with the car after purchase?",
    answer: "We offer a 7-day return policy for qualifying issues not disclosed in the listing. For mechanical problems, we provide a 3-month limited warranty on selected vehicles. Our support team mediates between buyers and sellers to ensure fair resolutions for any post-purchase concerns."
  },
  {
    id: 6,
    question: "How do I list my car for sale?",
    answer: "Listing is free! Click 'Sell Your Car' on our homepage, upload photos, provide vehicle details, and set your price. We recommend including at least 10 photos from different angles. Once submitted, our team verifies the information before the listing goes live (usually within 24 hours)."
  }
];

// Featured Cars Data
export const featuredCars = [
  {
    id: 1,
    name: "Toyota Land Cruiser V8",
    make: "Toyota",
    model: "Land Cruiser",
    year: 2022,
    price: 8500000, // KSH
    mileage: 18000,
    transmission: "Automatic",
    fuelType: "Diesel",
    bodyType: "SUV",
    color: "Pearl White",
    wishListed: true,
    images: [
      "/hero-1.png",
      "/hero-2.png",
      "/hero-3.png"
    ],
    features: ["4WD", "Leather Seats", "Sunroof", "Navigation", "Heated Seats"],
    location: "Nairobi",
    rating: 4.8,
    sellerType: "Dealer"
  },
  {
    id: 2,
    name: "Mercedes-Benz C200",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2021,
    price: 5200000,
    mileage: 25000,
    transmission: "Automatic",
    fuelType: "Petrol",
    bodyType: "Sedan",
    color: "Obsidian Black",
    wishListed: false,
    images: [
      "/hero_4.png",
      "/gtr.png"
    ],
    features: ["Premium Package", "Panoramic Roof", "Burmester Sound", "LED Headlights"],
    location: "Mombasa",
    rating: 4.6,
    sellerType: "Private"
  },
  {
    id: 3,
    name: "Mitsubishi Pajero Sport",
    make: "Mitsubishi",
    model: "Pajero Sport",
    year: 2020,
    price: 4200000,
    mileage: 45000,
    transmission: "Automatic",
    fuelType: "Diesel",
    bodyType: "SUV",
    color: "Titanium Gray",
    wishListed: true,
    images: [
      "/pajero-1.png",
      "/pajero-2.png",
      "/pajero-3.png",
      "/pajero-4.png"
    ],
    features: ["7 Seater", "Off-road Mode", "Rear AC", "Tow Package"],
    location: "Kampala",
    rating: 4.5,
    sellerType: "Dealer"
  },
  {
    id: 4,
    name: "Subaru Forester XT",
    make: "Subaru",
    model: "Forester",
    year: 2019,
    price: 3800000,
    mileage: 60000,
    transmission: "Automatic",
    fuelType: "Petrol",
    bodyType: "SUV",
    color: "Marine Blue",
    wishListed: false,
    images: [
      "/forester-1.png",
      "/forester-2.png"
    ],
    features: ["Symmetrical AWD", "Eyesight Safety", "Apple CarPlay", "Roof Rails"],
    location: "Dar es Salaam",
    rating: 4.7,
    sellerType: "Private"
  },
  {
    id: 5,
    name: "Volkswagen Golf GTI",
    make: "Volkswagen",
    model: "Golf",
    year: 2021,
    price: 3200000,
    mileage: 22000,
    transmission: "Manual",
    fuelType: "Petrol",
    bodyType: "Hatchback",
    color: "Tornado Red",
    wishListed: true,
    images: [
      "/golf-gti-1.png",
      "/golf-gti-2.png",
      "/golf-gti-3.png"
    ],
    features: ["Sport Suspension", "Paddle Shifters", "Premium Audio", "LED DRLs"],
    location: "Nairobi",
    rating: 4.9,
    sellerType: "Dealer"
  },
  {
    id: 6,
    name: "Isuzu D-Max",
    make: "Isuzu",
    model: "D-Max",
    year: 2022,
    price: 4800000,
    mileage: 15000,
    transmission: "Manual",
    fuelType: "Diesel",
    bodyType: "Pickup Truck",
    color: "Silver Metallic",
    wishListed: false,
    images: [
      "/dmax-1.png",
      "/dmax-2.png"
    ],
    features: ["4x4", "Double Cab", "Canopy", "Reverse Camera", "Bluetooth"],
    location: "Arusha",
    rating: 4.4,
    sellerType: "Private"
  },
  {
    id: 7,
    name: "Range Rover Sport",
    make: "Land Rover",
    model: "Range Rover Sport",
    year: 2020,
    price: 12500000,
    mileage: 35000,
    transmission: "Automatic",
    fuelType: "Diesel",
    bodyType: "Luxury SUV",
    color: "Santorini Black",
    wishListed: true,
    images: [
      "/rangerover-1.png",
      "/rangerover-2.png",
      "/rangerover-3.png",
      "/rangerover-4.png"
    ],
    features: ["Terrain Response", "Meridian Sound", "Massage Seats", "HUD Display"],
    location: "Nairobi",
    rating: 4.8,
    sellerType: "Dealer"
  },
  {
    id: 8,
    name: "Honda Civic Type R",
    make: "Honda",
    model: "Civic",
    year: 2021,
    price: 4500000,
    mileage: 18000,
    transmission: "Manual",
    fuelType: "Petrol",
    bodyType: "Hatchback",
    color: "Championship White",
    wishListed: false,
    images: [
      "/civic-typeR-1.png",
      "/civic-typeR-2.png"
    ],
    features: ["Sport Mode", "Recaro Seats", "Brembo Brakes", "Triple Exhaust"],
    location: "Mombasa",
    rating: 4.9,
    sellerType: "Private"
  }
];


export const carBrands = [
  {
    brand: "Toyota",
    image: "/toyota-7.svg" 
  },
  {
    brand: "Mercedes-Benz",
    image: "/mercedes.svg"
  },
  {
    brand: "Mitsubishi",
    image: "/mitsubishi.svg"
  },
  {
    brand: "Subaru",
    image: "/subaru-1.svg"
  },
  {
    brand: "Volkswagen",
    image: "/volkswagen.svg"
  },
  {
    brand: "Isuzu",
    image: "/isuzu.svg"
  },
  {
    brand: "Land Rover",
    image: "/https://worldvectorlogo.com/downloaded/volkswagen-10.svg"
  },
  {
    brand: "Honda",
    image: "/honda.svg"
  },
  {
    brand: "Ford",
    image: "/ford.svg"
  },
  {
    brand: "Nissan",
    image: "/nissan.svg"
  },
  {
    brand: "BMW",
    image: "/bmw.svg"
  },
  {
    brand: "Audi",
    image: "/audi.svg"
  }
];

//  original array for filters if needed
export const carBrandsList = carBrands.map(b => b.brand);

// Fuel Types for Filters
export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

// Transmission Types for Filters
export const transmissionTypes = ["Automatic", "Manual", "Semi-Auto", "CVT"];

// Body Types for Filters

export const bodyTypes = [
  {
    name: "SUV",
    image: "/gtr.png",
  },
  {
    name: "Sedan",
    image: "/gtr.png",
  },
  {
    name: "Hatchback",
    image: "/gtr.png",
  },
  {
    name: "Pickup Truck",
    image: "/gtr.png",
  },
  {
    name: "Luxury SUV",
    image: "/gtr.png",
  },
  {
    name: "Coupe",
    image: "/gtr.png",
  },
  {
    name: "Minivan",
    image: "/gtr.png",
  },
];
// Price Ranges (in KSH)
export const priceRanges = [
  { label: "Under 1M", min: 0, max: 1000000 },
  { label: "1M - 3M", min: 1000000, max: 3000000 },
  { label: "3M - 6M", min: 3000000, max: 6000000 },
  { label: "6M - 10M", min: 6000000, max: 10000000 },
  { label: "Over 10M", min: 10000000, max: 999999999 }
];

// Helper function to format price
export function formatPrice(price: number, currency: string = "KSH"): string {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  }
  return `${currency} ${price}`;
}

// Helper function to get car by ID
export function getCarById(id: number) {
  return featuredCars.find(car => car.id === id);
}

// Helper function to get wishlisted cars
export function getWishlistedCars() {
  return featuredCars.filter(car => car.wishListed);
}

// Testimonials data
export const testimonials = [
  {
    id: 1,
    name: "David Kamau",
    role: "Business Owner",
    content: "Found my perfect work truck in 3 days! The verification process gave me confidence in the purchase.",
    rating: 5,
    date: "2024-01-15"
  },
  {
    id: 2,
    name: "Sarah Mwangi",
    role: "Family Buyer",
    content: "As a first-time car buyer, I was nervous. EastRide's team guided me through every step. Love my new family SUV!",
    rating: 5,
    date: "2024-02-10"
  },
  {
    id: 3,
    name: "James Omondi",
    role: "Car Enthusiast",
    content: "Finally found a well-maintained Golf GTI! The detailed inspection report was accurate and transparent.",
    rating: 4,
    date: "2024-03-05"
  }
];

