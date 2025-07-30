"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

export interface DatingProfile {
  id: string
  userId: string
  user: {
    username: string
    full_name: string
    avatar_url: string
    age: number
    location: string
    is_verified: boolean
    premium_type: string
  }
  bio: string
  photos: {
    url: string
    caption?: string
    is_verified: boolean
    order: number
  }[]
  prompts: {
    question: string
    answer: string
  }[]
  interests: string[]
  preferences: {
    age_range: { min: number; max: number }
    distance: number
    genders: string[]
    interests: string[]
    relationship_goals: string[]
  }
  distance?: number
  lastActive: string
  isOnline: boolean
}

export interface DatingMatch {
  id: string
  user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    is_verified: boolean
  }
  match_type: 'regular' | 'super_like' | 'top_pick'
  created_at: string
  last_interaction?: string
  conversation_id?: string
  is_new: boolean
}

export interface SwipeLimits {
  daily_likes_limit: number
  daily_likes_used: number
  daily_super_likes_limit: number
  daily_super_likes_used: number
  daily_rewinds_limit: number
  daily_rewinds_used: number
  boost_active: boolean
  boost_expires_at?: string
}

export interface DatingStats {
  total_likes_given: number
  total_likes_received: number
  total_super_likes_given: number
  total_super_likes_received: number
  total_matches: number
  profile_views: number
  conversion_rate: number
}

