"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Download, Share2, Maximize2 } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { SecureMedia } from "./SecureMedia"
import { SecurityWatermark } from "./SecurityWatermark"
import { Button } from "@/components/ui/button"

interface MediaViewerProps {
  mediaUrls: string[]
  mediaTypes: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  postAuthor?: {
    name: string
    username: string
    avatar_url?: string
  }
}

export function MediaViewer({
  mediaUrls,
  mediaTypes,
  initialIndex = 0,
  isOpen,
  onClose,
  postAuthor
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Debug log
  useEffect(() => {
    if (isOpen) {
      console.log('[MediaViewer] Opening with:', {
        currentUrl: mediaUrls[currentIndex],
        currentType: mediaTypes[currentIndex],
        allUrls: mediaUrls,
        allTypes: mediaTypes
      })
    }
  }, [isOpen, currentIndex, mediaUrls, mediaTypes])

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          handlePrevious()
          break
        case "ArrowRight":
          handleNext()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, currentIndex])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1))
  }, [mediaUrls.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0))
  }, [mediaUrls.length])

  const handleDownload = async () => {
    const url = mediaUrls[currentIndex]
    const type = mediaTypes[currentIndex]
    
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `openlove-media-${Date.now()}.${type.includes("video") ? "mp4" : "jpg"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error downloading media:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "OpenLove Media",
          text: `Check out this post by ${postAuthor?.name || "a user"} on OpenLove`,
          url: window.location.href
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!mounted) return null

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent"
          >
            <div className="flex items-center gap-3">
              {postAuthor && (
                <div className="flex items-center gap-2 text-white">
                  {postAuthor.avatar_url && (
                    <img
                      src={postAuthor.avatar_url}
                      alt={postAuthor.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium">{postAuthor.name}</p>
                    <p className="text-xs opacity-75">@{postAuthor.username}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare()
                }}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="text-white hover:bg-white/20"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Media Container */}
          <div
            className="relative flex items-center justify-center w-full h-full px-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {mediaUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 text-white hover:bg-white/20 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Media Display */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[90vh]"
            >
              {(mediaTypes[currentIndex] === 'video' || mediaTypes[currentIndex]?.includes("video")) ? (
                <div className="relative flex items-center justify-center" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                  <video
                    src={mediaUrls[currentIndex]}
                    controls
                    autoPlay
                    className="max-w-full max-h-[90vh] rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Security Watermark Overlay */}
                  <SecurityWatermark className="z-20" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center" style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
                  <Image
                    src={mediaUrls[currentIndex]}
                    alt="Media"
                    width={1920}
                    height={1080}
                    className="object-contain rounded-lg"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '90vh',
                      width: 'auto',
                      height: 'auto'
                    }}
                    priority
                    quality={95}
                    onClick={(e) => e.stopPropagation()}
                    onError={() => {
                      console.error('[MediaViewer] Image failed to load:', mediaUrls[currentIndex])
                    }}
                  />
                  {/* Security Watermark Overlay */}
                  <SecurityWatermark className="z-20" />
                </div>
              )}
            </motion.div>

            {/* Next Button */}
            {mediaUrls.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 text-white hover:bg-white/20 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Media Counter */}
          {mediaUrls.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-4 py-2"
            >
              <p className="text-white text-sm">
                {currentIndex + 1} / {mediaUrls.length}
              </p>
            </motion.div>
          )}

          {/* Thumbnail Strip */}
          {mediaUrls.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg"
            >
              {mediaUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "relative w-16 h-16 rounded overflow-hidden transition-all",
                    currentIndex === index
                      ? "ring-2 ring-white scale-110"
                      : "opacity-50 hover:opacity-100"
                  )}
                >
                  {(mediaTypes[index] === 'video' || mediaTypes[index]?.includes("video")) ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <Image
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}