"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Flag, Info, Heart, MessageCircle, Share2 } from "lucide-react"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAdTracker } from "../tracking/AdTracker"
import { cn } from "@/lib/utils"

interface AdContent {
  id: string
  title: string
  description: string
  image: string
  cta: string
  sponsor: {
    name: string
    avatar: string
    verified: boolean
  }
  url?: string
  category?: string
  price?: string
  engagement?: {
    likes: number
    comments: number
    shares: number
  }
}

interface TimelineAdProps {
  ad: AdContent
  onClose?: () => void
  onReport?: () => void
  className?: string
  variant?: "native" | "sponsored" | "promoted"
}

export function TimelineAd({ ad, onClose, onReport, className, variant = "native" }: TimelineAdProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const adRef = useRef<HTMLDivElement>(null)

  const { ref: inViewRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const { trackImpression, trackClick, trackEngagement } = useAdTracker(ad.id)

  // Track impression when ad is 50% visible for 1 second
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (inView && !hasInteracted) {
      timer = setTimeout(() => {
        trackImpression({
          adId: ad.id,
          placement: "timeline",
          variant,
          viewportPercentage: 50,
        })
        setHasInteracted(true)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [inView, hasInteracted, trackImpression, ad.id, variant])

  const handleClick = () => {
    trackClick({
      adId: ad.id,
      placement: "timeline",
      targetUrl: ad.url,
    })

    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleReport = () => {
    onReport?.()
    trackEngagement({
      adId: ad.id,
      action: "report",
      placement: "timeline",
    })
  }

  const handleLike = () => {
    trackEngagement({
      adId: ad.id,
      action: "like",
      placement: "timeline",
    })
  }

  const handleComment = () => {
    trackEngagement({
      adId: ad.id,
      action: "comment",
      placement: "timeline",
    })
  }

  const handleShare = () => {
    trackEngagement({
      adId: ad.id,
      action: "share",
      placement: "timeline",
    })
  }

  // Native post-style ad
  if (variant === "native") {
    return (
      <motion.div
        ref={(node) => {
          adRef.current = node
          inViewRef(node)
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("w-full", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ad.sponsor.avatar || "/placeholder.svg"} alt={ad.sponsor.name} />
                  <AvatarFallback>{ad.sponsor.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{ad.sponsor.name}</span>
                    {ad.sponsor.verified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-1">
                        ✓
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      Patrocinado
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">há 2 horas</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>

            {/* Ad Options */}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
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

            {/* Post Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{ad.description}</p>
              {ad.category && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    #{ad.category}
                  </Badge>
                </div>
              )}
            </div>

            {/* Ad Image */}
            <div className="relative cursor-pointer" onClick={handleClick}>
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={ad.image || "/placeholder.svg"}
                  alt={ad.title}
                  fill
                  className={cn("object-cover transition-transform duration-300", isHovered && "scale-105")}
                />

                {/* Overlay on hover */}
                {isHovered && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3">
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                )}

                {/* Price tag if available */}
                {ad.price && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-600 text-white">{ad.price}</Badge>
                  </div>
                )}
              </div>

              {/* CTA Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">{ad.title}</h3>
                <Button
                  className={cn(
                    "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200",
                    isHovered && "shadow-lg transform scale-[1.02]",
                  )}
                >
                  {ad.cta}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">{ad.engagement?.likes || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComment}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{ad.engagement?.comments || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">{ad.engagement?.shares || 0}</span>
                </Button>
              </div>

              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Sponsored card-style ad
  return (
    <motion.div
      ref={(node) => {
        adRef.current = node
        inViewRef(node)
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        <CardContent className="p-0">
          {/* Sponsored Header */}
          <div className="flex items-center justify-between p-3 border-b border-purple-100 dark:border-purple-800">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                <Info className="h-3 w-3 mr-1" />
                Patrocinado
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">por {ad.sponsor.name}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
              >
                <Info className="h-3 w-3" />
              </Button>

              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="cursor-pointer" onClick={handleClick}>
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={ad.image || "/placeholder.svg"}
                alt={ad.title}
                fill
                className={cn("object-cover transition-transform duration-300", isHovered && "scale-105")}
              />

              {isHovered && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2">
                    <ExternalLink className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">{ad.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{ad.description}</p>
              </div>

              {ad.category && (
                <Badge variant="outline" className="text-xs">
                  {ad.category}
                </Badge>
              )}

              <Button
                className={cn(
                  "w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-200",
                  isHovered && "shadow-lg transform scale-[1.02]",
                )}
              >
                {ad.cta}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
