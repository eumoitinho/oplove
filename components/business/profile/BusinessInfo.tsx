"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Facebook,
  MapPin,
  Clock,
  CreditCard,
  Star,
  Users,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BusinessInfoProps {
  business: {
    id: string
    name: string
    type: string
    phone?: string
    email?: string
    website?: string
    socialMedia: {
      instagram?: string
      twitter?: string
      facebook?: string
    }
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    businessHours: {
      [key: string]: {
        open: string
        close: string
        isOpen: boolean
      }
    }
    paymentMethods: string[]
    amenities: string[]
    priceRange: "$" | "$$" | "$$$" | "$$$$"
    capacity?: number
    foundedYear?: number
    specialties: string[]
  }
  isOwner?: boolean
}

const dayNames = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
}

const priceRangeLabels = {
  $: "Budget-friendly",
  $$: "Moderate",
  $$$: "Expensive",
  $$$$: "Very Expensive",
}

export function BusinessInfo({ business, isOwner = false }: BusinessInfoProps) {
  const [showAllHours, setShowAllHours] = useState(false)

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getCurrentDayStatus = () => {
    const today = new Date().toLocaleLowerCase().slice(0, 3) + "day"
    const todayHours = business.businessHours[today]

    if (!todayHours || !todayHours.isOpen) {
      return { status: "Closed", color: "text-red-500" }
    }

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    if (currentTime >= todayHours.open && currentTime <= todayHours.close) {
      return { status: "Open Now", color: "text-green-500" }
    }

    return { status: "Closed", color: "text-red-500" }
  }

  const dayStatus = getCurrentDayStatus()

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {business.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                {business.phone}
              </a>
            </div>
          )}

          {business.email && (
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                {business.email}
              </a>
            </div>
          )}

          {business.website && (
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500" />
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {business.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}

          {/* Social Media */}
          <div className="flex gap-2 pt-2">
            {business.socialMedia.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a href={business.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
            )}
            {business.socialMedia.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={business.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
            )}
            {business.socialMedia.facebook && (
              <Button variant="outline" size="sm" asChild>
                <a href={business.socialMedia.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location & Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location & Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="space-y-1">
            <div className="font-medium">{business.address.street}</div>
            <div className="text-gray-600">
              {business.address.city}, {business.address.state} {business.address.zipCode}
            </div>
            <div className="text-gray-600">{business.address.country}</div>
          </div>

          <Separator />

          {/* Current Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={`font-medium ${dayStatus.color}`}>{dayStatus.status}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowAllHours(!showAllHours)}>
              {showAllHours ? "Hide Hours" : "Show All Hours"}
            </Button>
          </div>

          {/* Business Hours */}
          {showAllHours && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {Object.entries(business.businessHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center text-sm">
                  <span className="capitalize font-medium">{dayNames[day as keyof typeof dayNames]}</span>
                  <span className={hours.isOpen ? "text-gray-600" : "text-red-500"}>
                    {hours.isOpen ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : "Closed"}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price Range */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Price Range</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{business.priceRange}</span>
              <span className="text-sm text-gray-500">{priceRangeLabels[business.priceRange]}</span>
            </div>
          </div>

          {/* Capacity */}
          {business.capacity && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Capacity</span>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{business.capacity} people</span>
              </div>
            </div>
          )}

          {/* Founded Year */}
          {business.foundedYear && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Founded</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{business.foundedYear}</span>
              </div>
            </div>
          )}

          <Separator />

          {/* Payment Methods */}
          {business.paymentMethods.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Payment Methods</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {business.paymentMethods.map((method) => (
                  <Badge key={method} variant="secondary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specialties */}
          {business.specialties.length > 0 && (
            <div>
              <div className="font-medium mb-2">Specialties</div>
              <div className="flex flex-wrap gap-2">
                {business.specialties.map((specialty) => (
                  <Badge key={specialty} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {business.amenities.length > 0 && (
            <div>
              <div className="font-medium mb-2">Amenities</div>
              <div className="flex flex-wrap gap-2">
                {business.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
