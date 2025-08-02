"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"

interface SecurityWatermarkProps {
  className?: string
  style?: React.CSSProperties
}

export function SecurityWatermark({ className = "", style = {} }: SecurityWatermarkProps) {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userLocation, setUserLocation] = useState<string>("Localização indisponível")

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Get user location
  useEffect(() => {
    if (user?.location) {
      setUserLocation(user.location)
    } else {
      // Try to get location from browser if user hasn't set it
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get city name
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=pt`
              )
              const data = await response.json()
              setUserLocation(data.city || data.locality || "Localização indisponível")
            } catch (error) {
              console.error("Error getting location:", error)
              setUserLocation("Localização indisponível")
            }
          },
          (error) => {
            console.error("Geolocation error:", error)
            setUserLocation("Localização indisponível")
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        )
      }
    }
  }, [user?.location])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // Separate watermark components for better distribution
  const username = `@${user?.username || 'anonimo'}`
  const time = formatTime(currentTime)
  const date = formatDate(currentTime)
  const location = userLocation

  return (
    <>
      {/* Main watermark container */}
      <div 
        className={`absolute inset-0 pointer-events-none select-none ${className}`}
        style={{
          ...style,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          overflow: 'hidden'
        }}
      >
        {/* Horizontal watermark lines with different content positioning */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`horizontal-${i}`}
            className="absolute w-full flex items-center justify-between whitespace-nowrap font-mono text-xs"
            style={{
              top: `${5 + (i * 10)}%`,
              left: 0,
              opacity: 0.08,
              color: 'white',
              textShadow: '0 0 1px rgba(0,0,0,0.5)',
              filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.5))',
              zIndex: 10,
              paddingLeft: `${(i * 7) % 30}%`,
              paddingRight: `${((9 - i) * 5) % 25}%`
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Vary content order based on row */}
            {i % 4 === 0 && (
              <>
                <span>{username}</span>
                <span>{time}</span>
                <span>{date}</span>
                <span>{location}</span>
              </>
            )}
            {i % 4 === 1 && (
              <>
                <span>{time}</span>
                <span>{location}</span>
                <span>{username}</span>
                <span>{date}</span>
              </>
            )}
            {i % 4 === 2 && (
              <>
                <span>{date}</span>
                <span>{username}</span>
                <span>{location}</span>
                <span>{time}</span>
              </>
            )}
            {i % 4 === 3 && (
              <>
                <span>{location}</span>
                <span>{date}</span>
                <span>{time}</span>
                <span>{username}</span>
              </>
            )}
          </div>
        ))}

      </div>

      {/* Anti-screenshot overlay - invisible but detectable */}
      <div 
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.001) 2px, rgba(255,255,255,0.001) 4px)',
          zIndex: 12,
          mixBlendMode: 'multiply'
        }}
      />
    </>
  )
}