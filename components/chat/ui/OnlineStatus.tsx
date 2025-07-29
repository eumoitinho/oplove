"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface OnlineStatusProps {
  userId: string
  className?: string
  showText?: boolean
}

export function OnlineStatus({ userId, className, showText = false }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to user presence
    const channel = supabase
      .channel(`presence:${userId}`)
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState()
        const userPresence = presenceState[userId]
        setIsOnline(!!userPresence && userPresence.length > 0)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key === userId) {
          setIsOnline(true)
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        if (key === userId) {
          setIsOnline(false)
          // Update last seen
          setLastSeen(new Date().toISOString())
        }
      })
      .subscribe()

    // Get initial presence state
    const getInitialPresence = async () => {
      try {
        const { data } = await supabase
          .from("user_presence")
          .select("is_online, last_seen")
          .eq("user_id", userId)
          .single()

        if (data) {
          setIsOnline(data.is_online)
          setLastSeen(data.last_seen)
        }
      } catch (error) {
        console.error("Error fetching presence:", error)
      }
    }

    getInitialPresence()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const formatLastSeen = (timestamp: string) => {
    const now = new Date()
    const lastSeenDate = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "agora há pouco"
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`

    return lastSeenDate.toLocaleDateString("pt-BR")
  }

  if (showText) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <motion.div
          className={cn("h-2 w-2 rounded-full", isOnline ? "bg-green-500" : "bg-gray-400")}
          animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <span className="text-xs text-gray-600">
          {isOnline ? "Online" : lastSeen ? formatLastSeen(lastSeen) : "Offline"}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      className={cn("h-3 w-3 rounded-full border-2 border-white", isOnline ? "bg-green-500" : "bg-gray-400", className)}
      animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    />
  )
}
