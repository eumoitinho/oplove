"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Download, Play, Pause } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useChatStore } from "@/lib/stores/chat-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageActions } from "./MessageActions"
import { ReadReceipts } from "../ui/ReadReceipts"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  isGroupChat?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true, isGroupChat = false }: MessageBubbleProps) {
  const { user } = useAuthStore()
  const { reactToMessage, deleteMessage, editMessage } = useChatStore()
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content || "")
  const [isPlaying, setIsPlaying] = useState(false)

  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const handleReaction = async (emoji: string) => {
    try {
      await reactToMessage(message.id, emoji)
    } catch (error) {
      console.error("Error reacting to message:", error)
    }
  }

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      try {
        await editMessage(message.id, editContent.trim())
        setIsEditing(false)
      } catch (error) {
        console.error("Error editing message:", error)
      }
    } else {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMessage(message.id)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const renderMessageContent = () => {
    switch (message.type) {
      case "text":
        return (
          <div className="break-words">
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleEdit}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.edited_at && <p className="text-xs text-gray-500 mt-1 italic">editado</p>}
              </>
            )}
          </div>
        )

      case "image":
        return (
          <div className="space-y-2">
            <img
              src={message.media_url || "/placeholder.svg"}
              alt="Imagem"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.media_url, "_blank")}
            />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case "video":
        return (
          <div className="space-y-2">
            <video src={message.media_url} controls className="max-w-xs rounded-lg" preload="metadata" playsInline />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 max-w-xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 w-8 p-0 rounded-full"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <div className="h-8 bg-purple-200 rounded-full relative overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full w-1/3"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">0:32</span>
          </div>
        )

      case "file":
        return (
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3 max-w-xs">
            <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{message.file_name}</p>
              <p className="text-xs text-gray-500">{message.file_size}</p>
            </div>
          </div>
        )

      default:
        return <p>Tipo de mensagem não suportado</p>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("flex space-x-3 group", isOwn ? "flex-row-reverse space-x-reverse" : "flex-row")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            {message.sender.full_name?.charAt(0) || message.sender.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col space-y-1 max-w-xs lg:max-w-md", isOwn && "items-end")}>
        {/* Sender name for group chats */}
        {isGroupChat && !isOwn && (
          <p className="text-xs text-gray-600 font-medium px-1">
            {message.sender.full_name || message.sender.username}
          </p>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={cn(
              "rounded-2xl px-4 py-2 shadow-sm",
              isOwn
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "bg-white border border-gray-200 text-gray-900",
            )}
          >
            {renderMessageContent()}
          </div>

          {/* Message actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn("absolute top-0 flex items-center space-x-1", isOwn ? "-left-20" : "-right-20")}
              >
                <MessageActions
                  message={message}
                  isOwn={isOwn}
                  onReact={handleReaction}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onReply={() => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Message info */}
        <div className={cn("flex items-center space-x-2 px-1", isOwn && "flex-row-reverse space-x-reverse")}>
          <span className="text-xs text-gray-500">{formatMessageTime(message.created_at)}</span>
          {isOwn && <ReadReceipts messageId={message.id} />}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {Object.entries(
              message.reactions.reduce(
                (acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              ),
            ).map(([emoji, count]) => (
              <Badge
                key={emoji}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-gray-200"
                onClick={() => handleReaction(emoji)}
              >
                {emoji} {count}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
