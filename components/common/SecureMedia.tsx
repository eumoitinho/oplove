"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { SecurityWatermark } from "./SecurityWatermark"
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SecureMediaProps {
  src: string
  alt?: string
  type: "image" | "video"
  width?: number
  height?: number
  className?: string
  aspectRatio?: "square" | "video" | "auto"
  autoPlay?: boolean
  controls?: boolean
  priority?: boolean
}

export function SecureMedia({
  src,
  alt = "",
  type,
  width,
  height,
  className = "",
  aspectRatio = "auto",
  autoPlay = false,
  controls = true,
  priority = false
}: SecureMediaProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Prevent right-click, drag, and selection
  const preventActions = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  // Prevent keyboard shortcuts
  const preventKeyboard = (e: React.KeyboardEvent) => {
    // Prevent common screenshot/save shortcuts
    if (
      (e.ctrlKey && (e.key === 's' || e.key === 'S')) || // Ctrl+S
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || // Ctrl+Shift+I
      (e.key === 'F12') || // F12
      (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || // Ctrl+Shift+C
      (e.ctrlKey && (e.key === 'u' || e.key === 'U')) // Ctrl+U
    ) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "video":
        return "aspect-video"
      default:
        return ""
    }
  }

  // Anti-debugging measures
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160
      setInterval(() => {
        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          console.clear()
          console.log('%cAcesso negado!', 'color: red; font-size: 50px; font-weight: bold;')
          console.log('%cEste conteúdo é protegido por direitos autorais.', 'color: red; font-size: 16px;')
        }
      }, 500)
    }

    detectDevTools()

    // Disable drag and drop
    const preventDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('dragover', preventDrop)
    document.addEventListener('drop', preventDrop)

    return () => {
      document.removeEventListener('dragover', preventDrop)
      document.removeEventListener('drop', preventDrop)
    }
  }, [])

  if (type === "image") {
    return (
      <div
        ref={containerRef}
        className={`secure-media secure-content relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${getAspectRatioClass()} ${className}`}
        onContextMenu={preventActions}
        onDragStart={preventActions}
        onDrag={preventActions}
        onDragEnd={preventActions}
        onKeyDown={preventKeyboard}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitUserDrag: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        {/* Secure Image */}
        <Image
          src={src}
          alt={alt}
          fill={!width && !height}
          width={width}
          height={height}
          className="secure-media object-cover select-none"
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          onContextMenu={preventActions}
          onDragStart={preventActions}
          draggable={false}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitUserDrag: 'none',
            pointerEvents: 'none'
          }}
        />

        {/* Security Watermark */}
        <div className="security-watermark">
          <SecurityWatermark />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
            <p className="text-sm">Erro ao carregar imagem</p>
          </div>
        )}

        {/* Anti-screenshot overlay */}
        <div className="anti-screenshot absolute inset-0 pointer-events-none" />
      </div>
    )
  }

  if (type === "video") {
    return (
      <div
        ref={containerRef}
        className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${getAspectRatioClass()} ${className}`}
        onContextMenu={preventActions}
        onDragStart={preventActions}
        onKeyDown={preventKeyboard}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {/* Secure Video */}
        <video
          ref={videoRef}
          src={src}
          className="secure-media w-full h-full object-cover select-none"
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          onContextMenu={preventActions}
          onDragStart={preventActions}
          draggable={false}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: controls ? 'auto' : 'none'
          }}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlaybook
        />

        {/* Security Watermark */}
        <div className="security-watermark">
          <SecurityWatermark />
        </div>

        {/* Custom Video Controls */}
        {controls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 p-2"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500">
            <p className="text-sm">Erro ao carregar vídeo</p>
          </div>
        )}

        {/* Anti-screenshot overlay for video */}
        <div className="anti-screenshot absolute inset-0 pointer-events-none" />
      </div>
    )
  }

  return null
}