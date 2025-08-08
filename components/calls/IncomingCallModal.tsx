'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/app/lib/supabase-browser'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface IncomingCall {
  id: string
  sender_id: string
  sender: {
    username: string
    name?: string
    full_name?: string
    avatar_url?: string
  }
  content: string
  metadata: {
    conversation_id: string
    room_url: string
    call_type: 'video' | 'audio'
  }
}

export function IncomingCallModal() {
  const { user } = useAuth()
  const supabase = createClient()
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null)
  const [isRinging, setIsRinging] = useState(false)

  useEffect(() => {
    if (!user) return

    // Subscribe to call notifications
    const channel = supabase
      .channel(`calls:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id} AND type=eq.call`
        },
        async (payload) => {
          console.log('Incoming call notification:', payload)
          
          // Fetch sender details
          const { data: notification } = await supabase
            .from('notifications')
            .select(`
              *,
              sender:users!sender_id(
                id,
                username,
                name,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (notification) {
            setIncomingCall({
              id: notification.id,
              sender_id: notification.sender_id,
              sender: notification.sender,
              content: notification.content,
              metadata: notification.metadata as any
            })
            setIsRinging(true)
            
            // Play ringtone (optional)
            playRingtone()
            
            // Auto-decline after 30 seconds
            setTimeout(() => {
              if (isRinging) {
                handleDecline()
              }
            }, 30000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, isRinging])

  const playRingtone = () => {
    // Optional: Add ringtone audio
    // const audio = new Audio('/sounds/ringtone.mp3')
    // audio.loop = true
    // audio.play()
  }

  const stopRingtone = () => {
    // Stop ringtone if implemented
  }

  const handleAccept = async () => {
    if (!incomingCall) return

    try {
      stopRingtone()
      setIsRinging(false)
      
      // Get meeting token for this user
      const response = await fetch('/api/v1/calls/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomUrl: incomingCall.metadata.room_url,
          conversationId: incomingCall.metadata.conversation_id
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao entrar na chamada')
      }

      const { token } = await response.json()
      
      // Open Daily.co call window
      const callWindow = window.open(
        `${incomingCall.metadata.room_url}?t=${token}`,
        'OpenLove Call',
        'width=800,height=600,toolbar=no,location=no,status=no,menubar=no'
      )
      
      if (!callWindow) {
        toast.error('Permita pop-ups para aceitar chamadas')
      }
      
      // Mark notification as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', incomingCall.id)
      
      setIncomingCall(null)
    } catch (error) {
      console.error('Error accepting call:', error)
      toast.error('Erro ao aceitar chamada')
    }
  }

  const handleDecline = async () => {
    if (!incomingCall) return
    
    stopRingtone()
    setIsRinging(false)
    
    // Mark notification as read
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', incomingCall.id)
    
    setIncomingCall(null)
  }

  if (!incomingCall || !isRinging) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-4 right-4 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-6 z-[100] max-w-sm"
      >
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <Avatar className="h-20 w-20 mx-auto border-4 border-purple-500">
              <AvatarImage src={incomingCall.sender.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                {(incomingCall.sender.full_name || incomingCall.sender.username).charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <h3 className="text-lg font-bold mb-1">
            {incomingCall.sender.full_name || incomingCall.sender.name || incomingCall.sender.username}
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center justify-center gap-2">
            {incomingCall.metadata.call_type === 'video' ? (
              <>
                <Video className="w-4 h-4" />
                Videochamada
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Chamada de voz
              </>
            )}
          </p>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleDecline}
              size="lg"
              variant="destructive"
              className="rounded-full"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              Recusar
            </Button>
            <Button
              onClick={handleAccept}
              size="lg"
              className="rounded-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              Aceitar
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}