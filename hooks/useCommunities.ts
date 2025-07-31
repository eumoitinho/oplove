import { useState, useEffect } from 'react'
import { communityService } from '@/lib/services/community.service'
import { useAuth } from './useAuth'
import type { Community } from '@/types/community.types'

export function useCommunities() {
  const { user } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [userCommunities, setUserCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCommunities()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserCommunities()
    }
  }, [user])

  const loadCommunities = async () => {
    try {
      setLoading(true)
      const data = await communityService.getCommunities()
      setCommunities(data)
      setError(null)
    } catch (err) {
      setError('Erro ao carregar comunidades')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadUserCommunities = async () => {
    if (!user) return
    
    try {
      const data = await communityService.getUserCommunities(user.id)
      setUserCommunities(data)
    } catch (err) {
      console.error('Erro ao carregar comunidades do usuário:', err)
    }
  }

  const joinCommunity = async (communityId: string) => {
    if (!user) return { success: false, message: 'Você precisa estar logado' }
    
    const result = await communityService.joinCommunity(communityId, user.id)
    
    if (result.success) {
      // Reload user communities
      await loadUserCommunities()
      
      // Update local state
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, members_count: c.members_count + 1 } : c
      ))
    }
    
    return result
  }

  const leaveCommunity = async (communityId: string) => {
    if (!user) return false
    
    const success = await communityService.leaveCommunity(communityId, user.id)
    
    if (success) {
      // Reload user communities
      await loadUserCommunities()
      
      // Update local state
      setCommunities(prev => prev.map(c => 
        c.id === communityId ? { ...c, members_count: c.members_count - 1 } : c
      ))
      
      setUserCommunities(prev => prev.filter(c => c.id !== communityId))
    }
    
    return success
  }

  const isUserMember = (communityId: string) => {
    return userCommunities.some(c => c.id === communityId)
  }

  return {
    communities,
    userCommunities,
    loading,
    error,
    joinCommunity,
    leaveCommunity,
    isUserMember,
    refresh: loadCommunities
  }
}