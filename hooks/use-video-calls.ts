/**
 * Hook for managing video calls with Daily.co
 */

import { useState, useEffect, useCallback } from 'react'
import DailyIframe from '@daily-co/daily-js'
import { createClient } from '@/lib/supabase/client'

export interface VideoCallState {
  isInCall: boolean
  isConnecting: boolean
  callObject: any | null
  participants: any[]
  localVideo: boolean
  localAudio: boolean
  error: string | null
}

export interface CreateCallOptions {
  conversationId: string
  callType: 'video' | 'audio'
  maxParticipants?: number
}

export function useVideoCalls() {
  const [callState, setCallState] = useState<VideoCallState>({
    isInCall: false,
    isConnecting: false,
    callObject: null,
    participants: [],
    localVideo: true,
    localAudio: true,
    error: null
  })

  const supabase = createClient()

  /**
   * Create a new video call
   */
  const createCall = useCallback(async (options: CreateCallOptions) => {
    try {
      setCallState(prev => ({ ...prev, isConnecting: true, error: null }))

      const response = await fetch('/api/v1/calls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: options.conversationId,
          callType: options.callType,
          maxParticipants: options.maxParticipants || 4
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create call')
      }

      const result = await response.json()
      return result.call
    } catch (error: any) {
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message 
      }))
      throw error
    }
  }, [])

  /**
   * Join an existing call
   */
  const joinCall = useCallback(async (callId: string) => {
    try {
      setCallState(prev => ({ ...prev, isConnecting: true, error: null }))

      const response = await fetch(`/api/v1/calls/join/${callId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to join call')
      }

      const result = await response.json()
      return result.call
    } catch (error: any) {
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: error.message 
      }))
      throw error
    }
  }, [])

  /**
   * Start a call with Daily.co
   */
  const startCall = useCallback(async (roomUrl: string, meetingToken: string) => {
    try {
      // Create Daily call object
      const callObject = DailyIframe.createCallObject({
        iframeStyle: {
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: '9999'
        }
      })

      // Set up event listeners
      callObject.on('joined-meeting', () => {
        setCallState(prev => ({
          ...prev,
          isInCall: true,
          isConnecting: false,
          callObject
        }))
      })

      callObject.on('left-meeting', () => {
        setCallState(prev => ({
          ...prev,
          isInCall: false,
          isConnecting: false,
          callObject: null,
          participants: []
        }))
      })

      callObject.on('participant-joined', (event: any) => {
        setCallState(prev => ({
          ...prev,
          participants: [...prev.participants, event.participant]
        }))
      })

      callObject.on('participant-left', (event: any) => {
        setCallState(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.session_id !== event.participant.session_id)
        }))
      })

      callObject.on('error', (event: any) => {
        setCallState(prev => ({
          ...prev,
          error: event.errorMsg,
          isConnecting: false
        }))
      })

      // Join the meeting
      await callObject.join({
        url: roomUrl,
        token: meetingToken
      })

    } catch (error: any) {
      setCallState(prev => ({
        ...prev,
        error: error.message,
        isConnecting: false
      }))
    }
  }, [])

  /**
   * Leave the current call
   */
  const leaveCall = useCallback(async () => {
    if (callState.callObject) {
      try {
        await callState.callObject.leave()
        await callState.callObject.destroy()
      } catch (error) {
        console.error('Error leaving call:', error)
      }
    }
  }, [callState.callObject])

  /**
   * Toggle local video
   */
  const toggleVideo = useCallback(async () => {
    if (callState.callObject) {
      const newVideoState = !callState.localVideo
      await callState.callObject.setLocalVideo(newVideoState)
      setCallState(prev => ({ ...prev, localVideo: newVideoState }))
    }
  }, [callState.callObject, callState.localVideo])

  /**
   * Toggle local audio
   */
  const toggleAudio = useCallback(async () => {
    if (callState.callObject) {
      const newAudioState = !callState.localAudio
      await callState.callObject.setLocalAudio(newAudioState)
      setCallState(prev => ({ ...prev, localAudio: newAudioState }))
    }
  }, [callState.callObject, callState.localAudio])

  /**
   * Get user's active calls
   */
  const getActiveCalls = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_active_calls', { p_user_id: userId })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting active calls:', error)
      return []
    }
  }, [supabase])

  /**
   * Listen for incoming calls
   */
  useEffect(() => {
    const channel = supabase
      .channel('video_calls')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_calls'
        },
        (payload) => {
          // Handle incoming call notification
          console.log('New video call:', payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (callState.callObject) {
        callState.callObject.destroy()
      }
    }
  }, [])

  return {
    callState,
    createCall,
    joinCall,
    startCall,
    leaveCall,
    toggleVideo,
    toggleAudio,
    getActiveCalls
  }
}