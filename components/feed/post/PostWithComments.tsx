"use client"

import { useState } from "react"
import { PostCard } from "./PostCard"
import { CommentsModal } from "../comments/CommentsModal"
import type { Post } from "@/types/common"

interface PostWithCommentsProps {
  post: Post
  onUpdate?: () => void
  className?: string
}

export function PostWithComments({ post, onUpdate, className }: PostWithCommentsProps) {
  const [showComments, setShowComments] = useState(false)
  
  const handleCommentClick = (postId: string) => {
    setShowComments(true)
  }

  return (
    <>
      <PostCard
        post={post}
        onCommentClick={handleCommentClick}
        className={className}
      />

      <CommentsModal
        isOpen={showComments}
        onClose={() => {
          setShowComments(false)
          onUpdate?.() // Refresh post to update comment count
        }}
        postId={post.id}
      />
    </>
  )
}