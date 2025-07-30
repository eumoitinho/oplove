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
  
  // Create a wrapper div that intercepts clicks on the comment button
  const handlePostClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Check if we clicked on a button or its child
    let element: HTMLElement | null = target
    while (element && element !== e.currentTarget) {
      if (element.tagName === 'BUTTON' || element.closest('button')) {
        const button = element.tagName === 'BUTTON' ? element : element.closest('button')
        if (!button) break
        
        // Check if it's the comment button by looking for the MessageCircle icon
        const svg = button.querySelector('svg')
        if (svg && svg.querySelector('path')) {
          // The comment icon typically has a specific path
          const pathData = svg.querySelector('path')?.getAttribute('d')
          if (pathData && pathData.includes('M7.9')) { // MessageCircle path starts with M7.9
            e.preventDefault()
            e.stopPropagation()
            setShowComments(true)
            return
          }
        }
      }
      element = element.parentElement
    }
  }

  return (
    <>
      <div onClick={handlePostClick}>
        <PostCard
          post={post}
          onUpdate={onUpdate}
          className={className}
        />
      </div>

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