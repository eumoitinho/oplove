import type { User } from "./user" // Assuming User is defined in another file, e.g., user.ts

/**
 * Plan-based messaging limits and restrictions
 */
export type PlanType = 'free' | 'gold' | 'diamond' | 'couple'

export interface PlanLimits {
  dailyMessageLimit: number // -1 for unlimited
  canInitiateConversations: boolean
  canCreateGroups: boolean
  maxGroupMembers: number
  canSendMedia: boolean
  canMakeCalls: boolean
}

/**
 * Group chat types and roles
 */
export type GroupType = 'user_created' | 'event' | 'community'
export type ParticipantRole = 'admin' | 'moderator' | 'member'

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  user: User
  role: ParticipantRole
  joined_at: string
  last_read_at?: string
  is_muted: boolean
  custom_name?: string // Custom name for this participant in this conversation
}

export interface Conversation {
  id: string
  type: "direct" | "group"
  group_type?: GroupType // Only for group conversations
  name?: string
  description?: string
  avatar_url?: string
  participants: ConversationParticipant[]
  last_message?: Message
  unread_count?: number
  is_archived: boolean
  is_pinned: boolean
  is_muted: boolean
  
  // v0.3.2 messaging rules fields
  initiated_by?: string // User ID who created the conversation
  initiated_by_premium: boolean // Whether the initiator was premium when created
  
  // Group-specific fields
  max_members?: number // Based on creator's plan
  invite_code?: string // For group invitations
  
  created_at: string
  updated_at: string
}

export type MessageType = "text" | "image" | "video" | "audio" | "file" | "system" | "call" | "location"
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"
export type CallType = "voice" | "video"
export type CallStatus = "initiated" | "ringing" | "answered" | "ended" | "missed" | "declined"

export interface MessageMedia {
  id: string
  url: string
  type: "image" | "video" | "audio" | "file"
  thumbnail_url?: string
  file_name?: string
  file_size?: number
  duration?: number // For audio/video files
  width?: number // For images/videos
  height?: number // For images/videos
  mime_type?: string
}

export interface MessageLocation {
  latitude: number
  longitude: number
  address?: string
  place_name?: string
}

export interface CallData {
  type: CallType
  status: CallStatus
  duration?: number // Call duration in seconds
  participants: string[] // User IDs
  started_at?: string
  ended_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender: User
  content?: string
  type: MessageType
  status: MessageStatus
  
  // Media attachments
  media?: MessageMedia[]
  media_url?: string // Deprecated, use media array
  media_urls?: string[] // Deprecated, use media array
  
  // File metadata (deprecated, use media array)
  file_name?: string
  file_size?: string
  
  // Location data
  location?: MessageLocation
  
  // Call data
  call_data?: CallData
  
  // Message features
  reactions?: MessageReaction[]
  read_by?: MessageReadReceipt[]
  reply_to?: string // ID of message being replied to
  reply_to_message?: Message // Populated reply message
  forwarded_from?: string // Original message ID if forwarded
  
  // Threading (for group conversations)
  thread_id?: string
  thread_replies_count?: number
  
  // Status timestamps
  sent_at?: string
  delivered_at?: string
  read_at?: string
  edited_at?: string
  deleted_at?: string
  
  // System message data
  system_data?: {
    type: 'user_joined' | 'user_left' | 'group_created' | 'group_updated' | 'user_promoted' | 'user_demoted'
    user_id?: string
    old_value?: string
    new_value?: string
  }
  
  created_at: string
  updated_at?: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  user: User
  emoji: string
  created_at: string
}

export interface MessageReadReceipt {
  id: string
  message_id: string
  user_id: string
  user: User
  read_at?: string
  delivered_at?: string
  created_at: string
}

export interface MessagePermissions {
  canSend: boolean
  reason?: string
  canSendMedia?: boolean
  canSendFiles?: boolean
  canMakeCall?: boolean
  canEditMessages?: boolean
  canDeleteMessages?: boolean
  canForwardMessages?: boolean
  remainingMessages?: number
  totalMessages?: number
}

export interface GroupPermissions {
  canInviteMembers: boolean
  canRemoveMembers: boolean
  canEditGroup: boolean
  canDeleteGroup: boolean
  canPromoteMembers: boolean
  canManageMessages: boolean
  canChangeSettings: boolean
}

export interface ConversationLimits {
  maxMembers: number
  maxDailyMessages: number
  maxFileSize: number // in bytes
  allowedFileTypes: string[]
  canCreateGroups: boolean
  canMakeCalls: boolean
}

export interface MessageQuota {
  plan: PlanType
  daily_limit: number
  current_count: number
  remaining: number
  resets_at: string
  is_verified: boolean
  has_unlimited: boolean
}

export interface TypingIndicator {
  user_id: string
  user: User
  conversation_id: string
  is_typing: boolean
  updated_at: string
}
