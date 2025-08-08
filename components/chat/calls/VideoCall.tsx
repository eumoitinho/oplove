"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VideoOff, Phone, PhoneOff, Monitor, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CallControls } from "./CallControls"
import type { User } from "@/types/database.types"

interface VideoCallProps {
  participants: User[]
  isIncoming?: boolean
  onAccept?: () => void
  onDecline?: () => void
  onEnd: () => void
  onToggleVideo: () => void
  onToggleMic: () => void
  isVideoEnabled: boolean
  isMicEnabled: boolean
  callDuration?: number
}

export function VideoCall({
  participants,
  isIncoming = false,
  onAccept,
  onDecline,
  onEnd,
  onToggleVideo,
  onToggleMic,
  isVideoEnabled,
  isMicEnabled,
  callDuration = 0,
}: VideoCallProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Auto-hide controls after 3 seconds of inactivity
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      setShowControls(true)
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
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

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
      setIsScreenSharing(true)
      // Handle screen share stream
    } catch (error) {
      console.error("Error starting screen share:", error)
    }
  }

  if (isIncoming) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center z-50"
      >
        <div className="text-center text-white">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="mb-8"
          >
            <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white">
              <AvatarImage src={participants[0]?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-white text-purple-900 text-4xl">
                {participants[0]?.full_name?.charAt(0) || participants[0]?.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">{participants[0]?.full_name || participants[0]?.username}</h2>
          <p className="text-purple-200 mb-8">Chamada de vídeo recebida</p>

          <div className="flex items-center justify-center space-x-8">
            <Button
              onClick={onDecline}
              size="lg"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 border-4 border-white"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={onAccept}
              size="lg"
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 border-4 border-white"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onMouseMove={() => setShowControls(true)}
    >
      {/* Video Grid */}
      <div className="flex-1 relative">
        {participants.length === 1 ? (
          // Single participant view
          <div className="h-full relative">
            <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={participants[0]?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-4xl">
                    {participants[0]?.full_name?.charAt(0) || participants[0]?.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        ) : (
          // Multiple participants grid
          <div className="grid grid-cols-2 gap-1 h-full">
            {participants.map((participant, index) => (
              <div key={participant.id} className="relative bg-gray-900">
                <video className="w-full h-full object-cover" autoPlay playsInline />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
                  <span className="text-white text-sm">{participant.full_name || participant.username}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Local video (Picture-in-Picture) */}
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
          className="absolute top-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white shadow-lg cursor-move"
        >
          <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-white" />
            </div>
          )}
        </motion.div>

        {/* Call info */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2"
            >
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{formatCallDuration(callDuration)}</span>
                </div>
                {isScreenSharing && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    <Monitor className="h-3 w-3 mr-1" />
                    Compartilhando
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participant info */}
        <AnimatePresence>
          {showControls && participants.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center text-white"
            >
              <h3 className="text-xl font-semibold mb-1">{participants[0]?.full_name || participants[0]?.username}</h3>
              <p className="text-sm text-gray-300">{!isMicEnabled && "Microfone desligado"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <CallControls
            onEnd={onEnd}
            onToggleVideo={onToggleVideo}
            onToggleMic={onToggleMic}
            isVideoEnabled={isVideoEnabled}
            isMicEnabled={isMicEnabled}
            onScreenShare={startScreenShare}
            isScreenSharing={isScreenSharing}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            onToggleChat={() => setShowChat(!showChat)}
            showChat={showChat}
          />
        )}
      </AnimatePresence>

      {/* Chat sidebar */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 shadow-lg"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Chat da chamada</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                  <Minimize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-gray-500 text-center">Chat durante a chamada em breve...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
