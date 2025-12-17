import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Phone, Mail, MapPin, Clock, MessageSquare, User, Send, CheckCircle } from "lucide-react"
import ContactForm from "@/components/forms/ContactForm"
import { Car, DollarSign } from "lucide-react"
import { getDealershipInfo } from "@/app/actions/dealership";
import FAQ from "@/components/general/FAQ"



export default async function ContactPage() {
  const dealershipInfo = await getDealershipInfo()

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Phone",
      description: "Call us anytime",
      value: dealershipInfo?.phone || "+254 769 403 162",
      link: `tel:${dealershipInfo?.phone?.replace(/\s/g, '') || '+254769403162'}`,
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      description: "Send us an email",
      value: dealershipInfo?.email || "hakheem67@gmail.com",
      link: `mailto:${dealershipInfo?.email || 'hakheem67@gmail.com'}`,
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location",
      description: "Visit our dealership",
      value: dealershipInfo?.address || "35/60 Nairobi, Kenya",
      link: "https://maps.google.com/?q=35/60+Nairobi+Kenya",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Working Hours",
      description: "We're here for you",
      value: "Mon - Sat: 8:00 AM - 8:00 PM\nSunday: 10:00 AM - 6:00 PM",
      link: null,
    },
  ]

  return (
    <div className="padded mx-auto md:pb-10">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl  font-bold mb-4">Get In Touch</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions about our cars, test drives, or services? We're here to help. 
          Reach out to us through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:mb-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Multiple ways to reach us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{info.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{info.description}</p>
                    <div className="whitespace-pre-line text-sm">
                      {info.link ? (
                        <a 
                          href={info.link} 
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <span className="font-medium">{info.value}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Why Choose Us */}
              <div className="mt-8 hidden md:block ">
                <h3 className="font-semibold text-lg mb-4">Why Choose Us</h3>
                <ul className="space-y-3">
                  {[
                    "24/7 Customer Support",
                    "Flexible Test Drive Scheduling",
                    "Transparent Pricing",
                    "Wide Range of Quality Vehicles",
                    "Expert Financing Assistance",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className='hidden md:flex bg-linear-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800' >
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/test-drive">
                  <Clock className="w-4 h-4 mr-2" />
                  Book a Test Drive
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/cars">
                  <Car className="w-4 h-4 mr-2" />
                  Browse Available Cars
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/financing">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Financing Options
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form & Map */}
        <div className="lg:col-span-2 space-y-8">
          <Card className='bg-gray-50 dark:bg-gray-900' >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          {/* Map & Location */}
          <Card className='bg-gray-50 dark:bg-gray-900'>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Find Our Dealership
              </CardTitle>
              <CardDescription>
                Visit us at our location in Nairobi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border">
                <div className="h-64 md:h-80 bg-gray-100 dark:bg-gray-800 relative">
                  {/* Google Maps Embed */}
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.857263228591!2d36.8212601!3d-1.2598955!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f173c0a1f9b27%3A0x3b4b7e3b4b7e3b4b!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1620000000000!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                    title="Dealership Location"
                  />
                  {/* Fallback for iframe */}
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-r from-blue-500/10 to-purple-500/10">
                    <div className="text-center p-4 bg-white/90 dark:bg-gray-900/90 rounded-lg backdrop-blur-sm">
                      <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                      <h3 className="font-bold text-lg">East Africa Rides</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {dealershipInfo?.address || "35/60 Nairobi, Kenya"}
                      </p>
                      <Button size="sm" className="mt-3" asChild>
                        <a 
                          href="https://maps.google.com/?q=35/60+Nairobi+Kenya"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold">{dealershipInfo?.name || "East Africa Rides"}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dealershipInfo?.address || "35/60 Nairobi, Kenya"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${dealershipInfo?.phone?.replace(/\s/g, '') || '+254769403162'}`}>
                          <Phone className="w-3 h-3 mr-1" />
                          Call Now
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a 
                          href="https://maps.google.com/?q=35/60+Nairobi+Kenya"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="w-3 h-3 mr-1" />
                          Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
       {/* <FAQ /> */}
    </div>
  )
}


