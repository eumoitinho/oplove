"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface PostActionsProps {
  post?: {
    id: string
    likes_count?: number
    comments_count?: number
    shares_count?: number
    saves_count?: number
    user_liked?: boolean
    user_saved?: boolean
    // Legacy support for old format
    _count?: {
      likes?: number
      comments?: number
      shares?: number
    }
  }
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  onSave?: (postId: string) => void
  userCanInteract: boolean
  className?: string
}

export function PostActions({ post, onLike, onComment, onShare, onSave, userCanInteract, className }: PostActionsProps) {
  const { user } = useAuth()
  
  // Early return if post is undefined
  if (!post) {
    return null
  }
  
  const [isLiked, setIsLiked] = useState(post.user_liked || false)
  const [isSaved, setIsSaved] = useState(post.user_saved || false)
  // Use new field names with fallback to old format
  const [likeCount, setLikeCount] = useState(post.likes_count ?? post._count?.likes ?? 0)
  const [commentCount] = useState(post.comments_count ?? post._count?.comments ?? 0)
  const [shareCount] = useState(post.shares_count ?? post._count?.shares ?? 0)
  const [saveCount, setSaveCount] = useState(post.saves_count ?? 0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleLike = async () => {
    if (!userCanInteract || !onLike) return

    // Optimistic update
    setIsAnimating(true)
    setIsLiked(!isLiked)
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      await onLike(post.id)
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(post.likes_count ?? post._count?.likes ?? 0)
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  const handleComment = () => {
    if (!userCanInteract || !onComment) return
    onComment(post.id)
  }

  const handleShare = () => {
    if (!userCanInteract || !onShare) return
    onShare(post.id)
  }

  const handleSave = async () => {
    if (!userCanInteract || !onSave) return

    // Optimistic update
    setIsSaved(!isSaved)
    setSaveCount((prev) => (isSaved ? prev - 1 : prev + 1))

    try {
      await onSave(post.id)
    } catch (error) {
      // Revert on error
      setIsSaved(isSaved)
      setSaveCount(post.saves_count ?? 0)
    }
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
          disabled={!userCanInteract}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors",
            isLiked && "text-red-500",
            !userCanInteract && "opacity-50 cursor-not-allowed",
          )}
        >
          <motion.div animate={isAnimating ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={cn("h-5 w-5 transition-all duration-200", isLiked && "fill-current")} />
          </motion.div>
          {likeCount > 0 && <span className="text-sm font-medium">{formatCount(likeCount)}</span>}
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
          {commentCount > 0 && <span className="text-sm font-medium">{formatCount(commentCount)}</span>}
        </Button>

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={!userCanInteract}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors",
            !userCanInteract && "opacity-50 cursor-not-allowed",
          )}
        >
          <Share2 className="h-5 w-5" />
          {shareCount > 0 && <span className="text-sm font-medium">{formatCount(shareCount)}</span>}
        </Button>
      </div>

      {/* Bookmark Button */}
      {userCanInteract && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className={cn(
            "flex items-center space-x-2 text-gray-500 hover:text-purple-500 transition-colors",
            isSaved && "text-purple-500"
          )}
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
          {saveCount > 0 && <span className="text-sm font-medium">{formatCount(saveCount)}</span>}
        </Button>
      )}
    </div>
  )
}
