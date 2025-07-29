"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface OnlineBadgeProps {
  isOnline: boolean
  lastSeen?: string
  size?: "sm" | "md" | "lg"
  position?: "bottom-right" | "top-right" | "bottom-left" | "top-left"
  showLabel?: boolean
  animated?: boolean
  className?: string
}

/**
 * Online status badge component
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <img src={avatar || "/placeholder.svg"} className="h-10 w-10 rounded-full" />
 *   <OnlineBadge isOnline={true} size="sm" position="bottom-right" />
 * </div>
 *
 * <OnlineBadge
 *   isOnline={false}
 *   lastSeen="2 horas atrás"
 *   showLabel
 *   animated
 * />
 * ```
 */
export function OnlineBadge({
  isOnline,
  lastSeen,
  size = "md",
  position = "bottom-right",
  showLabel = false,
  animated = true,
  className,
}: OnlineBadgeProps) {
  const sizeClasses = {
    sm: {
      dot: "h-2.5 w-2.5",
      border: "border-2",
      text: "text-xs",
    },
    md: {
      dot: "h-3 w-3",
      border: "border-2",
      text: "text-sm",
    },
    lg: {
      dot: "h-4 w-4",
      border: "border-2",
      text: "text-base",
    },
  }

  const positionClasses = {
    "bottom-right": "-bottom-0.5 -right-0.5",
    "top-right": "-top-0.5 -right-0.5",
    "bottom-left": "-bottom-0.5 -left-0.5",
    "top-left": "-top-0.5 -left-0.5",
  }

  const currentSize = sizeClasses[size]

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Agora mesmo"
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`

    return date.toLocaleDateString("pt-BR")
  }

  if (showLabel) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <motion.div
          className={cn(
            "rounded-full",
            currentSize.dot,
            currentSize.border,
            isOnline
              ? "bg-green-500 border-white dark:border-gray-800"
              : "bg-gray-400 border-white dark:border-gray-800",
          )}
          animate={
            animated && isOnline
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
                }
              : undefined
          }
          transition={
            animated
              ? {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }
              : undefined
          }
        />
        <span
          className={cn(
            currentSize.text,
            isOnline ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400",
          )}
        >
          {isOnline ? "Online" : lastSeen ? formatLastSeen(lastSeen) : "Offline"}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "absolute rounded-full",
        currentSize.dot,
        currentSize.border,
        positionClasses[position],
        isOnline ? "bg-green-500 border-white dark:border-gray-800" : "bg-gray-400 border-white dark:border-gray-800",
        className,
      )}
      animate={
        animated && isOnline
          ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1],
            }
          : undefined
      }
      transition={
        animated
          ? {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
          : undefined
      }
      title={isOnline ? "Online" : lastSeen ? `Visto ${formatLastSeen(lastSeen)}` : "Offline"}
    />
  )
}

/**
 * Online users list component
 */
export function OnlineUsersList({
  users,
  maxVisible = 5,
}: {
  users: Array<{
    id: string
    name: string
    avatar?: string
    isOnline: boolean
    lastSeen?: string
  }>
  maxVisible?: number
}) {
  const onlineUsers = users.filter((user) => user.isOnline)
  const visibleUsers = onlineUsers.slice(0, maxVisible)
  const remainingCount = onlineUsers.length - maxVisible

  if (onlineUsers.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum usuário online no momento</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Online ({onlineUsers.length})</h3>
      <div className="space-y-2">
        {visibleUsers.map((user) => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <OnlineBadge isOnline={user.isOnline} size="sm" />
            </div>
            <span className="text-sm text-gray-900 dark:text-white">{user.name}</span>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 pl-11">+{remainingCount} outros online</div>
        )}
      </div>
    </div>
  )
}
