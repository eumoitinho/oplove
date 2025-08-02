"use client"

import { useState, useEffect, useRef } from "react"
import { PostCard } from "./PostCard"
import { CommentsModal } from "../comments/CommentsModal"
import type { Post } from "@/types/common"
import { useRealtimeDB } from "@/hooks/useRealtimeChannel"

interface PostWithCommentsProps {
  post: Post
  onUpdate?: () => void
  className?: string
}

export function PostWithComments({ post: initialPost, onUpdate, className }: PostWithCommentsProps) {
  const [showComments, setShowComments] = useState(false)
  const [post, setPost] = useState(initialPost)
  
  // Use realtime hooks for post updates
  useRealtimeDB({
    table: 'posts',
    filter: `id=eq.${post.id}`,
    event: 'UPDATE',
    onUpdate: (payload) => {
      if (payload.new) {
        setPost(prev => ({
          ...prev,
          likes_count: payload.new.likes_count || 0,
          comments_count: payload.new.comments_count || 0,
          shares_count: payload.new.shares_count || 0,
          saves_count: payload.new.saves_count || 0
        }))
      }
    }
  })
  
  // Track likes
  useRealtimeDB({
    table: 'post_likes',
    filter: `post_id=eq.${post.id}`,
    onInsert: (payload) => {
      setPost(prev => ({
        ...prev,
        likes_count: (prev.likes_count || 0) + 1,
        ...(payload.new.user_id === prev.user_id && { is_liked: true })
      }))
    },
    onDelete: (payload) => {
      setPost(prev => ({
        ...prev,
        likes_count: Math.max(0, (prev.likes_count || 0) - 1),
        ...(payload.old?.user_id === prev.user_id && { is_liked: false })
      }))
    }
  })
  
  // Track comments
  useRealtimeDB({
    table: 'comments',
    filter: `post_id=eq.${post.id}`,
    event: 'INSERT',
    onInsert: (payload) => {
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }))
    }
  })
  
  // Update when props change
  useEffect(() => {
    setPost(initialPost)
  }, [initialPost])
  
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