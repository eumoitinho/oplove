"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/app/lib/supabase-browser"
import { useAuth } from "./useAuth"
import { toast } from "sonner"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface PostInteraction {
  id: string
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
  user_liked?: boolean
  user_saved?: boolean
  user_shared?: boolean
}

interface UsePostInteractionsOptions {
  postId?: string
  enableRealtime?: boolean
}

export function usePostInteractions({ postId, enableRealtime = true }: UsePostInteractionsOptions = {}) {
  const { user } = useAuth()
  const [interactions, setInteractions] = useState<PostInteraction | null>(null)
  const [loading, setLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const supabase = createClient()
  
  // Fetch initial interaction state
  const fetchInteractions = useCallback(async (id: string) => {
    if (!id) return
    
    try {
      setLoading(true)
      
      // Get post with counters
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id, likes_count, comments_count, shares_count, saves_count")
        .eq("id", id)
        .single()
      
      if (postError) throw postError
      
      // Check if user has interacted (if logged in)
      let userInteractions = {
        user_liked: false,
        user_saved: false,
        user_shared: false
      }
      
      if (user) {
        // Check likes
        const { data: like } = await supabase
          .from("post_likes")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
        
        // Check saves
        const { data: save } = await supabase
          .from("post_saves")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
        
        // Check shares
        const { data: share } = await supabase
          .from("post_shares")
          .select("id")
          .eq("post_id", id)
          .eq("user_id", user.id)
          .maybeSingle()
        
        userInteractions = {
          user_liked: !!like,
          user_saved: !!save,
          user_shared: !!share
        }
      }
      
      setInteractions({
        ...post,
        ...userInteractions
      })
    } catch (error) {
      console.error("Error fetching interactions:", error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])
  
  // Set up realtime subscription
  useEffect(() => {
    if (!postId || !enableRealtime) return
    
    let channel: RealtimeChannel | null = null
    
    const setupRealtime = async () => {
      // Subscribe to post updates
      channel = supabase
        .channel(`post-interactions:${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
            filter: `id=eq.${postId}`
          },
          (payload) => {
            console.log("Post updated:", payload)
            if (payload.new && typeof payload.new === "object") {
              setInteractions(prev => ({
                ...prev!,
                likes_count: (payload.new as any).likes_count || 0,
                comments_count: (payload.new as any).comments_count || 0,
                shares_count: (payload.new as any).shares_count || 0,
                saves_count: (payload.new as any).saves_count || 0
              }))
            }
          }
        )
        .subscribe()
    }
    
    setupRealtime()
    fetchInteractions(postId)
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [postId, enableRealtime, fetchInteractions, supabase])
  
  // Like/Unlike post
  const toggleLike = useCallback(async (id?: string) => {
    const targetId = id || postId
    if (!targetId || !user) {
      toast.error("Você precisa estar logado para curtir")
      return
    }
    
    try {
      setLikeLoading(true)
      const isLiked = interactions?.user_liked
      
      const response = await fetch(`/api/v1/posts/${targetId}/like`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao processar curtida")
      }
      
      const result = await response.json()
      
      // Update local state
      setInteractions(prev => prev ? {
        ...prev,
        likes_count: result.data.likes_count,
        user_liked: result.data.is_liked
      } : null)
      
    } catch (error: any) {
      console.error("Error toggling like:", error)
      toast.error(error.message || "Erro ao curtir post")
    } finally {
      setLikeLoading(false)
    }
  }, [postId, user, interactions?.user_liked])
  
  // Save/Unsave post
  const toggleSave = useCallback(async (id?: string) => {
    const targetId = id || postId
    if (!targetId || !user) {
      toast.error("Você precisa estar logado para salvar")
      return
    }
    
    try {
      setSaveLoading(true)
      const isSaved = interactions?.user_saved
      
      const response = await fetch(`/api/v1/posts/${targetId}/save`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao processar salvamento")
      }
      
      const result = await response.json()
      
      // Update local state
      setInteractions(prev => prev ? {
        ...prev,
        saves_count: result.data.saves_count,
        user_saved: result.data.is_saved
      } : null)
      
      toast.success(isSaved ? "Post removido dos salvos" : "Post salvo com sucesso")
      
    } catch (error: any) {
      console.error("Error toggling save:", error)
      toast.error(error.message || "Erro ao salvar post")
    } finally {
      setSaveLoading(false)
    }
  }, [postId, user, interactions?.user_saved])
  
  // Share post
  const sharePost = useCallback(async (id?: string, message?: string) => {
    const targetId = id || postId
    if (!targetId || !user) {
      toast.error("Você precisa estar logado para compartilhar")
      return
    }
    
    try {
      setShareLoading(true)
      
      const response = await fetch(`/api/v1/posts/${targetId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao compartilhar")
      }
      
      const result = await response.json()
      
      // Update local state
      setInteractions(prev => prev ? {
        ...prev,
        shares_count: result.data.shares_count,
        user_shared: result.data.is_shared
      } : null)
      
      toast.success("Post compartilhado com sucesso")
      
    } catch (error: any) {
      console.error("Error sharing post:", error)
      toast.error(error.message || "Erro ao compartilhar post")
    } finally {
      setShareLoading(false)
    }
  }, [postId, user])
  
  return {
    interactions,
    loading,
    likeLoading,
    saveLoading,
    shareLoading,
    toggleLike,
    toggleSave,
    sharePost,
    refetch: () => postId && fetchInteractions(postId)
  }
}