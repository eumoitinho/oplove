"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, Download, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  duration?: number
  className?: string
  showDownload?: boolean
  showMenu?: boolean
  onPlay?: () => void
  onPause?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function AudioPlayer({
  src,
  title,
  artist,
  duration,
  className,
  showDownload = false,
  showMenu = false,
  onPlay,
  onPause,
  onTimeUpdate
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  // Inicializar audio element
  useEffect(() => {
    const audio = new Audio(src)
    audioRef.current = audio

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration)
      setIsLoading(false)
    }
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate?.(audio.currentTime)
    }
    
    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }
    
    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }
    
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      onPause?.()
    }
    
    const handleError = () => {
      setError('Erro ao carregar áudio')
      setIsLoading(false)
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      
      audio.pause()
      audio.src = ''
    }
  }, [src, onPlay, onPause, onTimeUpdate])

  // Controlar volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        await audioRef.current.play()
      }
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err)
      setError('Erro ao reproduzir áudio')
    }
  }

  // Buscar posição no áudio
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progress = clickX / rect.width
    const newTime = progress * totalDuration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Download áudio
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = title || 'audio.webm'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Formatar tempo
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Calcular progresso
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  if (error) {
    return (
      <div className={cn("p-4 bg-red-50 dark:bg-red-900/20 rounded-lg", className)}>
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border",
      className
    )}>
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        {/* Progress and Info */}
        <div className="flex-1 min-w-0">
          {/* Title and Artist */}
          {(title || artist) && (
            <div className="mb-2">
              {title && (
                <div className="text-sm font-medium truncate">{title}</div>
              )}
              {artist && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {artist}
                </div>
              )}
            </div>
          )}

          {/* Progress Bar */}
          <div 
            ref={progressRef}
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer mb-2"
            onClick={handleProgressClick}
          >
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className="w-8 h-8"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          {/* Volume Slider - Hidden on mobile */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="hidden sm:block w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {showDownload && (
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="icon"
              className="w-8 h-8"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}

          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}