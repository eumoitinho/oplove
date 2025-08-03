"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserPlus, UserMinus, Users, MoreVertical, Heart } from "lucide-react"
import { useFriendship } from "@/hooks/useFriendship"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface FriendshipButtonProps {
  userId: string
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "secondary"
  showText?: boolean
}

export function FriendshipButton({ 
  userId, 
  className, 
  size = "default", 
  variant = "default",
  showText = true 
}: FriendshipButtonProps) {
  const { user } = useAuth()
  const { following, followedBy, mutual, friends, isLoading, toggleFollow, removeFriendship } = useFriendship({ userId })
  const [showDropdown, setShowDropdown] = useState(false)

  // Don't show for own profile
  if (!user || user.id === userId) {
    return null
  }

  const getButtonText = () => {
    if (!showText) return ""
    
    if (friends) return "Amigos"
    if (mutual) return "Amigos"
    if (following) return "Seguindo"
    return "Seguir"
  }

  const getButtonIcon = () => {
    if (friends || mutual) return <Heart className="h-4 w-4" />
    if (following) return <Users className="h-4 w-4" />
    return <UserPlus className="h-4 w-4" />
  }

  const getButtonVariant = () => {
    if (friends || mutual) return "secondary"
    if (following) return "outline"
    return variant
  }

  const handleMainAction = () => {
    if (friends || mutual) {
      setShowDropdown(true)
    } else {
      toggleFollow()
    }
  }

  return (
    <div className="relative">
      {(friends || mutual) ? (
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={getButtonVariant()}
              size={size}
              disabled={isLoading}
              className={cn("space-x-2", className)}
            >
              {getButtonIcon()}
              {showText && <span>{getButtonText()}</span>}
              <MoreVertical className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                removeFriendship()
                setShowDropdown(false)
              }}
              className="text-red-600"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Desfazer amizade
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                toggleFollow()
                setShowDropdown(false)
              }}
              className="text-orange-600"
            >
              <UserMinus className="h-4 w-4 mr-2" />
              Deixar de seguir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant={getButtonVariant()}
          size={size}
          disabled={isLoading}
          onClick={handleMainAction}
          className={cn("space-x-2", className)}
        >
          {getButtonIcon()}
          {showText && <span>{getButtonText()}</span>}
        </Button>
      )}
    </div>
  )
}

// Compact version for small spaces
export function FriendshipBadge({ userId, className }: { userId: string; className?: string }) {
  const { friends, mutual, following } = useFriendship({ userId })

  if (friends || mutual) {
    return (
      <div className={cn("inline-flex items-center space-x-1 text-xs text-green-600", className)}>
        <Heart className="h-3 w-3 fill-current" />
        <span>Amigos</span>
      </div>
    )
  }

  if (following) {
    return (
      <div className={cn("inline-flex items-center space-x-1 text-xs text-blue-600", className)}>
        <Users className="h-3 w-3" />
        <span>Seguindo</span>
      </div>
    )
  }

  return null
}