'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { realtimeService } from '@/lib/services/realtime-service'

interface OptimisticLikeState {
  isLiked: boolean
  likesCount: number
  isAnimating: boolean
  isPending: boolean
}

interface UseOptimisticLikeOptions {
  postId: string
  initialLiked?: boolean
  initialCount?: number
  onLikeSuccess?: () => void
  onLikeError?: (error: Error) => void
}

/**
 * Hook for optimistic like/unlike with instant feedback
 * 
 * Features:
 * - Instant visual feedback (<50ms)
 * - Automatic rollback on error
 * - Debounce for rapid clicks
 * - Real-time sync via Supabase
 * - Animation states
 */
export function useOptimisticLike({
  postId,
  initialLiked = false,
  initialCount = 0,
  onLikeSuccess,
  onLikeError
}: UseOptimisticLikeOptions) {
  const { user } = useAuth()
  const [state, setState] = useState<OptimisticLikeState>({
    isLiked: initialLiked,
    likesCount: initialCount,
    isAnimating: false,
    isPending: false
  })
  
  // Track pending request to prevent duplicates
  const pendingRequest = useRef<AbortController | null>(null)
  const rollbackTimeout = useRef<NodeJS.Timeout | null>(null)
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!postId) return
    
    const unsubscribe = realtimeService.subscribeToPostInteractions(postId, {
      onLike: (payload) => {
        // Update count based on real-time changes
        if (payload.eventType === 'INSERT') {
          // Someone liked the post
          setState(prev => ({
            ...prev,
            likesCount: prev.likesCount + 1,
            // Update isLiked if it's the current user
            isLiked: payload.new.user_id === user?.id ? true : prev.isLiked
          }))
        } else if (payload.eventType === 'DELETE') {
          // Someone unliked the post
          setState(prev => ({
            ...prev,
            likesCount: Math.max(0, prev.likesCount - 1),
            // Update isLiked if it's the current user
            isLiked: payload.old?.user_id === user?.id ? false : prev.isLiked
          }))
        }
      }
    })
    
    return unsubscribe
  }, [postId, user?.id])
  
  const toggleLike = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir')
      return
    }
    
    // Abort previous request if pending
    if (pendingRequest.current) {
      pendingRequest.current.abort()
    }
    
    // Clear rollback timeout
    if (rollbackTimeout.current) {
      clearTimeout(rollbackTimeout.current)
    }
    
    // Optimistic update - INSTANT feedback
    const wasLiked = state.isLiked
    const previousCount = state.likesCount
    
    setState(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1,
      isAnimating: true,
      isPending: true
    }))
    
    // Stop animation after 600ms
    setTimeout(() => {
      setState(prev => ({ ...prev, isAnimating: false }))
    }, 600)
    
    // Create new abort controller
    const controller = new AbortController()
    pendingRequest.current = controller
    
    try {
      // Always use POST - the API now handles toggle logic
      const response = await fetch(`/api/v1/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao processar curtida')
      }
      
      const result = await response.json()
      
      // Update with server response (should match optimistic update)
      setState(prev => ({
        ...prev,
        likesCount: result.data.likes_count,
        isLiked: result.data.is_liked,
        isPending: false
      }))
      
      // Success callback
      onLikeSuccess?.()
      
      // Show feedback for special cases
      if (!wasLiked && result.data.mutual_like) {
        toast.success(`${result.data.mutual_user} também curtiu você! 💕`, {
          action: {
            label: 'Enviar mensagem',
            onClick: () => {
              // Navigate to messages
              window.location.href = `/messages?user=${result.data.mutual_user_id}`
            }
          }
        })
      }
      
    } catch (error: any) {
      // Rollback on error
      if (error.name !== 'AbortError') {
        console.error('Error toggling like:', error)
        
        // Rollback optimistic update
        setState({
          isLiked: wasLiked,
          likesCount: previousCount,
          isAnimating: false,
          isPending: false
        })
        
        // Error callback
        onLikeError?.(error)
        
        // Show error toast
        toast.error(error.message || 'Erro ao processar curtida')
      }
    } finally {
      pendingRequest.current = null
    }
  }, [postId, user, state.isLiked, state.likesCount, onLikeSuccess, onLikeError])
  
  // Quick double-tap to like (mobile pattern)
  const doubleTapRef = useRef<number>(0)
  
  const handleDoubleTap = useCallback(() => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - doubleTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - only like, never unlike
      if (!state.isLiked) {
        toggleLike()
      } else {
        // Already liked - show animation only
        setState(prev => ({ ...prev, isAnimating: true }))
        setTimeout(() => {
          setState(prev => ({ ...prev, isAnimating: false }))
        }, 600)
      }
      doubleTapRef.current = 0
    } else {
      doubleTapRef.current = now
    }
  }, [state.isLiked, toggleLike])
  
  return {
    isLiked: state.isLiked,
    likesCount: state.likesCount,
    isAnimating: state.isAnimating,
    isPending: state.isPending,
    toggleLike,
    handleDoubleTap
  }
}