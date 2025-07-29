import type { User } from "./user" // Assuming User is defined in another file, e.g., user.ts

export interface Conversation {
  id: string
  type: "direct" | "group"
  name?: string
  description?: string
  avatar_url?: string
  participants: User[]
  last_message?: Message
  unread_count?: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender: User
  content?: string
  type: "text" | "image" | "video" | "audio" | "file"
  media_url?: string
  media_urls?: string[]
  file_name?: string
  file_size?: string
  reactions?: MessageReaction[]
  read_by?: MessageReadReceipt[]
  delivered_at?: string
  edited_at?: string
  created_at: string
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
}

export interface TypingIndicator {
  user_id: string
  user: User
  conversation_id: string
  is_typing: boolean
  updated_at: string
}
