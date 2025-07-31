import { cn } from "@/lib/utils"
import { COMMUNITY_THEMES } from "@/types/community.types"
import type { CommunityTheme } from "@/types/community.types"

interface CommunityAvatarProps {
  theme: CommunityTheme
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-16 h-16 text-3xl",
  lg: "w-24 h-24 text-5xl",
  xl: "w-32 h-32 text-6xl"
}

const themeGradients = {
  cuckold: "from-purple-600 to-purple-800",
  bdsm: "from-red-600 to-red-900",
  swinger: "from-pink-500 to-pink-700",
  fetish: "from-orange-500 to-orange-700"
}

export function CommunityAvatar({ theme, size = "md", className }: CommunityAvatarProps) {
  const themeData = COMMUNITY_THEMES[theme]
  const gradient = themeGradients[theme]

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-gradient-to-br",
        gradient,
        sizeClasses[size],
        className
      )}
    >
      <span className="filter drop-shadow-lg">{themeData.icon}</span>
    </div>
  )
}