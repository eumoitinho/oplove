"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Crown, Shield, Check, CheckCheck } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { OnlineStatus } from "../ui/OnlineStatus"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/types/chat"

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { user } = useAuthStore()

  const otherParticipant =
    conversation.type === "direct" ? conversation.participants.find((p) => p.id !== user?.id) : null

  const displayName =
    conversation.type === "group" ? conversation.name : otherParticipant?.full_name || otherParticipant?.username

  const displayAvatar = conversation.type === "group" ? conversation.avatar_url : otherParticipant?.avatar_url

  const lastMessage = conversation.last_message
  const unreadCount = conversation.unread_count || 0

  const formatLastMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const getMessageStatusIcon = () => {
    if (!lastMessage || lastMessage.sender_id !== user?.id) return null

    if (lastMessage.read_by?.length > 1) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />
    } else if (lastMessage.delivered_at) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />
    } else {
      return <Check className="h-3 w-3 text-gray-400" />
    }
  }

  const getPremiumBadge = (premiumType: string) => {
    switch (premiumType) {
      case "diamond":
        return <Crown className="h-3 w-3 text-purple-500" />
      case "gold":
        return <Shield className="h-3 w-3 text-yellow-500" />
      case "couple":
        return <div className="h-3 w-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
      default:
        return null
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
        isActive ? "bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200" : "hover:bg-gray-50",
      )}
    >
      {/* Avatar */}
      <div className="relative">
        {conversation.type === "group" ? (
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayAvatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Users className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <Badge
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {conversation.participants.length}
            </Badge>
          </div>
        ) : (
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayAvatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherParticipant && <OnlineStatus userId={otherParticipant.id} className="absolute -bottom-1 -right-1" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
            {conversation.type === "direct" && otherParticipant?.premium_type !== "free" && (
              <div className="flex-shrink-0">{getPremiumBadge(otherParticipant.premium_type)}</div>
            )}
            {otherParticipant?.is_verified && (
              <div className="flex-shrink-0">
                <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {lastMessage && (
              <span className="text-xs text-gray-500">{formatLastMessageTime(lastMessage.created_at)}</span>
            )}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {lastMessage && (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-600 truncate flex-1">
              {lastMessage.type === "text" && lastMessage.content}
              {lastMessage.type === "image" && "📷 Imagem"}
              {lastMessage.type === "video" && "🎥 Vídeo"}
              {lastMessage.type === "audio" && "🎵 Áudio"}
              {lastMessage.type === "file" && "📎 Arquivo"}
            </p>
            <div className="flex-shrink-0">{getMessageStatusIcon()}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
