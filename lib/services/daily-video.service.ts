/**
 * Daily.co Video Call Service
 * Handles video/voice calls integration with conversations
 */

export interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config: {
    start_video_off?: boolean
    start_audio_off?: boolean
    privacy?: 'public' | 'private'
    max_participants?: number
    enable_screenshare?: boolean
    enable_chat?: boolean
    exp?: number // expiration timestamp
  }
}

export interface CallParticipant {
  user_id: string
  session_id: string
  joined_at: string
  left_at?: string
  duration?: number
}

export interface VideoCall {
  id: string
  conversation_id: string
  room_id: string
  room_url: string
  initiated_by: string
  call_type: 'video' | 'audio'
  status: 'waiting' | 'active' | 'ended' | 'missed'
  started_at: string
  ended_at?: string
  duration?: number
  participants: CallParticipant[]
}

export class DailyVideoService {
  private apiKey: string
  private domain: string

  constructor() {
    this.apiKey = process.env.DAILY_API_KEY || ''
    this.domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || ''
    
    if (!this.apiKey) {
      throw new Error('DAILY_API_KEY is required')
    }
    if (!this.domain) {
      throw new Error('NEXT_PUBLIC_DAILY_DOMAIN is required')
    }
  }

  /**
   * Create a Daily.co room for a conversation
   */
  async createRoom(
    conversationId: string,
    callType: 'video' | 'audio' = 'video',
    options: {
      maxParticipants?: number
      expiresInMinutes?: number
      enableScreenshare?: boolean
      enableChat?: boolean
    } = {}
  ): Promise<DailyRoom> {
    const {
      maxParticipants = 8,
      expiresInMinutes = 60,
      enableScreenshare = true,
      enableChat = false // Usar chat do OpenLove
    } = options

    const roomName = `openlove-${conversationId}-${Date.now()}`
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)

    const config = {
      name: roomName,
      privacy: 'private' as const,
      properties: {
        start_video_off: callType === 'audio',
        start_audio_off: false,
        max_participants: maxParticipants,
        enable_screenshare: enableScreenshare,
        enable_chat: enableChat,
        exp: Math.floor(expiresAt.getTime() / 1000),
        eject_at_room_exp: true,
        enable_network_ui: true,
        enable_people_ui: true
      }
    }

    try {
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Daily.co API error: ${error.error || response.statusText}`)
      }

      const room = await response.json()
      
      return {
        id: room.id,
        name: room.name,
        url: room.url,
        created_at: room.created_at,
        config: room.config
      }
    } catch (error) {
      console.error('Error creating Daily.co room:', error)
      throw error
    }
  }

  /**
   * Generate meeting token for a user
   */
  async createMeetingToken(
    roomName: string,
    userId: string,
    userName: string,
    options: {
      isModerator?: boolean
      expiresInMinutes?: number
    } = {}
  ): Promise<string> {
    const {
      isModerator = false,
      expiresInMinutes = 60
    } = options

    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)

    const tokenConfig = {
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        is_owner: isModerator,
        exp: Math.floor(expiresAt.getTime() / 1000)
      }
    }

    try {
      const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(tokenConfig)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Daily.co token error: ${error.error || response.statusText}`)
      }

      const result = await response.json()
      return result.token
    } catch (error) {
      console.error('Error creating meeting token:', error)
      throw error
    }
  }

  /**
   * Delete a Daily.co room
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok && response.status !== 404) {
        const error = await response.json()
        throw new Error(`Daily.co delete error: ${error.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting Daily.co room:', error)
      // Don't throw - room cleanup is not critical
    }
  }

  /**
   * Get room information
   */
  async getRoomInfo(roomName: string): Promise<DailyRoom | null> {
    try {
      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (response.status === 404) {
        return null
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Daily.co API error: ${error.error || response.statusText}`)
      }

      const room = await response.json()
      
      return {
        id: room.id,
        name: room.name,
        url: room.url,
        created_at: room.created_at,
        config: room.config
      }
    } catch (error) {
      console.error('Error getting room info:', error)
      return null
    }
  }

  /**
   * List active participants in a room
   */
  async getActiveParticipants(roomName: string): Promise<CallParticipant[]> {
    try {
      const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}/presence`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      
      return Object.entries(data.participants || {}).map(([sessionId, participant]: [string, any]) => ({
        user_id: participant.user_id || sessionId,
        session_id: sessionId,
        joined_at: participant.joined_at,
        left_at: participant.left_at,
        duration: participant.duration
      }))
    } catch (error) {
      console.error('Error getting participants:', error)
      return []
    }
  }

  /**
   * Create a room URL with domain
   */
  createRoomUrl(roomName: string): string {
    return `https://${this.domain}.daily.co/${roomName}`
  }
}

// Singleton instance
export const dailyVideoService = new DailyVideoService()