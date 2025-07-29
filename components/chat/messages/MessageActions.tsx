"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MoreHorizontal, Reply, Edit, Trash2, Copy, Smile, Flag, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Message } from "@/types/chat"

interface MessageActionsProps {
  message: Message
  isOwn: boolean
  onReact: (emoji: string) => void
  onEdit: () => void
  onDelete: () => void
  onReply: () => void
  onPin?: () => void
  onReport?: () => void
}

const quickReactions = ["❤️", "👍", "😂", "😮", "😢", "😡"]

export function MessageActions({
  message,
  isOwn,
  onReact,
  onEdit,
  onDelete,
  onReply,
  onPin,
  onReport,
}: MessageActionsProps) {
  const [showReactions, setShowReactions] = useState(false)

  const copyToClipboard = async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content)
      } catch (error) {
        console.error("Failed to copy message:", error)
      }
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {/* Quick reactions */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReactions(!showReactions)}
          className="h-8 w-8 p-0 bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
        >
          <Smile className="h-4 w-4" />
        </Button>

        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-50"
            >
              {quickReactions.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onReact(emoji)
                    setShowReactions(false)
                  }}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-lg"
                >
                  {emoji}
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reply button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onReply}
        className="h-8 w-8 p-0 bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
      >
        <Reply className="h-4 w-4" />
      </Button>

      {/* More actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Copy message */}
          {message.content && (
            <DropdownMenuItem onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar mensagem
            </DropdownMenuItem>
          )}

          {/* Pin message (for group admins) */}
          {onPin && (
            <DropdownMenuItem onClick={onPin}>
              <Pin className="h-4 w-4 mr-2" />
              Fixar mensagem
            </DropdownMenuItem>
          )}

          {isOwn ? (
            <>
              <DropdownMenuSeparator />
              {/* Edit message (only for text messages) */}
              {message.type === "text" && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}

              {/* Delete message */}
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuSeparator />
              {/* Report message */}
              {onReport && (
                <DropdownMenuItem onClick={onReport} className="text-red-600">
                  <Flag className="h-4 w-4 mr-2" />
                  Denunciar
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
