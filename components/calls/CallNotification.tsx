'use client'

/**
 * Call Notification Component
 * Shows incoming video/voice call notifications
 */

import { useState, useEffect } from 'react'
import { Phone, PhoneCall, X, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import { useVideoCalls } from '@/hooks/use-video-calls'

interface IncomingCall {
  id: string
  conversation_id: string
  room_url: string
  call_type: 'video' | 'audio'
  initiated_by: string
  initiator_name: string
  initiator_avatar?: string
  created_at: string
}

interface CallNotificationProps {
  incomingCall: IncomingCall | null
  onAnswer: (callId: string) => void
  onDecline: (callId: string) => void
}

export function CallNotification({ 
  incomingCall, 
  onAnswer, 
  onDecline 
}: CallNotificationProps) {
  const [isRinging, setIsRinging] = useState(false)
  const { joinCall, startCall } = useVideoCalls()

  useEffect(() => {
    if (incomingCall) {
      setIsRinging(true)
      
      // Auto-decline after 30 seconds
      const timeout = setTimeout(() => {
        onDecline(incomingCall.id)
      }, 30000)

      return () => clearTimeout(timeout)
    } else {
      setIsRinging(false)
    }
  }, [incomingCall, onDecline])

  const handleAnswer = async () => {
    if (!incomingCall) return
    
    try {
      // Join the call via API
      const callData = await joinCall(incomingCall.id)
      
      // Start the Daily.co call
      await startCall(callData.room_url, callData.meeting_token)
      
      onAnswer(incomingCall.id)
    } catch (error) {
      console.error('Failed to answer call:', error)
      onDecline(incomingCall.id)
    }
  }

  const handleDecline = () => {
    if (incomingCall) {
      onDecline(incomingCall.id)
    }
  }

  if (!incomingCall) return null

  const CallIcon = incomingCall.call_type === 'video' ? PhoneCall : Phone

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 min-w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CallIcon className={`w-5 h-5 ${
                incomingCall.call_type === 'video' 
                  ? 'text-green-500' 
                  : 'text-blue-500'
              }`} />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {incomingCall.call_type === 'video' ? 'Video Call' : 'Voice Call'}
              </span>
            </div>
            <button
              onClick={handleDecline}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Caller Info */}
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={incomingCall.initiator_avatar} 
                alt={incomingCall.initiator_name}
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {incomingCall.initiator_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {incomingCall.initiator_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Incoming {incomingCall.call_type} call...
              </p>
            </div>

            {/* Ringing animation */}
            {isRinging && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-green-500"
              >
                <Volume2 className="w-6 h-6" />
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={handleDecline}
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            
            <Button
              size="lg"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAnswer}
            >
              <CallIcon className="w-4 h-4 mr-2" />
              Answer
            </Button>
          </div>

          {/* Timer */}
          <div className="mt-3 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Call will end automatically in 30s
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CallNotification