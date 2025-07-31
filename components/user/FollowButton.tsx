"use client"

import { Button } from "@/components/ui/button"
import { useFollow } from "@/hooks/useFollow"
import { cn } from "@/lib/utils"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
  showIcon?: boolean
}

export function FollowButton({ 
  userId, 
  initialFollowing = false,
  size = "default",
  variant = "default",
  className,
  showIcon = true
}: FollowButtonProps) {
  const { following, loading, follow, unfollow } = useFollow(userId, initialFollowing)

  const handleClick = async () => {
    if (following) {
      await unfollow()
    } else {
      await follow()
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      size={size}
      variant={following ? "outline" : variant}
      className={cn(
        following && "hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {showIcon && (
            following ? 
              <UserMinus className="w-4 h-4 mr-2" /> : 
              <UserPlus className="w-4 h-4 mr-2" />
          )}
          {following ? "Seguindo" : "Seguir"}
        </>
      )}
    </Button>
  )
}