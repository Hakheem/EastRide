"use server"

import { prisma } from "@/lib/prisma"
import { sendContactEmail } from "@/lib/email"

export async function submitContactForm(data: {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  contactMethod: string
  inquiryType: string
}) {
  try {
    // Save contact form submission to database
    const contactSubmission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        contactMethod: data.contactMethod,
        inquiryType: data.inquiryType,
        status: "PENDING",
      },
    })

    // Send email notification
    await sendContactEmail({
      to: "hakheem67@gmail.com", // Your dealership email
      subject: `New Contact Form: ${data.subject}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      inquiryType: data.inquiryType,
      contactMethod: data.contactMethod,
    })

    // Optional: Send auto-reply to user
    await sendContactEmail({
      to: data.email,
      subject: "Thank you for contacting East Africa Rides",
      name: data.name,
      isAutoReply: true,
    })

    return {
      success: true,
      message: "Message sent successfully.",
      data: contactSubmission,
    }
  } catch (error) {
    console.error("Error submitting contact form:", error)
    return {
      success: false,
      error: "Failed to send message. Please try again.",
    }
  }
}


