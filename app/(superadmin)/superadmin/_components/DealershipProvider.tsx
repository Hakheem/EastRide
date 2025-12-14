import { prisma } from '@/lib/prisma';

export async function getDealershipInfo() {
  try {
    const dealershipInfo = await prisma.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    return dealershipInfo || {
      name: 'EastRide',
      address: '35/60 Nairobi Kenya',
      phone: '+254769403162',
      email: 'hakheem67@gmail.com',
    };
  } catch (error) {
    console.error('Error fetching dealership info:', error);
    return {
      name: 'EastRide',
      address: '35/60 Nairobi Kenya',
      phone: '+254769403162',
      email: 'hakheem67@gmail.com',
    };
  }
}

