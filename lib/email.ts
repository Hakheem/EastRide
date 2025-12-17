import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactEmailProps {
  to: string
  subject: string
  name: string
  email?: string  
  phone?: string
  message?: string
  inquiryType?: string
  contactMethod?: string
  isAutoReply?: boolean
}

export async function sendContactEmail({
  to,
  subject,
  name,
  email,
  phone,
  message,
  inquiryType,
  contactMethod,
  isAutoReply = false,
}: ContactEmailProps) {
  try {
    if (isAutoReply) {
      // Auto-reply template - email is optional here
      await resend.emails.send({
        from: "East Africa Rides <noreply@eastafricarides.com>",
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Thank you for contacting East Africa Rides!</h1>
            <p>Dear ${name},</p>
            <p>We have received your message and will get back to you within 24 hours.</p>
            <p>If your inquiry is urgent, please call us at +254 769 403 162.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The East Africa Rides Team</strong></p>
          </div>
        `,
      })
    } else {
      // Admin notification template - email should be provided
      await resend.emails.send({
        from: "Contact Form <noreply@eastafricarides.com>",
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
              <p><strong>Inquiry Type:</strong> ${inquiryType || 'General'}</p>
              <p><strong>Preferred Contact:</strong> ${contactMethod || 'Email'}</p>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This message was sent from the contact form on East Africa Rides website.
            </p>
          </div>
        `,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

