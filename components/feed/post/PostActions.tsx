"use client"

import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePostInteractions } from "@/hooks/usePostInteractions"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface PostActionsProps {
  post?: {
    id: string
    likes_count?: number
    comments_count?: number
    shares_count?: number
    saves_count?: number
    user_liked?: boolean
    user_saved?: boolean
    user_shared?: boolean
    // Legacy support for old format
    _count?: {
      likes?: number
      comments?: number
      shares?: number
    }
  }
  onComment?: (postId: string) => void
  userCanInteract: boolean
  className?: string
  enableRealtime?: boolean
}

export function PostActions({ 
  post, 
  onComment, 
  userCanInteract, 
  className,
  enableRealtime = true
}: PostActionsProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Use the new hook for interactions
  const {
    interactions,
    likeLoading,
    saveLoading,
    shareLoading,
    toggleLike,
    toggleSave,
    sharePost
  } = usePostInteractions({ 
    postId: post?.id, 
    enableRealtime 
  })
  
  // Early return if post is undefined
  if (!post) {
    return null
  }
  
  // Use data from hook or fallback to props
  const likesCount = interactions?.likes_count ?? post.likes_count ?? post._count?.likes ?? 0
  const commentsCount = interactions?.comments_count ?? post.comments_count ?? post._count?.comments ?? 0
  const sharesCount = interactions?.shares_count ?? post.shares_count ?? post._count?.shares ?? 0
  const savesCount = interactions?.saves_count ?? post.saves_count ?? 0
  
  const isLiked = interactions?.user_liked ?? post.user_liked ?? false
  const isSaved = interactions?.user_saved ?? post.user_saved ?? false
  const isShared = interactions?.user_shared ?? post.user_shared ?? false

  const handleLike = async () => {
    if (!userCanInteract) return
    setIsAnimating(true)
    await toggleLike()
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleComment = () => {
    if (!userCanInteract || !onComment) return
    onComment(post.id)
  }

  const handleShare = async () => {
    if (!userCanInteract) return
    await sharePost()
  }

  const handleSave = async () => {
    if (!userCanInteract) return
    await toggleSave()
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className={cn("flex items-center justify-between pt-2", className)}>
      <div className="flex items-center space-x-6">
        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={!userCanInteract || likeLoading}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors",
            isLiked && "text-red-500",
            !userCanInteract && "opacity-50 cursor-not-allowed",
          )}
        >
          {likeLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <motion.div animate={isAnimating ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart className={cn("h-5 w-5 transition-all duration-200", isLiked && "fill-current")} />
            </motion.div>
          )}
          {likesCount > 0 && <span className="text-sm font-medium">{formatCount(likesCount)}</span>}
        </Button>

        {/* Comment Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleComment}
          disabled={!userCanInteract}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors",
            !userCanInteract && "opacity-50 cursor-not-allowed",
          )}
        >
          <MessageCircle className="h-5 w-5" />
          {commentsCount > 0 && <span className="text-sm font-medium">{formatCount(commentsCount)}</span>}
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={!userCanInteract || shareLoading}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors",
            isShared && "text-green-500",
            !userCanInteract && "opacity-50 cursor-not-allowed",
          )}
        >
          {shareLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Share2 className={cn("h-5 w-5", isShared && "fill-current")} />
          )}
          {sharesCount > 0 && <span className="text-sm font-medium">{formatCount(sharesCount)}</span>}
        </Button>
      </div>

      {/* Save Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={!userCanInteract || saveLoading}
        className={cn(
          "flex items-center space-x-2 text-gray-500 hover:text-yellow-500 transition-colors",
          isSaved && "text-yellow-500",
          !userCanInteract && "opacity-50 cursor-not-allowed",
        )}
      >
        {saveLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Bookmark className={cn("h-5 w-5 transition-all duration-200", isSaved && "fill-current")} />
        )}
        {savesCount > 0 && <span className="text-sm font-medium">{formatCount(savesCount)}</span>}
      </Button>
    </div>
  )
}