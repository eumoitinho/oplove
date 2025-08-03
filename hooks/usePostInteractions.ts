"use client"

import { useState } from "react"
import { toast } from "@/lib/services/toast-service"

interface UsePostInteractionsProps {
  postId: string
  initialLiked?: boolean
  initialSaved?: boolean
  initialLikesCount?: number
  initialCommentsCount?: number
  initialSharesCount?: number
  initialSavesCount?: number
}

export function usePostInteractions({
  postId,
  initialLiked = false,
  initialSaved = false,
  initialLikesCount = 0,
  initialCommentsCount = 0,
  initialSharesCount = 0,
  initialSavesCount = 0,
}: UsePostInteractionsProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [isSaved, setIsSaved] = useState(initialSaved)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [sharesCount, setSharesCount] = useState(initialSharesCount)
  const [savesCount, setSavesCount] = useState(initialSavesCount)
  const [isLoading, setIsLoading] = useState(false)

  // Like/Unlike post
  const handleLike = async () => {
    if (isLoading) return

    const newLikedState = !isLiked
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1

    // Optimistic update
    setIsLiked(newLikedState)
    setLikesCount(newLikesCount)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: newLikedState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Erro ao curtir post")
      }

      const data = await response.json()
      
      // Update with server data
      if (data.data) {
        setLikesCount(data.data.likes_count || newLikesCount)
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState)
      setLikesCount(likesCount)
      toast.error("Não foi possível curtir o post")
    } finally {
      setIsLoading(false)
    }
  }

  // Save/Unsave post
  const handleSave = async () => {
    if (isLoading) return

    const newSavedState = !isSaved
    const newSavesCount = newSavedState ? savesCount + 1 : savesCount - 1

    // Optimistic update
    setIsSaved(newSavedState)
    setSavesCount(newSavesCount)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/v1/posts/${postId}/save`, {
        method: newSavedState ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ collection_id: null }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar post")
      }

      const data = await response.json()
      
      // Update with server data
      if (data.saves_count !== undefined) {
        setSavesCount(data.saves_count)
      } else if (data.data?.saves_count !== undefined) {
        setSavesCount(data.data.saves_count)
      }
    } catch (error) {
      // Revert on error
      setIsSaved(!newSavedState)
      setSavesCount(savesCount)
      toast.error("Não foi possível salvar o post")
    } finally {
      setIsLoading(false)
    }
  }

  // Share post
  const handleShare = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/v1/posts/${postId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ shareType: "public" }),
      })

      if (!response.ok) {
        const error = await response.json()
        // If already shared, just copy link
        if (response.status === 409) {
          await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`)
          toast.success("Link copiado para sua área de transferência")
          return
        }
        throw new Error(error.error || "Erro ao compartilhar post")
      }

      const data = await response.json()
      
      // Update with server data
      if (data.shares_count !== undefined) {
        setSharesCount(data.shares_count)
      } else if (data.data?.shares_count !== undefined) {
        setSharesCount(data.data.shares_count)
      }

      // Copy link to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`)
      
      toast.success("Post compartilhado! Link copiado.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível compartilhar o post")
    } finally {
      setIsLoading(false)
    }
  }

  // Add comment (just opens modal, actual comment is handled separately)
  const handleComment = () => {
    // This will be handled by parent component to open comment modal
    return postId
  }
  
  // Update comment count (called after comment is added)
  const incrementCommentCount = () => {
    setCommentsCount(prev => prev + 1)
  }

  return {
    isLiked,
    isSaved,
    likesCount,
    commentsCount,
    sharesCount,
    savesCount,
    isLoading,
    handleLike,
    handleSave,
    handleShare,
    handleComment,
    incrementCommentCount,
  }
}