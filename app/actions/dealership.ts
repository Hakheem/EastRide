"use server"

import { prisma } from "@/lib/prisma"

export async function getDealershipInfo() {
  try {
    const dealership = await prisma.dealershipInfo.findFirst({
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    })

    if (!dealership) {
      // Return default values if no dealership info exists
      return {
        name: "East Africa Rides",
        address: "35/60 Nairobi, Kenya",
        phone: "+254 769 403 162",
        email: "hakheem67@gmail.com",
        workingHours: [],
      }
    }

    return dealership
  } catch (error) {
    console.error("Error fetching dealership info:", error)
    return null
  }
}