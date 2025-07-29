"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/types/common"

interface TypingIndicatorProps {
  users: User[]
  isGroupChat?: boolean
}

export function TypingIndicator({ users, isGroupChat = false }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const formatTypingText = () => {
    if (users.length === 1) {
      const user = users[0]
      const name = user.full_name || user.username
      return isGroupChat ? `${name} está digitando...` : "está digitando..."
    } else if (users.length === 2) {
      const names = users.map((u) => u.full_name || u.username)
      return `${names.join(" e ")} estão digitando...`
    } else {
      return `${users.length} pessoas estão digitando...`
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center space-x-3 px-4 py-2"
    >
      {/* Avatars */}
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
              {user.full_name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Typing text and animation */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{formatTypingText()}</span>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
