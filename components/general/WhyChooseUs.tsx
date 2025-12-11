"use client"

import React from 'react'
import { Car, Calendar, ShieldCheck } from 'lucide-react'

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: Car,
      title: "Wide Selection",
      description: "Browse through hundreds of verified cars, from budget-friendly sedans to luxury SUVs, find the perfect vehicle that matches your style and needs.",
    },
    {
      icon: Calendar,
      title: "Easy Test Drives",
      description: "Schedule test drives at your convenience with our easy booking system. Try before you buy with flexible scheduling and professional test drive assistance.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Process",
      description: "Every car is verified, bookings are secure and seamlessfor your piece of mind.",
    },
  ]

  return (
    <div className='py-16 '>
      <div className='mx-auto padded'>
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Why Choose <span className='text-gradient'>EastRide?</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="text-center p-6  "
            >
              <div className="bg-primary/10 text-primary rounded-full size-16 flex items-center justify-center mx-auto mb-4">
                <reason.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WhyChooseUs

