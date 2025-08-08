/**
 * Daily.co Video Call Service
 * Handles video/voice calls integration
 */

export interface DailyRoom {
  id: string
  name: string
  url: string
  created_at: string
  config?: any
}

export interface DailyMeetingToken {
  token: string
}

class DailyVideoService {
  private apiKey: string
  private domain: string
  private baseUrl = 'https://api.daily.co/v1'

  constructor() {
    this.apiKey = process.env.DAILY_API_KEY || ''
    this.domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || ''
  }

  /**
   * Create a Daily.co room
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
      enableChat = false
    } = options

    const roomName = `openlove-${conversationId.slice(0, 8)}-${Date.now()}`
    const expiresAt = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)

    const roomConfig = {
      name: roomName,
      privacy: 'private',
      properties: {
        start_video_off: callType === 'audio',
        start_audio_off: false,
        max_participants: maxParticipants,
        enable_screenshare: enableScreenshare,
        enable_chat: enableChat,
        exp: expiresAt,
        eject_at_room_exp: true,
        enable_network_ui: true,
        enable_people_ui: true,
        lang: 'pt'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomConfig)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create room: ${error}`)
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
      console.error('Error creating Daily room:', error)
      throw error
    }
  }

  /**
   * Create a meeting token for a user
   */
  async createMeetingToken(
    roomName: string,
    userId: string,
    userName: string,
    options: {
      isModerator?: boolean
      expiresInMinutes?: number
    } = {}
  ): Promise<DailyMeetingToken> {
    const {
      isModerator = false,
      expiresInMinutes = 60
    } = options

    const expiresAt = Math.floor(Date.now() / 1000) + (expiresInMinutes * 60)

    const tokenConfig = {
      properties: {
        room_name: roomName,
        user_name: userName,
        user_id: userId,
        exp: expiresAt,
        is_owner: isModerator,
        enable_screenshare: true,
        enable_recording: isModerator,
        start_cloud_recording: false,
        start_video_off: false,
        start_audio_off: false
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tokenConfig)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to create meeting token: ${error}`)
      }

      const data = await response.json()
      return { token: data.token }
    } catch (error) {
      console.error('Error creating meeting token:', error)
      throw error
    }
  }

  /**
   * Delete a room
   */
  async deleteRoom(roomName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to delete room: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting room:', error)
      // Non-critical error, room will expire anyway
    }
  }

  /**
   * Get room information
   */
  async getRoomInfo(roomName: string): Promise<DailyRoom | null> {
    try {
      const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        return null
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
}

export const dailyVideoService = new DailyVideoService()