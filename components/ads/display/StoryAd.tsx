"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X, Flag, Info, Play, Pause, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAdTracker } from "../tracking/AdTracker"
import { cn } from "@/lib/utils"

interface StoryAdContent {
  id: string
  title: string
  description: string
  media: {
    type: "image" | "video"
    url: string
    thumbnail?: string
  }
  cta: string
  sponsor: {
    name: string
    avatar: string
    verified: boolean
  }
  url?: string
  duration?: number // in seconds
}

interface StoryAdProps {
  ad: StoryAdContent
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  autoPlay?: boolean
  className?: string
}

export function StoryAd({ ad, onClose, onNext, onPrevious, autoPlay = true, className }: StoryAdProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showCTA, setShowCTA] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<NodeJS.Timeout>()

  const duration = ad.duration || 15 // Default 15 seconds
  const { trackImpression, trackClick, trackEngagement } = useAdTracker(ad.id)

  // Track impression immediately for full-screen ads
  useEffect(() => {
    trackImpression({
      adId: ad.id,
      placement: "story",
      variant: ad.media.type,
      viewportPercentage: 100,
    })
  }, [trackImpression, ad.id, ad.media.type])

  // Progress timer
  useEffect(() => {
    if (!isPlaying) return

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / duration
        if (newProgress >= 100) {
          setShowCTA(true)
          setIsPlaying(false)
          return 100
        }
        return newProgress
      })
    }, 1000)

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current)
      }
    }
  }, [isPlaying, duration])

  // Video controls
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    if (isPlaying) {
      video.play()
    } else {
      video.pause()
    }
  }, [isPlaying])

  const handleClick = () => {
    trackClick({
      adId: ad.id,
      placement: "story",
      targetUrl: ad.url,
    })

    if (ad.url) {
      window.open(ad.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleReport = () => {
    trackEngagement({
      adId: ad.id,
      action: "report",
      placement: "story",
    })
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    trackEngagement({
      adId: ad.id,
      action: isPlaying ? "pause" : "play",
      placement: "story",
    })
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("fixed inset-0 z-50 bg-black flex items-center justify-center", className)}
    >
      {/* Background Media */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {ad.media.type === "video" ? (
          <video
            ref={videoRef}
            src={ad.media.url}
            poster={ad.media.thumbnail}
            className="w-full h-full object-cover"
            muted={isMuted}
            loop
            playsInline
          />
        ) : (
          <Image src={ad.media.url || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-4">
          <Progress value={progress} className="h-1 bg-white/30" />
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={ad.sponsor.avatar || "/placeholder.svg"}
                alt={ad.sponsor.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-white font-semibold text-sm">{ad.sponsor.name}</span>
                {ad.sponsor.verified && (
                  <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-1">
                    ✓
                  </Badge>
                )}
              </div>
              <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                Patrocinado
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOptions(!showOptions)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <Info className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Options Menu */}
        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 right-4 bg-black/80 rounded-lg p-3 backdrop-blur-sm"
            >
              <div className="flex flex-col space-y-2 text-sm text-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReport}
                  className="justify-start text-white hover:bg-white/20"
                >
                  <Flag className="h-3 w-3 mr-2" />
                  Reportar anúncio
                </Button>
                <div className="text-xs text-gray-300">Por que estou vendo isso?</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Controls */}
        <div className="absolute bottom-32 left-4 flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20 h-10 w-10 p-0">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>

          {ad.media.type === "video" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 h-10 w-10 p-0"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="absolute bottom-4 left-4 right-4 space-y-4">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-2">{ad.title}</h2>
            <p className="text-sm text-gray-200 line-clamp-3">{ad.description}</p>
          </div>

          {/* CTA Button */}
          <AnimatePresence>
            {(showCTA || progress > 50) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Button
                  onClick={handleClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                >
                  {ad.cta}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Areas */}
        {onPrevious && (
          <button onClick={onPrevious} className="absolute left-0 top-0 w-1/3 h-full z-10" aria-label="Anterior" />
        )}

        {onNext && (
          <button onClick={onNext} className="absolute right-0 top-0 w-1/3 h-full z-10" aria-label="Próximo" />
        )}
      </div>
    </motion.div>
  )
}
