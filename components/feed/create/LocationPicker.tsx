"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Search, X, Navigation, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Location {
  id: string
  name: string
  address: string
  coordinates: [number, number]
  type: "city" | "venue" | "custom"
}

interface LocationPickerProps {
  onSelect: (location: Location | null) => void
  selectedLocation?: Location | null
  className?: string
}

// Mock locations for demo
const mockLocations: Location[] = [
  {
    id: "1",
    name: "São Paulo, SP",
    address: "São Paulo, Brasil",
    coordinates: [-23.5505, -46.6333],
    type: "city",
  },
  {
    id: "2",
    name: "Rio de Janeiro, RJ",
    address: "Rio de Janeiro, Brasil",
    coordinates: [-22.9068, -43.1729],
    type: "city",
  },
  {
    id: "3",
    name: "Shopping Ibirapuera",
    address: "Av. Ibirapuera, 3103 - São Paulo, SP",
    coordinates: [-23.5955, -46.6522],
    type: "venue",
  },
  {
    id: "4",
    name: "Parque Villa-Lobos",
    address: "Av. Prof. Fonseca Rodrigues, 2001 - São Paulo, SP",
    coordinates: [-23.5447, -46.7208],
    type: "venue",
  },
]

export function LocationPicker({ onSelect, selectedLocation, className }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(mockLocations)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  // Filter locations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocations(mockLocations)
      return
    }

    const filtered = mockLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    setFilteredLocations(filtered)
  }, [searchQuery])

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador")
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // In a real app, you would reverse geocode these coordinates
          // For demo purposes, we'll create a mock location
          const currentLocation: Location = {
            id: "current",
            name: "Localização Atual",
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            coordinates: [latitude, longitude],
            type: "custom",
          }

          setUserLocation(currentLocation)
          onSelect(currentLocation)
          setIsOpen(false)
        } catch (error) {
          console.error("Error getting location details:", error)
        } finally {
          setIsLoadingLocation(false)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setIsLoadingLocation(false)
        alert("Não foi possível obter sua localização")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const handleLocationSelect = (location: Location) => {
    onSelect(location)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleRemoveLocation = () => {
    onSelect(null)
    setUserLocation(null)
  }

  const getLocationIcon = (type: Location["type"]) => {
    switch (type) {
      case "city":
        return Globe
      case "venue":
        return MapPin
      case "custom":
        return Navigation
      default:
        return MapPin
    }
  }

  return (
    <div className={cn("relative", className)}>
      {/* Selected Location Display */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg mb-2"
        >
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">{selectedLocation.name}</p>
              <p className="text-sm text-purple-600">{selectedLocation.address}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveLocation}
            className="text-purple-600 hover:text-purple-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Location Picker Button */}
      {!selectedLocation && (
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full justify-start text-gray-600 border-dashed"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Adicionar localização
        </Button>
      )}

      {/* Location Picker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Escolher Localização</span>
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar localização..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Current Location Button */}
                  <Button
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="w-full justify-start bg-transparent"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isLoadingLocation ? "Obtendo localização..." : "Usar localização atual"}
                  </Button>

                  {/* Location List */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location) => {
                        const IconComponent = getLocationIcon(location.type)
                        return (
                          <Button
                            key={location.id}
                            variant="ghost"
                            onClick={() => handleLocationSelect(location)}
                            className="w-full justify-start h-auto p-3 text-left"
                          >
                            <div className="flex items-start space-x-3">
                              <IconComponent className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{location.name}</p>
                                <p className="text-sm text-gray-500 truncate">{location.address}</p>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {location.type === "city"
                                    ? "Cidade"
                                    : location.type === "venue"
                                      ? "Local"
                                      : "Personalizado"}
                                </Badge>
                              </div>
                            </div>
                          </Button>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma localização encontrada</p>
                        <p className="text-sm">Tente buscar por uma cidade ou local</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
