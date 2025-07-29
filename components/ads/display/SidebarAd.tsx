"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Flag, Info, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAdTracker } from "../tracking/AdTracker"
import { cn } from "@/lib/utils"

interface SidebarAdContent {
  id: string
  title: string
  description: string
  image: string
  cta: string
  sponsor: string
  url?: string
  category?: string
  format: "banner" | "square" | "vertical"
}

interface SidebarAdProps {
  ads: SidebarAdContent[]
  rotationInterval?: number
  className?: string
  sticky?: boolean
}

export function SidebarAd({ ads, rotationInterval = 30000, className, sticky = true }: SidebarAdProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  const currentAd = ads[currentAdIndex]

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const { trackImpression, trackClick, trackEngagement } = useAdTracker(currentAd?.id)

  // Auto-rotate ads
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      setHasInteracted(false) // Reset for new ad
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [ads.length, rotationInterval, isHovered])

  // Track impression
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (inView && currentAd && !hasInteracted) {
      timer = setTimeout(() => {
        trackImpression({
          adId: currentAd.id,
          placement: "sidebar",
          variant: currentAd.format,
          viewportPercentage: 50,
        })
        setHasInteracted(true)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [inView, currentAd, hasInteracted, trackImpression])

  const handleClick = () => {
    if (!currentAd) return

    trackClick({
      adId: currentAd.id,
      placement: "sidebar",
      targetUrl: currentAd.url,
    })

    if (currentAd.url) {
      window.open(currentAd.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleReport = () => {
    if (!currentAd) return

    trackEngagement({
      adId: currentAd.id,
      action: "report",
      placement: "sidebar",
    })
  }

  const handleRefresh = () => {
    if (ads.length > 1) {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      setHasInteracted(false)
    }
  }

  if (!currentAd) return null

  return (
    <motion.div
      ref={(node) => {
        adRef.current = node
        inViewRef(node)
      }}
      className={cn("w-full", sticky && "sticky top-24", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        <CardContent className="p-0">
          {/* Ad Header */}
          <div className="flex items-center justify-between p-3 border-b border-purple-100 dark:border-purple-800">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                <Info className="h-3 w-3 mr-1" />
                Anúncio
              </Badge>
              <span className="text-xs text-gray-600 dark:text-gray-400">{currentAd.sponsor}</span>
            </div>

            <div className="flex items-center space-x-1">
              {ads.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                  title="Próximo anúncio"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
              >
                <Info className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Ad Options */}
          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-purple-100 dark:border-purple-800"
              >
                <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-400">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReport}
                    className="h-auto p-0 text-gray-600 hover:text-red-600"
                  >
                    <Flag className="h-3 w-3 mr-1" />
                    Reportar
                  </Button>
                  <span>•</span>
                  <span>Por que vejo isso?</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ad Content */}
          <div className="cursor-pointer" onClick={handleClick}>
            {/* Ad Image */}
            <div
              className={cn(
                "relative overflow-hidden",
                currentAd.format === "banner" && "aspect-[3/1]",
                currentAd.format === "square" && "aspect-square",
                currentAd.format === "vertical" && "aspect-[3/4]",
              )}
            >
              <Image
                src={currentAd.image || "/placeholder.svg"}
                alt={currentAd.title}
                fill
                className={cn("object-cover transition-transform duration-300", isHovered && "scale-105")}
              />

              {/* Hover overlay */}
              {isHovered && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Ad Text */}
            <div className="p-3 space-y-2">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
                {currentAd.title}
              </h4>

              <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{currentAd.description}</p>

              {currentAd.category && (
                <Badge variant="outline" className="text-xs">
                  {currentAd.category}
                </Badge>
              )}

              {/* CTA Button */}
              <Button
                size="sm"
                className={cn(
                  "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs transition-all duration-200",
                  isHovered && "shadow-md transform scale-[1.02]",
                )}
              >
                {currentAd.cta}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>

          {/* Ad Rotation Indicator */}
          {ads.length > 1 && (
            <div className="flex justify-center space-x-1 p-2 bg-white/50 dark:bg-gray-800/50">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentAdIndex(index)
                    setHasInteracted(false)
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentAdIndex ? "bg-purple-600" : "bg-gray-300 hover:bg-gray-400",
                  )}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
