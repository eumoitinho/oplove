"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface PostActionsProps {
  post: {
    id: string
    _count: {
      likes: number
      comments: number
      shares: number
    }
    user_liked: boolean
  }
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
  userCanInteract: boolean
  className?: string
}

export function PostActions({ post, onLike, onComment, onShare, userCanInteract, className }: PostActionsProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(post.user_liked)
  const [likeCount, setLikeCount] = useState(post._count.likes)
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
      setLikeCount(post._count.likes)
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
          {post._count.comments > 0 && <span className="text-sm font-medium">{formatCount(post._count.comments)}</span>}
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
          {post._count.shares > 0 && <span className="text-sm font-medium">{formatCount(post._count.shares)}</span>}
        </Button>
      </div>

      {/* Bookmark Button */}
      {userCanInteract && (
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-500 transition-colors">
          <Bookmark className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
