"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Volume2, VolumeX, Maximize2, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  type: "image" | "video"
  url: string
  thumbnail?: string
  alt?: string
}

interface PostMediaProps {
  media: MediaItem[]
  className?: string
}

export function PostMedia({ media, className }: PostMediaProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState<Record<string, boolean>>({})
  const [isVideoMuted, setIsVideoMuted] = useState<Record<string, boolean>>({})

  const handleVideoPlay = (mediaId: string) => {
    setIsVideoPlaying((prev) => ({ ...prev, [mediaId]: true }))
  }

  const handleVideoPause = (mediaId: string) => {
    setIsVideoPlaying((prev) => ({ ...prev, [mediaId]: false }))
  }

  const toggleMute = (mediaId: string) => {
    setIsVideoMuted((prev) => ({ ...prev, [mediaId]: !prev[mediaId] }))
  }

  const openLightbox = (mediaItem: MediaItem) => {
    setSelectedMedia(mediaItem)
  }

  const closeLightbox = () => {
    setSelectedMedia(null)
  }

  const getGridClass = (count: number) => {
    switch (count) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-2"
      case 3:
        return "grid-cols-2"
      case 4:
        return "grid-cols-2"
      default:
        return "grid-cols-2"
    }
  }

  const getItemClass = (index: number, total: number) => {
    if (total === 3 && index === 0) return "col-span-2"
    if (total === 5 && index < 2) return "col-span-1"
    return ""
  }

  return (
    <>
      <div className={cn("w-full", className)}>
        <div className={cn("grid gap-2 rounded-lg overflow-hidden", getGridClass(media.length))}>
          {media.slice(0, 4).map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group",
                getItemClass(index, media.length),
                media.length === 1 && "aspect-video",
                index === 3 && media.length > 4 && "relative",
              )}
              onClick={() => openLightbox(item)}
            >
              {item.type === "image" ? (
                <>
                  <Image
                    src={item.url || "/placeholder.svg"}
                    alt={item.alt || `Imagem ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Overlay for remaining images */}
                  {index === 3 && media.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">+{media.length - 4}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    poster={item.thumbnail}
                    className="w-full h-full object-cover"
                    muted={isVideoMuted[item.id] !== false}
                    onPlay={() => handleVideoPlay(item.id)}
                    onPause={() => handleVideoPause(item.id)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    {!isVideoPlaying[item.id] && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          const video = e.currentTarget.parentElement?.parentElement?.querySelector("video")
                          video?.play()
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Mute Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMute(item.id)
                    }}
                  >
                    {isVideoMuted[item.id] !== false ? (
                      <VolumeX className="h-3 w-3" />
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>

                  {/* Expand Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      openLightbox(item)
                    }}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>

              {selectedMedia.type === "image" ? (
                <Image
                  src={selectedMedia.url || "/placeholder.svg"}
                  alt={selectedMedia.alt || "Imagem expandida"}
                  width={800}
                  height={600}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-full rounded-lg" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
