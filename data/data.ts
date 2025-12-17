
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


export const carBrands = [
  {
    brand: "Toyota",
    image: "/toyota-svg.svg" 
  },
  {
    brand: "Mercedes-Benz",
    image: "/benz-svg.svg"
  },
  {
    brand: "Mitsubishi",
    image: "/mitsubishi-svg.svg"
  },
  {
    brand: "Subaru",
    image: "/subaru-svg.svg"
  },
  {
    brand: "Volkswagen",
    image: "/volkswagen-svg.svg"
  },
  {
    brand: "Isuzu",
    image: "/isuzu-svg.svg"
  },
  {
    brand: "Land Rover",
    image: "/land-rover-svg.svg"
  },
  {
    brand: "Honda",
    image: "/honda-svg.svg"
  },
  {
    brand: "Ford",
    image: "/ford-svg.svg"
  },
  {
    brand: "Nissan",
    image: "/nissan-svg.svg"
  },
  {
    brand: "BMW",
    image: "/bmw-svg.svg"
  },
  {
    brand: "Audi",
    image: "/audi-svg.svg"
  },
  {
    brand: "Suzuki",
    image: "/suzuki_logo.png"
  }
];

export const carBrandsList = carBrands.map(b => b.brand);

export const fuelTypes = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const transmissionTypes = ["Automatic", "Manual", "Semi-Auto", "CVT"];

// Body Types for Filters
export const bodyTypes = [
  { name: "SUV", image: "/suv_body.png" },
  { name: "Sedan", image: "/sedan_body.png" },
  { name: "Hatchback", image: "/hatchback_body.png" },
  { name: "Coupe", image: "/coupe_body.png" },
  { name: "Coupe SUV", image: "/suv_coupe_body.png" },
  { name: "Convertible", image: "/convertible_body.png" },
  { name: "Muscle", image: "/muscle_body.png" },
  { name: "Wagon", image: "/wagon_body.png" },
  { name: "Pickup", image: "/pickup_body.png" },
  { name: "Minivan", image: "/minivan_body.png" },
  { name: "Van", image: "/van_body.png" },
  { name: "Crossover", image: "/crossover_body.png" },
  { name: "Sports", image: "/sports_body.png" },
  { name: "Hyper", image: "/hyper_body.png" },
  { name: "Luxury", image: "/luxury_body.png" },
  { name: "Luxury SUV", image: "/luxury_suv_body.png" },
  { name: "Off-road", image: "/offroad_body.png" },
  { name: "Compact Car", image: "/compact_car_body.png" },
  { name: "Limousine", image: "/limousine_body.png" },
  { name: "Micro", image: "/micro_body.png" },
  { name: "MPV", image: "/mpv_body.png" },
];



export const priceRanges = [
  { label: "Under 1M", min: 0, max: 1000000 },
  { label: "1M - 3M", min: 1000000, max: 3000000 },
  { label: "3M - 6M", min: 3000000, max: 6000000 },
  { label: "6M - 10M", min: 6000000, max: 10000000 },
  { label: "Over 10M", min: 10000000, max: 999999999 }
];

export function formatPrice(price: number, currency: string = "KSH"): string {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `${currency} ${(price / 1000).toFixed(0)}K`;
  }
  return `${currency} ${price}`;
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