export function useDating() {
  const { user } = useAuth()
  const [myProfile, setMyProfile] = useState<DatingProfile | null>(null)
  const [profiles, setProfiles] = useState<DatingProfile[]>([])
  const [matches, setMatches] = useState<DatingMatch[]>([])
  const [limits, setLimits] = useState<SwipeLimits>({
    daily_likes_limit: 0,
    daily_likes_used: 0,
    daily_super_likes_limit: 0,
    daily_super_likes_used: 0,
    daily_rewinds_limit: 0,
    daily_rewinds_used: 0,
    boost_active: false
  })
  const [stats, setStats] = useState<DatingStats>({
    total_likes_given: 0,
    total_likes_received: 0,
    total_super_likes_given: 0,
    total_super_likes_received: 0,
    total_matches: 0,
    profile_views: 0,
    conversion_rate: 0
  })
  const [loading, setLoading] = useState(false)

  // Check if user has access to dating features
  const hasAccess = user?.premium_type && ['gold', 'diamond'].includes(user.premium_type) && !user.is_in_couple
  const isDiamond = user?.premium_type === 'diamond'

  useEffect(() => {
    if (hasAccess) {
      loadMyProfile()
      loadLimits()
      loadMatches()
      loadStats()
    }
  }, [hasAccess, user])

  const loadMyProfile = async () => {
    if (!user) return

    try {
      // TODO: Implement real API call
      // const response = await fetch('/api/dating/profile')
      // const data = await response.json()
      
      // For now, return null if no profile exists
      setMyProfile(null)
    } catch (error) {
      console.error('Error loading dating profile:', error)
    }
  }

  const loadProfiles = async (filters?: {
    age_range?: { min: number; max: number }
    distance?: number
    interests?: string[]
  }) => {
    setLoading(true)
    try {
      // TODO: Implement real API call with recommendation algorithm
      // const response = await fetch('/api/dating/profiles', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ filters, limit: 20 })
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock profiles for demo
      const mockProfiles: DatingProfile[] = [
        {
          id: '1',
          userId: 'user1',
          user: {
            username: 'maria_silva',
            full_name: 'Maria Silva',
            avatar_url: '/profile1.jpg',
            age: 28,
            location: 'São Paulo, SP',
            is_verified: true,
            premium_type: 'diamond'
          },
          bio: 'Apaixonada por viagens e fotografia. Procurando alguém para explorar o mundo junto! 📸✈️',
          photos: [
            { url: '/profile1.jpg', is_verified: true, order: 1 },
            { url: '/profile1-2.jpg', is_verified: false, caption: 'Em Paris 🇫🇷', order: 2 }
          ],
          prompts: [
            { question: 'Meu lugar favorito no mundo é...', answer: 'Qualquer lugar com boa companhia e uma vista incrível' }
          ],
          interests: ['Fotografia', 'Viagens', 'Culinária', 'Música'],
          preferences: {
            age_range: { min: 25, max: 35 },
            distance: 30,
            genders: ['male'],
            interests: ['Viagens', 'Fotografia'],
            relationship_goals: ['Relacionamento sério']
          },
          distance: 2.5,
          lastActive: '5 min atrás',
          isOnline: true
        }
      ]
      
      setProfiles(mockProfiles)
    } catch (error) {
      console.error('Error loading profiles:', error)
      toast.error('Erro ao carregar perfis')
    } finally {
      setLoading(false)
    }
  }

  const loadLimits = async () => {
    try {
      // TODO: Implement real API call
      // const response = await fetch('/api/dating/limits')
      // const data = await response.json()
      
      const planLimits = {
        gold: {
          daily_likes_limit: 50,
          daily_super_likes_limit: 5,
          daily_rewinds_limit: 3
        },
        diamond: {
          daily_likes_limit: 200,
          daily_super_likes_limit: 20,
          daily_rewinds_limit: 10
        }
      }
      
      const userLimits = planLimits[user?.premium_type as keyof typeof planLimits] || planLimits.gold
      
      setLimits({
        ...userLimits,
        daily_likes_used: 0,
        daily_super_likes_used: 0,
        daily_rewinds_used: 0,
        boost_active: false
      })
    } catch (error) {
      console.error('Error loading limits:', error)
    }
  }

  const loadMatches = async () => {
    try {
      // TODO: Implement real API call
      // const response = await fetch('/api/dating/matches')
      // const data = await response.json()
      
      setMatches([])
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const loadStats = async () => {
    try {
      // TODO: Implement real API call
      // const response = await fetch('/api/dating/stats')
      // const data = await response.json()
      
      setStats({
        total_likes_given: 0,
        total_likes_received: 0,
        total_super_likes_given: 0,
        total_super_likes_received: 0,
        total_matches: 0,
        profile_views: 0,
        conversion_rate: 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const createDatingProfile = async (profileData: {
    bio: string
    photos: File[]
    prompts: { question: string; answer: string }[]
    interests: string[]
    preferences: DatingProfile['preferences']
  }) => {
    setLoading(true)
    try {
      // TODO: Implement real API call with file upload
      // const formData = new FormData()
      // formData.append('data', JSON.stringify(profileData))
      // profileData.photos.forEach((photo, index) => {
      //   formData.append(`photo_${index}`, photo)
      // })
      
      // const response = await fetch('/api/dating/profile', {
      //   method: 'POST',
      //   body: formData
      // })
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newProfile: DatingProfile = {
        id: Date.now().toString(),
        userId: user?.id || '',
        user: {
          username: user?.username || '',
          full_name: user?.full_name || user?.username || '',
          avatar_url: user?.avatar_url || '',
          age: user?.birth_date ? Math.floor((Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 25,
          location: user?.location || '',
          is_verified: user?.is_verified || false,
          premium_type: user?.premium_type || 'free'
        },
        bio: profileData.bio,
        photos: profileData.photos.map((_, index) => ({
          url: `/dating-photo-${index}.jpg`,
          is_verified: false,
          order: index + 1
        })),
        prompts: profileData.prompts,
        interests: profileData.interests,
        preferences: profileData.preferences,
        lastActive: 'Agora',
        isOnline: true
      }
      
      setMyProfile(newProfile)
      toast.success('Perfil de dating criado com sucesso!')
      
      return { success: true, profile: newProfile }
    } catch (error) {
      console.error('Error creating dating profile:', error)
      toast.error('Erro ao criar perfil de dating')
      return { success: false, error: 'Erro ao criar perfil' }
    } finally {
      setLoading(false)
    }
  }

  const updateDatingProfile = async (updates: Partial<DatingProfile>) => {
    if (!myProfile) return { success: false, error: 'Perfil não encontrado' }

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMyProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Perfil atualizado!')
      
      return { success: true }
    } catch (error) {
      console.error('Error updating dating profile:', error)
      toast.error('Erro ao atualizar perfil')
      return { success: false, error: 'Erro ao atualizar perfil' }
    } finally {
      setLoading(false)
    }
  }

  const swipe = async (targetUserId: string, action: 'like' | 'pass' | 'super_like') => {
    try {
      // Check limits
      if (action === 'like' && limits.daily_likes_used >= limits.daily_likes_limit) {
        throw new Error('Limite diário de likes atingido')
      }
      
      if (action === 'super_like' && limits.daily_super_likes_used >= limits.daily_super_likes_limit) {
        throw new Error('Limite diário de super likes atingido')
      }

      // TODO: Implement real API call
      // const response = await fetch('/api/dating/swipe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ target_user_id: targetUserId, action })
      // })
      // const data = await response.json()
      
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update limits
      if (action === 'like') {
        setLimits(prev => ({ ...prev, daily_likes_used: prev.daily_likes_used + 1 }))
      } else if (action === 'super_like') {
        setLimits(prev => ({ 
          ...prev, 
          daily_super_likes_used: prev.daily_super_likes_used + 1,
          daily_likes_used: prev.daily_likes_used + 1
        }))
      }

      // Simulate match (30% chance for demo)
      const isMatch = action !== 'pass' && Math.random() > 0.7
      
      if (isMatch) {
        const targetProfile = profiles.find(p => p.userId === targetUserId)
        if (targetProfile) {
          const newMatch: DatingMatch = {
            id: Date.now().toString(),
            user: {
              id: targetProfile.userId,
              username: targetProfile.user.username,
              full_name: targetProfile.user.full_name,
              avatar_url: targetProfile.user.avatar_url,
              is_verified: targetProfile.user.is_verified
            },
            match_type: action === 'super_like' ? 'super_like' : 'regular',
            created_at: new Date().toISOString(),
            is_new: true
          }
          
          setMatches(prev => [newMatch, ...prev])
          setStats(prev => ({ ...prev, total_matches: prev.total_matches + 1 }))
        }
      }

      // Update stats
      if (action === 'like') {
        setStats(prev => ({ ...prev, total_likes_given: prev.total_likes_given + 1 }))
      } else if (action === 'super_like') {
        setStats(prev => ({ 
          ...prev, 
          total_super_likes_given: prev.total_super_likes_given + 1,
          total_likes_given: prev.total_likes_given + 1
        }))
      }

      return { success: true, is_match: isMatch }
    } catch (error) {
      console.error('Error swiping:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao processar swipe' }
    }
  }

  const rewind = async () => {
    if (limits.daily_rewinds_used >= limits.daily_rewinds_limit) {
      throw new Error('Limite diário de rewinds atingido')
    }

    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLimits(prev => ({ ...prev, daily_rewinds_used: prev.daily_rewinds_used + 1 }))
      
      return { success: true }
    } catch (error) {
      console.error('Error rewinding:', error)
      return { success: false, error: 'Erro ao desfazer último swipe' }
    }
  }

  const activateBoost = async (duration: 30 | 60 | 180) => {
    try {
      // TODO: Implement real API call and payment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString()
      
      setLimits(prev => ({
        ...prev,
        boost_active: true,
        boost_expires_at: expiresAt
      }))
      
      toast.success(`Boost ativado por ${duration} minutos!`)
      return { success: true }
    } catch (error) {
      console.error('Error activating boost:', error)
      return { success: false, error: 'Erro ao ativar boost' }
    }
  }

  const unmatch = async (matchId: string) => {
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setMatches(prev => prev.filter(match => match.id !== matchId))
      toast.success('Match desfeito')
      
      return { success: true }
    } catch (error) {
      console.error('Error unmatching:', error)
      return { success: false, error: 'Erro ao desfazer match' }
    }
  }

  const reportProfile = async (userId: string, reason: string) => {
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Perfil denunciado')
      return { success: true }
    } catch (error) {
      console.error('Error reporting profile:', error)
      return { success: false, error: 'Erro ao denunciar perfil' }
    }
  }

  return {
    // State
    myProfile,
    profiles,
    matches,
    limits,
    stats,
    loading,
    hasAccess,
    isDiamond,

    // Actions
    loadProfiles,
    createDatingProfile,
    updateDatingProfile,
    swipe,
    rewind,
    activateBoost,
    unmatch,
    reportProfile,

    // Utilities
    loadMyProfile,
    loadMatches,
    loadStats
  }
}