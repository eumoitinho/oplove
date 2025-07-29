/**
 * Chat-related TypeScript types for OpenLove
 */

import type { User } from "./user.types"

export interface Conversation {
  id: string
  title: string | null
  type: "direct" | "group" | "event" | "community"
  group_type?: "user_created" | "event" | "community"
  avatar_url: string | null
  description: string | null
  created_by: string
  initiated_by: string | null
  initiated_by_premium: boolean
  is_archived: boolean
  is_muted: boolean
  last_message_at: string | null
  unread_count: number
  created_at: string
  updated_at: string

  // Relations
  participants: ConversationParticipant[]
  messages: Message[]
  last_message: Message | null
  creator: User
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: "admin" | "moderator" | "member"
  joined_at: string
  left_at: string | null
  is_muted: boolean
  last_read_at: string | null

  // Relations
  user: User
  conversation: Conversation
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  media_url: string | null
  media_type: "image" | "video" | "audio" | "document" | null
  media_size: number | null
  media_duration: number | null // for audio/video in seconds
  reply_to: string | null
  message_type: "text" | "media" | "system" | "call"
  system_data: SystemMessageData | null
  call_data: CallData | null
  is_edited: boolean
  edit_history: MessageEdit[]
  is_deleted: boolean
  deleted_at: string | null
  reactions_count: number
  created_at: string
  updated_at: string

  // Relations
  sender: User
  conversation: Conversation
  reply_to_message: Message | null
  reactions: MessageReaction[]
  read_receipts: MessageReadReceipt[]
}

export interface SystemMessageData {
  type: "user_joined" | "user_left" | "user_added" | "user_removed" | "title_changed" | "avatar_changed"
  actor_id: string
  target_id?: string
  old_value?: string
  new_value?: string
}

export interface CallData {
  type: "voice" | "video"
  duration: number | null // in seconds, null if missed/declined
  status: "initiated" | "answered" | "missed" | "declined" | "ended"
  participants: string[]
}

export interface MessageEdit {
  id: string
  message_id: string
  previous_content: string
  edited_at: string
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string

  // Relations
  user: User
  message: Message
}

export interface MessageReadReceipt {
  id: string
  message_id: string
  user_id: string
  read_at: string

  // Relations
  user: User
  message: Message
}

export interface CreateConversationData {
  title?: string
  type: "direct" | "group"
  participants: string[] // user IDs
  description?: string
  avatar?: File
}

export interface UpdateConversationData {
  title?: string
  description?: string
  avatar?: File | null
}

export interface SendMessageData {
  content?: string
  media?: File
  replyTo?: string
  messageType?: "text" | "media"
}

export interface MessageFilter {
  before?: string // ISO date string
  after?: string // ISO date string
  limit?: number
  messageType?: Message["message_type"]
  hasMedia?: boolean
  fromUser?: string
}

export interface ConversationFilter {
  type?: Conversation["type"]
  archived?: boolean
  muted?: boolean
  hasUnread?: boolean
  limit?: number
  search?: string
}

export interface TypingStatus {
  user_id: string
  is_typing: boolean
  conversation_id: string
}

export interface OnlineStatus {
  [userId: string]: {
    online_at: string
    presence_ref: string
  }[]
}

export interface ConversationSettings {
  id: string
  conversation_id: string
  user_id: string
  is_muted: boolean
  mute_until: string | null
  notifications_enabled: boolean
  custom_sound: string | null
  auto_download_media: boolean

  // Relations
  conversation: Conversation
  user: User
}

export interface MessageDraft {
  id: string
  conversation_id: string
  user_id: string
  content: string
  media_urls: string[]
  reply_to: string | null
  created_at: string
  updated_at: string
}

// Voice/Video call types (Diamond+ feature)
export interface Call {
  id: string
  conversation_id: string
  initiator_id: string
  type: "voice" | "video"
  status: "ringing" | "active" | "ended" | "missed" | "declined"
  started_at: string
  ended_at: string | null
  duration: number | null // in seconds
  participants: CallParticipant[]

  // Relations
  conversation: Conversation
  initiator: User
}

export interface CallParticipant {
  id: string
  call_id: string
  user_id: string
  joined_at: string | null
  left_at: string | null
  status: "invited" | "joined" | "left" | "declined"

  // Relations
  call: Call
  user: User
}

export interface CallSettings {
  camera_enabled: boolean
  microphone_enabled: boolean
  speaker_enabled: boolean
  screen_sharing: boolean
  recording_enabled: boolean
}

// Group management types
export interface GroupInvite {
  id: string
  conversation_id: string
  inviter_id: string
  invitee_id: string
  status: "pending" | "accepted" | "declined" | "expired"
  expires_at: string
  created_at: string
  updated_at: string

  // Relations
  conversation: Conversation
  inviter: User
  invitee: User
}

export interface GroupRole {
  id: string
  conversation_id: string
  name: string
  permissions: GroupPermissions
  color: string
  created_at: string
  updated_at: string
}

export interface GroupPermissions {
  can_send_messages: boolean
  can_send_media: boolean
  can_add_members: boolean
  can_remove_members: boolean
  can_edit_group: boolean
  can_delete_messages: boolean
  can_pin_messages: boolean
  can_manage_roles: boolean
}

// Message search and filtering
export interface MessageSearchResult {
  messages: Message[]
  total: number
  page: number
  limit: number
  has_more: boolean
  conversations: Conversation[]
}

export interface MessageSearchFilters {
  query: string
  conversation_id?: string
  sender_id?: string
  message_type?: Message["message_type"]
  has_media?: boolean
  date_from?: string
  date_to?: string
  limit?: number
  page?: number
}

// Chat analytics (for business accounts)
export interface ChatAnalytics {
  conversation_id: string
  total_messages: number
  total_participants: number
  active_participants: number
  messages_per_day: number
  response_time_avg: number // in minutes
  engagement_rate: number
  peak_hours: number[]
  participant_activity: {
    user_id: string
    messages_sent: number
    last_active: string
    response_time_avg: number
  }[]
  time_series: {
    date: string
    messages_count: number
    active_users: number
  }[]
}

// Push notification types for chat
export interface ChatNotification {
  id: string
  user_id: string
  conversation_id: string
  message_id: string | null
  type: "new_message" | "new_conversation" | "group_invite" | "call_incoming" | "call_missed"
  title: string
  body: string
  data: Record<string, any>
  sent_at: string
  read_at: string | null

  // Relations
  user: User
  conversation: Conversation
  message: Message | null
}
