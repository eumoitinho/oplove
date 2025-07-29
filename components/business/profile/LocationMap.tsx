"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Share2, Phone, WaypointsIcon as Directions } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface LocationMapProps {
  business: {
    name: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    coordinates: {
      lat: number
      lng: number
    }
    phone?: string
  }
  showDirections?: boolean
}

export function LocationMap({ business, showDirections = true }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zipCode}, ${business.address.country}`

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(userCoords)

          // Calculate distance
          const distance = calculateDistance(
            userCoords.lat,
            userCoords.lng,
            business.coordinates.lat,
            business.coordinates.lng,
          )
          setDistance(distance)
        },
        (error) => {
          console.log("Location access denied:", error)
        },
      )
    }
  }, [business.coordinates])

  // Initialize map (placeholder for actual map implementation)
  useEffect(() => {
    if (mapRef.current) {
      // This would be where you initialize your map library (Mapbox, Google Maps, etc.)
      // For now, we'll simulate loading
      setTimeout(() => setMapLoaded(true), 1000)
    }
  }, [])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`
    } else {
      return `${distance.toFixed(1)} mi`
    }
  }

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
    window.open(url, "_blank")
  }

  const handleShareLocation = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name}`,
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
        })
      } catch (error) {
        console.log("Share failed:", error)
      }
    } else {
      // Fallback to copying to clipboard
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
          {distance && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {distance} away
            </Badge>
          )}
        </div>
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

        {/* Map Container */}
        <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div
              ref={mapRef}
              className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
            >
              {/* Placeholder for actual map */}
              <div className="text-center">
                <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                <div className="font-medium">{business.name}</div>
                <div className="text-sm text-gray-600">Interactive Map</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          {showDirections && (
            <Button
              onClick={handleGetDirections}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Directions className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          )}

          {business.phone && (
            <Button variant="outline" asChild>
              <a href={`tel:${business.phone}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </a>
            </Button>
          )}

          <Button variant="outline" onClick={handleShareLocation}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Nearby Landmarks (if available) */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Nearby</div>
          <div className="space-y-1 text-sm text-gray-600">
            <div>• 0.2 mi from Downtown Plaza</div>
            <div>• 0.5 mi from Metro Station</div>
            <div>• 1.1 mi from City Park</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
