"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Heart, MessageCircle, UserPlus, Eye, Sparkles, Star, Gift } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export type ToastType = 
  | "new_post" 
  | "like" 
  | "comment" 
  | "follow" 
  | "message" 
  | "visit" 
  | "story_view"
  | "gift_received"

interface ToastUser {
  id: string
  name: string
  username: string
  avatar_url?: string
  is_verified?: boolean
  premium_type?: "gold" | "diamond" | "couple" | null
}

interface EngagementToastProps {
  id: string
  type: ToastType
  users: ToastUser[]
  count?: number
  message?: string
  onClose: () => void
  onAction?: () => void
  duration?: number
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right"
}

const toastIcons: Record<ToastType, React.ElementType> = {
  new_post: Sparkles,
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  visit: Eye,
  story_view: Eye,
  gift_received: Gift,
}

const toastMessages: Record<ToastType, (users: ToastUser[], count?: number) => string> = {
  new_post: (users, count) => {
    if (count && count > 1) return `${count} novos posts no seu feed`
    return `${users[0]?.name || "Alguém"} publicou algo novo`
  },
  like: (users, count) => {
    if (count && count > 1) return `${count} pessoas curtiram seu post`
    return `${users[0]?.name || "Alguém"} curtiu seu post`
  },
  comment: (users, count) => {
    if (count && count > 1) return `${count} novos comentários`
    return `${users[0]?.name || "Alguém"} comentou em seu post`
  },
  follow: (users, count) => {
    if (count && count > 1) return `${count} pessoas começaram a seguir você`
    return `${users[0]?.name || "Alguém"} começou a seguir você`
  },
  message: (users, count) => {
    if (count && count > 1) return `${count} novas mensagens`
    return `${users[0]?.name || "Alguém"} enviou uma mensagem`
  },
  visit: (users, count) => {
    if (count && count > 1) return `${count} pessoas visitaram seu perfil`
    return `${users[0]?.name || "Alguém"} visitou seu perfil`
  },
  story_view: (users, count) => {
    if (count && count > 1) return `${count} pessoas viram seu story`
    return `${users[0]?.name || "Alguém"} viu seu story`
  },
  gift_received: (users) => {
    return `${users[0]?.name || "Alguém"} enviou um presente para você`
  },
}

const actionMessages: Partial<Record<ToastType, string>> = {
  new_post: "Ver agora",
  message: "Responder",
  follow: "Ver perfil",
  visit: "Ver quem visitou",
}

export function EngagementToast({
  id,
  type,
  users,
  count,
  message,
  onClose,
  onAction,
  duration = type === "new_post" ? 0 : 5000, // New posts don't auto-dismiss
  position = "top-center",
}: EngagementToastProps) {
  const router = useRouter()
  const Icon = toastIcons[type]
  const displayMessage = message || toastMessages[type](users, count)
  const actionText = actionMessages[type]

  useEffect(() => {
    if (duration === 0) return

    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const positionClasses = {
    "top-center": "top-24 left-1/2 -translate-x-1/2",
    "top-right": "top-24 right-4",
    "bottom-center": "bottom-24 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-24 right-4",
  }

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn("fixed z-50", positionClasses[position])}
    >
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-md">
        {/* Header with gradient background */}
        <div className="relative p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-cyan-500/20">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-white/80"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Icon and message */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white pr-8">
              {displayMessage}
            </p>
          </div>
        </div>

        {/* User avatars section */}
        {users.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              {/* Show up to 3 avatars */}
              <div className="flex -space-x-2">
                {users.slice(0, 3).map((user, index) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="relative group"
                    style={{ zIndex: 3 - index }}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 overflow-hidden bg-gray-200 dark:bg-gray-700 group-hover:scale-110 transition-transform">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Verification badge */}
                    {user.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </button>
                ))}
                {/* Show +X more indicator */}
                {count && count > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{count - 3}
                    </span>
                  </div>
                )}
              </div>

              {/* User names */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {users.length === 1 ? (
                    <>
                      <span className="font-medium text-gray-900 dark:text-white">
                        @{users[0].username}
                      </span>
                      {users[0].premium_type && (
                        <span className={cn(
                          "ml-1 text-xs",
                          users[0].premium_type === "diamond" && "text-purple-600 dark:text-purple-400",
                          users[0].premium_type === "gold" && "text-yellow-600 dark:text-yellow-400",
                          users[0].premium_type === "couple" && "text-pink-600 dark:text-pink-400"
                        )}>
                          {users[0].premium_type === "diamond" && "💎"}
                          {users[0].premium_type === "gold" && "⭐"}
                          {users[0].premium_type === "couple" && "💑"}
                        </span>
                      )}
                    </>
                  ) : (
                    `${users[0].username} e outros`
                  )}
                </p>
              </div>
            </div>

            {/* Action button */}
            {actionText && onAction && (
              <Button
                onClick={onAction}
                size="sm"
                className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {actionText}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Toast container to manage multiple toasts
interface ToastData extends Omit<EngagementToastProps, 'onClose'> {
  id: string
}

export function EngagementToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Expose global function to show toasts
  useEffect(() => {
    // @ts-ignore
    window.showEngagementToast = (toast: Omit<ToastData, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      setToasts(prev => [...prev, { ...toast, id }])
    }

    return () => {
      // @ts-ignore
      delete window.showEngagementToast
    }
  }, [])

  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <EngagementToast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
          position={index === 0 ? "top-center" : "top-right"}
          style={{
            transform: index > 0 ? `translateY(${index * 80}px)` : undefined
          }}
        />
      ))}
    </AnimatePresence>
  )
}