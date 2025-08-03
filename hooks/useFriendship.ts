"use client"

import { useState, useEffect } from "react"
import { toast } from "@/lib/services/toast-service"
import { useAuth } from "@/hooks/useAuth"

interface FriendshipStatus {
  following: boolean
  followedBy: boolean
  mutual: boolean
  friends: boolean
  isLoading: boolean
  error: string | null
}

interface UseFriendshipProps {
  userId: string
}

export function useFriendship({ userId }: UseFriendshipProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<FriendshipStatus>({
    following: false,
    followedBy: false,
    mutual: false,
    friends: false,
    isLoading: false,
    error: null
  })

  // Fetch friendship status
  const fetchStatus = async () => {
    if (!user || user.id === userId) return

    setStatus(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/v1/users/${userId}/follow`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar status de amizade')
      }

      const data = await response.json()
      
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          following: data.data.following,
          followedBy: data.data.followedBy,
          mutual: data.data.mutual,
          friends: data.data.friends,
          isLoading: false
        }))
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }

  // Follow/Unfollow user
  const toggleFollow = async () => {
    if (!user || status.isLoading) return

    const wasFollowing = status.following
    
    // Optimistic update
    setStatus(prev => ({
      ...prev,
      following: !wasFollowing,
      mutual: !wasFollowing && prev.followedBy,
      friends: !wasFollowing && prev.followedBy,
      isLoading: true
    }))

    try {
      const response = await fetch(`/api/v1/users/${userId}/follow`, {
        method: wasFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar seguimento')
      }

      const data = await response.json()
      
      if (data.success) {
        // Update with server response
        setStatus(prev => ({
          ...prev,
          following: data.data.following,
          friends: data.data.becameFriends || (wasFollowing ? false : prev.friends),
          mutual: data.data.following && prev.followedBy,
          isLoading: false
        }))

        if (data.data.becameFriends) {
          toast.success('Vocês agora são amigos! 🎉')
        } else if (data.data.following) {
          toast.success('Usuário seguido com sucesso')
        } else {
          toast.success('Usuário não seguido')
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (error) {
      // Revert optimistic update
      setStatus(prev => ({
        ...prev,
        following: wasFollowing,
        mutual: wasFollowing && prev.followedBy,
        friends: wasFollowing && prev.followedBy,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
      
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar seguimento')
    }
  }

  // Remove friendship
  const removeFriendship = async () => {
    if (!user || status.isLoading || !status.friends) return

    setStatus(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch(`/api/v1/users/${userId}/friendship`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao desfazer amizade')
      }

      const data = await response.json()
      
      if (data.success) {
        setStatus(prev => ({
          ...prev,
          following: false,
          followedBy: false,
          mutual: false,
          friends: false,
          isLoading: false
        }))

        toast.success('Amizade desfeita')
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
      
      toast.error(error instanceof Error ? error.message : 'Erro ao desfazer amizade')
    }
  }

  // Load status on mount
  useEffect(() => {
    fetchStatus()
  }, [userId, user?.id])

  return {
    ...status,
    toggleFollow,
    removeFriendship,
    refresh: fetchStatus
  }
}

// Helper hook for checking if users are friends
export function useAreFriends(userId: string): boolean {
  const { friends } = useFriendship({ userId })
  return friends
}

// Helper hook for getting follow button text
export function useFollowButtonText(status: FriendshipStatus): string {
  if (status.friends) return 'Amigos'
  if (status.following && status.followedBy) return 'Amigos'
  if (status.following) return 'Seguindo'
  return 'Seguir'
}