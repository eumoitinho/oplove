"use client"

import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"

interface FollowState {
  following: boolean
  loading: boolean
  error: string | null
}

export function useFollow(userId: string, initialFollowing = false) {
  const [state, setState] = useState<FollowState>({
    following: initialFollowing,
    loading: false,
    error: null
  })

  const follow = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await api.post(`/api/v1/users/${userId}/follow`)
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
      
      setState(prev => ({ ...prev, loading: false, following: true }))
      return { success: true, data }
    } catch (error) {
      const errorMessage = "Erro ao seguir usuário"
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [userId])

  const unfollow = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await api.delete(`/api/v1/users/${userId}/follow`)
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
      
      setState(prev => ({ ...prev, loading: false, following: false }))
      return { success: true, data }
    } catch (error) {
      const errorMessage = "Erro ao deixar de seguir usuário"
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [userId])

  const toggle = useCallback(async () => {
    return state.following ? await unfollow() : await follow()
  }, [state.following, follow, unfollow])

  const checkFollowing = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await api.get(`/api/v1/users/${userId}/follow`)
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }))
        return
      }
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        following: data?.following || false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Erro ao verificar status de seguidor" 
      }))
    }
  }, [userId])

  return {
    ...state,
    follow,
    unfollow,
    toggle,
    checkFollowing
  }
}