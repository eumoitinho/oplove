"use client"

import { motion } from "framer-motion"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Settings,
  MessageCircle,
  Maximize,
  Minimize,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CallControlsProps {
  onEnd: () => void
  onToggleVideo: () => void
  onToggleMic: () => void
  isVideoEnabled: boolean
  isMicEnabled: boolean
  onScreenShare?: () => void
  isScreenSharing?: boolean
  onToggleFullscreen?: () => void
  isFullscreen?: boolean
  onToggleChat?: () => void
  showChat?: boolean
  onShowParticipants?: () => void
  onSettings?: () => void
}

export function CallControls({
  onEnd,
  onToggleVideo,
  onToggleMic,
  isVideoEnabled,
  isMicEnabled,
  onScreenShare,
  isScreenSharing = false,
  onToggleFullscreen,
  isFullscreen = false,
  onToggleChat,
  showChat = false,
  onShowParticipants,
  onSettings,
}: CallControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6"
    >
      <div className="flex items-center justify-center space-x-4">
        {/* Secondary controls */}
        <div className="flex items-center space-x-2">
          {onScreenShare && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onScreenShare}
              className={cn(
                "h-12 w-12 rounded-full text-white hover:bg-white/20",
                isScreenSharing && "bg-green-500 hover:bg-green-600",
              )}
            >
              <Monitor className="h-5 w-5" />
            </Button>
          )}

          {onShowParticipants && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onShowParticipants}
              className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            >
              <Users className="h-5 w-5" />
            </Button>
          )}

          {onToggleChat && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleChat}
              className={cn(
                "h-12 w-12 rounded-full text-white hover:bg-white/20",
                showChat && "bg-purple-500 hover:bg-purple-600",
              )}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Primary controls */}
        <div className="flex items-center space-x-4">
          {/* Microphone */}
          <Button
            onClick={onToggleMic}
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full border-2 border-white",
              isMicEnabled ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white",
            )}
          >
            {isMicEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* End call */}
          <Button
            onClick={onEnd}
            size="lg"
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white border-4 border-white"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* Video */}
          <Button
            onClick={onToggleVideo}
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full border-2 border-white",
              isVideoEnabled ? "bg-white/20 hover:bg-white/30 text-white" : "bg-red-500 hover:bg-red-600 text-white",
            )}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center space-x-2">
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleFullscreen}
              className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>
          )}

          {onSettings && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onSettings}
              className="h-12 w-12 rounded-full text-white hover:bg-white/20"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
