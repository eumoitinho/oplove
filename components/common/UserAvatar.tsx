"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Gem, Star, Crown, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user?: {
    avatar_url?: string | null
    name?: string | null
    username?: string | null
    premium_type?: "free" | "gold" | "diamond" | "couple"
    is_verified?: boolean
  }
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showPlanBadge?: boolean
  className?: string
  fallbackClassName?: string
}

const sizeClasses = {
  xs: "w-6 h-6",
  sm: "w-8 h-8", 
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16"
}

const badgeSizes = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3", 
  lg: "w-3.5 h-3.5",
  xl: "w-4 h-4"
}

export function UserAvatar({ 
  user, 
  size = "md", 
  showPlanBadge = false,
  className,
  fallbackClassName 
}: UserAvatarProps) {
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .slice(0, 2)
        .map(name => name.charAt(0).toUpperCase())
        .join('')
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getPlanBadge = () => {
    if (!showPlanBadge || !user?.premium_type || user.premium_type === 'free') {
      return null
    }

    const badgeConfig = {
      gold: { 
        icon: Crown, 
        className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white" 
      },
      diamond: { 
        icon: Gem, 
        className: "bg-gradient-to-r from-purple-500 to-cyan-500 text-white" 
      },
      couple: { 
        icon: Flame, 
        className: "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
      }
    }

    const config = badgeConfig[user.premium_type as keyof typeof badgeConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full flex items-center justify-center",
        badgeSizes[size],
        config.className
      )}>
        <Icon className="w-full h-full p-0.5" />
      </div>
    )
  }

  return (
    <div className="relative">
      <Avatar className={cn(
        sizeClasses[size],
        "ring-2 ring-gray-200 dark:ring-white/10 relative overflow-hidden",
        className
      )}>
        {user?.avatar_url ? (
          <div className="relative w-full h-full">
            <AvatarImage 
              src={user.avatar_url} 
              alt={user?.name || user?.username || "User avatar"}
              className="select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                WebkitUserDrag: 'none'
              }}
            />
            {/* Mini watermark for avatar */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 font-mono text-xs font-bold whitespace-nowrap"
                style={{
                  fontSize: size === 'xs' ? '6px' : size === 'sm' ? '7px' : size === 'md' ? '8px' : size === 'lg' ? '9px' : '10px',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  zIndex: 10
                }}
              >
                @{user?.username || 'user'}
              </div>
            </div>
          </div>
        ) : (
          <AvatarFallback className={cn(
            "bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold",
            size === "xs" && "text-xs",
            size === "sm" && "text-xs", 
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg",
            fallbackClassName
          )}>
            {getInitials()}
          </AvatarFallback>
        )}
      </Avatar>
      {getPlanBadge()}
    </div>
  )
}