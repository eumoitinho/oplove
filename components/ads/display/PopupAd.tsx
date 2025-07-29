"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Flag, Info, Clock } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAdTracker } from "../tracking/AdTracker"
import { cn } from "@/lib/utils"

interface PopupAdContent {
  id: string
  title: string
  description: string
  image: string
  cta: string
  sponsor: string
  url?: string
  category?: string
  dismissible?: boolean
  autoCloseDelay?: number // in seconds
  size?: "small" | "medium" | "large"
}

interface PopupAdProps {
  ad: PopupAdContent
  isOpen: boolean
  onClose: () => void
  onReport?: () => void
  className?: string
}

export function PopupAd({ ad, isOpen, onClose, onReport, className }: PopupAdProps) {
  const [countdown, setCountdown] = useState(ad.autoCloseDelay || 0)
  const [showOptions, setShowOptions] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const { trackImpression, trackClick, trackEngagement } = useAdTracker(ad.id)

  // Track impression when popup opens
  useEffect(() => {
    if (isOpen && !hasInteracted) {
      trackImpression({
        adId: ad.id,
        placement: "popup",
        variant: ad.size || "medium",
        viewportPercentage: 100,
      })
      setHasInteracted(true)
    }
  }, [isOpen, hasInteracted, trackImpression, ad.id, ad.size])

  // Auto-close countdown
  useEffect(() => {
    if (!isOpen || !ad.autoCloseDelay) return

    setCountdown(ad.autoCloseDelay)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, ad.autoCloseDelay, onClose])

  const handleClick = () => {
    trackClick({
      adId: ad.id,
      placement: "popup",
      targetUrl: ad.url,
    })

    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleClose = () => {
    trackEngagement({
      adId: ad.id,
      action: "close",
      placement: "popup",
    })
    onClose()
  }

  const handleReport = () => {
    onReport?.()
    trackEngagement({
      adId: ad.id,
      action: "report",
      placement: "popup",
    })
  }

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-lg",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={ad.dismissible ? handleClose : undefined}
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn("relative w-full", sizeClasses[ad.size || "medium"], className)}
          >
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden shadow-2xl">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-purple-100 dark:border-purple-800">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Anúncio
                    </Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ad.sponsor}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Auto-close countdown */}
                    {countdown > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{countdown}s</span>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptions(!showOptions)}
                      className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                    >
                      <Info className="h-3 w-3" />
                    </Button>

                    {ad.dismissible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Options Menu */}
                <AnimatePresence>
                  {showOptions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border-b border-purple-100 dark:border-purple-800"
                    >
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReport}
                          className="h-auto p-0 text-gray-600 hover:text-red-600"
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Reportar anúncio
                        </Button>
                        <span>•</span>
                        <span>Por que estou vendo isso?</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ad Content */}
                <div className="cursor-pointer" onClick={handleClick}>
                  {/* Ad Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={ad.image || "/placeholder.svg"}
                      alt={ad.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                        <ExternalLink className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Ad Text */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight">{ad.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{ad.description}</p>
                    </div>

                    {ad.category && (
                      <Badge variant="outline" className="text-xs">
                        {ad.category}
                      </Badge>
                    )}

                    {/* CTA Button */}
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-200 hover:shadow-lg hover:transform hover:scale-[1.02]">
                      {ad.cta}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Auto-close progress bar */}
                {countdown > 0 && ad.autoCloseDelay && (
                  <div className="px-4 pb-2">
                    <Progress value={((ad.autoCloseDelay - countdown) / ad.autoCloseDelay) * 100} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
