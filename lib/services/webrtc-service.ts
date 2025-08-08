import { createClient } from '@/app/lib/supabase-browser'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { User } from '@/types/database.types'
import { PlanLimitError } from './messages-service'

export interface CallParticipant {
  userId: string
  username: string
  fullName: string
  avatarUrl?: string
}

export interface CallSession {
  id: string
  conversationId: string
  callerId: string
  type: 'voice' | 'video'
  status: 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined'
  participants: CallParticipant[]
  startedAt?: string
  endedAt?: string
}

interface RTCSignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-start' | 'call-end' | 'call-accept' | 'call-decline'
  data: any
  from: string
  to?: string
  callId: string
}

class WebRTCService {
  private supabase = createClient()
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private signalingChannel: RealtimeChannel | null = null
  private currentCall: CallSession | null = null
  
  // Callbacks
  private onIncomingCall?: (call: CallSession) => void
  private onCallAccepted?: (call: CallSession) => void
  private onCallDeclined?: (call: CallSession) => void
  private onCallEnded?: (call: CallSession) => void
  private onRemoteStream?: (stream: MediaStream) => void
  private onLocalStream?: (stream: MediaStream) => void
  private onCallError?: (error: string) => void

  // STUN servers (free Google STUN servers)
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  }

  constructor() {
    this.setupSignalingChannel()
  }

  // Setup realtime signaling channel
  private setupSignalingChannel() {
    this.signalingChannel = this.supabase
      .channel('webrtc-signaling')
      .on('broadcast', { event: 'signaling' }, (payload) => {
        this.handleSignalingMessage(payload.payload as RTCSignalingMessage)
      })
      .subscribe()
  }

  // Set callbacks
  setCallbacks({
    onIncomingCall,
    onCallAccepted,
    onCallDeclined,
    onCallEnded,
    onRemoteStream,
    onLocalStream,
    onCallError
  }: {
    onIncomingCall?: (call: CallSession) => void
    onCallAccepted?: (call: CallSession) => void
    onCallDeclined?: (call: CallSession) => void
    onCallEnded?: (call: CallSession) => void
    onRemoteStream?: (stream: MediaStream) => void
    onLocalStream?: (stream: MediaStream) => void
    onCallError?: (error: string) => void
  }) {
    this.onIncomingCall = onIncomingCall
    this.onCallAccepted = onCallAccepted
    this.onCallDeclined = onCallDeclined
    this.onCallEnded = onCallEnded
    this.onRemoteStream = onRemoteStream
    this.onLocalStream = onLocalStream
    this.onCallError = onCallError
  }

  // Check if user can make calls
  private async checkCallPermissions(): Promise<void> {
    const { data: { user: authUser } } = await this.supabase.auth.getUser()
    if (!authUser) throw new Error('Usuário não autenticado')

    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) throw error

    if (user.premium_type !== 'diamond' && user.premium_type !== 'couple') {
      throw new PlanLimitError('chamadas de voz/vídeo', 'Diamond')
    }
  }

  // Start a call
  async startCall(
    conversationId: string,
    participants: CallParticipant[],
    type: 'voice' | 'video' = 'voice'
  ): Promise<CallSession> {
    try {
      // Check if user has permission to make calls
      await this.checkCallPermissions()
      // Create call session
      const callSession: CallSession = {
        id: crypto.randomUUID(),
        conversationId,
        callerId: participants[0].userId, // First participant is caller
        type,
        status: 'ringing',
        participants,
        startedAt: new Date().toISOString()
      }

      this.currentCall = callSession

      // Save to database
      await this.supabase
        .from('calls')
        .insert({
          id: callSession.id,
          conversation_id: conversationId,
          caller_id: callSession.callerId,
          call_type: type,
          status: 'ringing',
          participants: participants.map(p => p.userId)
        })

      // Get user media
      await this.getUserMedia(type === 'video')

      // Send call invitation via signaling
      await this.sendSignalingMessage({
        type: 'call-start',
        data: callSession,
        from: callSession.callerId,
        callId: callSession.id
      })

      return callSession
    } catch (error) {
      console.error('Error starting call:', error)
      this.onCallError?.('Erro ao iniciar chamada')
      throw error
    }
  }

  // Accept incoming call
  async acceptCall(callId: string): Promise<void> {
    try {
      if (!this.currentCall || this.currentCall.id !== callId) {
        throw new Error('No incoming call to accept')
      }

      // Get user media
      await this.getUserMedia(this.currentCall.type === 'video')

      // Update call status
      this.currentCall.status = 'connecting'
      await this.updateCallStatus(callId, 'connecting')

      // Send acceptance via signaling
      await this.sendSignalingMessage({
        type: 'call-accept',
        data: { callId },
        from: '', // Will be set in sendSignalingMessage
        callId
      })

      // Setup peer connection for answerer
      await this.setupPeerConnection()
      
    } catch (error) {
      console.error('Error accepting call:', error)
      this.onCallError?.('Erro ao aceitar chamada')
      throw error
    }
  }

  // Decline incoming call
  async declineCall(callId: string): Promise<void> {
    try {
      // Send decline via signaling
      await this.sendSignalingMessage({
        type: 'call-decline',
        data: { callId },
        from: '', // Will be set in sendSignalingMessage
        callId
      })

      // Update call status
      await this.updateCallStatus(callId, 'declined')

      // Clean up
      this.cleanup()
    } catch (error) {
      console.error('Error declining call:', error)
      throw error
    }
  }

  // End current call
  async endCall(): Promise<void> {
    try {
      if (!this.currentCall) return

      // Send end call signal
      await this.sendSignalingMessage({
        type: 'call-end',
        data: { callId: this.currentCall.id },
        from: '', // Will be set in sendSignalingMessage
        callId: this.currentCall.id
      })

      // Update database
      await this.updateCallStatus(this.currentCall.id, 'ended')

      // Clean up
      this.cleanup()
      
      this.onCallEnded?.(this.currentCall)
      this.currentCall = null
    } catch (error) {
      console.error('Error ending call:', error)
      throw error
    }
  }

  // Toggle mute
  toggleMute(): boolean {
    if (!this.localStream) return false
    
    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      return !audioTrack.enabled // Return true if muted
    }
    return false
  }

  // Toggle video
  toggleVideo(): boolean {
    if (!this.localStream) return false
    
    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      return !videoTrack.enabled // Return true if video off
    }
    return false
  }

  // Get user media
  private async getUserMedia(video: boolean = false): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.onLocalStream?.(this.localStream)
      return this.localStream
    } catch (error) {
      console.error('Error getting user media:', error)
      this.onCallError?.('Erro ao acessar câmera/microfone')
      throw error
    }
  }

  // Setup peer connection
  private async setupPeerConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration)

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!)
      })
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStream?.(this.remoteStream)
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentCall) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          data: event.candidate,
          from: '', // Will be set in sendSignalingMessage
          callId: this.currentCall.id
        })
      }
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('Connection state:', state)
      
      if (state === 'connected' && this.currentCall) {
        this.currentCall.status = 'connected'
        this.updateCallStatus(this.currentCall.id, 'connected')
        this.onCallAccepted?.(this.currentCall)
      } else if (state === 'disconnected' || state === 'failed') {
        this.endCall()
      }
    }
  }

  // Handle signaling messages
  private async handleSignalingMessage(message: RTCSignalingMessage): Promise<void> {
    try {
      // Ignore messages from self
      const currentUserId = await this.getCurrentUserId()
      if (message.from === currentUserId) return

      switch (message.type) {
        case 'call-start':
          const incomingCall = message.data as CallSession
          this.currentCall = incomingCall
          this.onIncomingCall?.(incomingCall)
          break

        case 'call-accept':
          if (this.currentCall && message.callId === this.currentCall.id) {
            await this.setupPeerConnection()
            await this.createOffer()
          }
          break

        case 'call-decline':
          if (this.currentCall && message.callId === this.currentCall.id) {
            this.onCallDeclined?.(this.currentCall)
            this.cleanup()
          }
          break

        case 'call-end':
          if (this.currentCall && message.callId === this.currentCall.id) {
            this.onCallEnded?.(this.currentCall)
            this.cleanup()
          }
          break

        case 'offer':
          await this.handleOffer(message.data)
          break

        case 'answer':
          await this.handleAnswer(message.data)
          break

        case 'ice-candidate':
          await this.handleIceCandidate(message.data)
          break
      }
    } catch (error) {
      console.error('Error handling signaling message:', error)
      this.onCallError?.('Erro na sinalização da chamada')
    }
  }

  // Create WebRTC offer
  private async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.currentCall) return

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)

    await this.sendSignalingMessage({
      type: 'offer',
      data: offer,
      from: '', // Will be set in sendSignalingMessage
      callId: this.currentCall.id
    })
  }

  // Handle WebRTC offer
  private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection || !this.currentCall) return

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)

    await this.sendSignalingMessage({
      type: 'answer',
      data: answer,
      from: '', // Will be set in sendSignalingMessage
      callId: this.currentCall.id
    })
  }

  // Handle WebRTC answer
  private async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return
    await this.peerConnection.setRemoteDescription(answer)
  }

  // Handle ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return
    await this.peerConnection.addIceCandidate(candidate)
  }

  // Send signaling message via Supabase Realtime
  private async sendSignalingMessage(message: RTCSignalingMessage): Promise<void> {
    if (!this.signalingChannel) return

    // Set the current user ID
    const userId = await this.getCurrentUserId()
    message.from = userId

    await this.signalingChannel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message
    })
  }

  // Update call status in database
  private async updateCallStatus(callId: string, status: string): Promise<void> {
    await this.supabase
      .from('calls')
      .update({ 
        status,
        ...(status === 'connected' && { started_at: new Date().toISOString() }),
        ...(status === 'ended' && { 
          ended_at: new Date().toISOString(),
          duration_seconds: this.currentCall?.startedAt ? 
            Math.floor((Date.now() - new Date(this.currentCall.startedAt).getTime()) / 1000) : 0
        })
      })
      .eq('id', callId)
  }

  // Get current user ID
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')
    return user.id
  }

  // Clean up resources
  private cleanup(): void {
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // Clear remote stream
    this.remoteStream = null
  }

  // Destroy service
  destroy(): void {
    this.cleanup()
    
    // Unsubscribe from signaling channel
    if (this.signalingChannel) {
      this.supabase.removeChannel(this.signalingChannel)
      this.signalingChannel = null
    }
  }

  // Get current call
  getCurrentCall(): CallSession | null {
    return this.currentCall
  }

  // Check if in call
  isInCall(): boolean {
    return this.currentCall !== null && this.currentCall.status !== 'ended'
  }

  // Get call stats
  async getCallStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) return null
    return await this.peerConnection.getStats()
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService()