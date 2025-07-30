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

  const watermarkText = `@${user?.username || 'anonimo'} • ${formatTime(currentTime)} • ${formatDate(currentTime)} • ${userLocation}`

  return (
    <>
      {/* Main diagonal watermark */}
      <div 
        className={`absolute inset-0 pointer-events-none select-none ${className}`}
        style={{
          ...style,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {/* Diagonal watermarks - multiple layers for security */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`diagonal-${i}`}
            className="absolute whitespace-nowrap text-white/20 font-mono text-xs font-bold tracking-wide"
            style={{
              top: `${(i * 8) % 100}%`,
              left: `${(i * 12) % 100}%`,
              transform: 'rotate(-45deg)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
              zIndex: 10,
              mixBlendMode: 'difference'
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {watermarkText}
          </div>
        ))}

        {/* Straight horizontal watermarks */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`horizontal-${i}`}
            className="absolute whitespace-nowrap text-white/15 font-mono text-xs font-bold tracking-wide"
            style={{
              top: `${12 + (i * 12)}%`,
              left: '5%',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
              zIndex: 9,
              mixBlendMode: 'overlay'
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {watermarkText}
          </div>
        ))}

        {/* Corner watermarks for extra security */}
        <div
          className="absolute top-2 left-2 text-white/25 font-mono text-xs font-bold"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
            zIndex: 11
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {watermarkText}
        </div>

        <div
          className="absolute top-2 right-2 text-white/25 font-mono text-xs font-bold"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
            zIndex: 11
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {watermarkText}
        </div>

        <div
          className="absolute bottom-2 left-2 text-white/25 font-mono text-xs font-bold"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
            zIndex: 11
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {watermarkText}
        </div>

        <div
          className="absolute bottom-2 right-2 text-white/25 font-mono text-xs font-bold"
          style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.9)',
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.9))',
            zIndex: 11
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {watermarkText}
        </div>

        {/* Center watermark */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 font-mono text-sm font-bold"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
            filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))',
            zIndex: 11,
            mixBlendMode: 'difference'
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {watermarkText}
        </div>
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