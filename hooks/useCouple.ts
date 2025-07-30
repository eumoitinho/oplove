"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface CoupleInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email?: string
  to_phone?: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  from_user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

interface Couple {
  id: string
  couple_name: string
  couple_avatar_url: string
  couple_cover_url: string
  anniversary_date: string
  bio: string
  status: 'active' | 'pending' | 'inactive'
  created_at: string
  updated_at: string
  users: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    role: 'primary' | 'secondary'
    joined_at: string
  }[]
  shared_album_count: number
  shared_diary_entries: number
  relationship_stats: {
    days_together: number
    posts_together: number
    memories_created: number
    games_played: number
  }
  interests: string[]
  relationship_goals: string[]
}

interface CoupleSettings {
  shared_profile: boolean
  shared_stats: boolean
  allow_partner_posting: boolean
  auto_tag_partner: boolean
  shared_calendar: boolean
  notifications: {
    partner_posts: boolean
    anniversary_reminders: boolean
    couple_games: boolean
    shared_memories: boolean
  }
  privacy: {
    album_visibility: 'private' | 'couple_only' | 'friends'
    diary_access: 'both' | 'creator_only'
    stats_sharing: boolean
  }
}

export function useCouple() {
  const { user } = useAuth()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [coupleSettings, setCoupleSettings] = useState<CoupleSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [invitations, setInvitations] = useState<{
    sent: CoupleInvitation[]
    received: CoupleInvitation[]
  }>({ sent: [], received: [] })

  const isInCouple = !!user?.couple_id && !!couple
  const isCouplePrimary = couple?.users.find(u => u.id === user?.id)?.role === 'primary'

  useEffect(() => {
    if (user?.couple_id) {
      loadCouple()
      loadCoupleSettings()
    }
    loadInvitations()
  }, [user])

  const loadCouple = async () => {
    if (!user?.couple_id) return

    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch(`/api/couples/${user.couple_id}`)
      // const data = await response.json()
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockCouple: Couple = {
        id: user.couple_id,
        couple_name: 'Casal Feliz',
        couple_avatar_url: '',
        couple_cover_url: '',
        anniversary_date: '2023-02-14',
        bio: 'Nosso amor crescendo a cada dia 💕',
        status: 'active',
        created_at: '2023-02-14T00:00:00Z',
        updated_at: new Date().toISOString(),
        users: [
          {
            id: user.id,
            username: user.username,
            full_name: user.full_name || user.username,
            avatar_url: user.avatar_url || '',
            role: 'primary',
            joined_at: '2023-02-14T00:00:00Z'
          }
        ],
        shared_album_count: 0,
        shared_diary_entries: 0,
        relationship_stats: {
          days_together: Math.floor((Date.now() - new Date('2023-02-14').getTime()) / (1000 * 60 * 60 * 24)),
          posts_together: 0,
          memories_created: 0,
          games_played: 0
        },
        interests: [],
        relationship_goals: []
      }
      
      setCouple(mockCouple)
    } catch (error) {
      console.error('Error loading couple:', error)
      toast.error('Erro ao carregar dados do casal')
    } finally {
      setLoading(false)
    }
  }

  const loadCoupleSettings = async () => {
    if (!user?.couple_id) return

    try {
      // TODO: Implement real API call
      const mockSettings: CoupleSettings = {
        shared_profile: true,
        shared_stats: true,
        allow_partner_posting: true,
        auto_tag_partner: false,
        shared_calendar: true,
        notifications: {
          partner_posts: true,
          anniversary_reminders: true,
          couple_games: true,
          shared_memories: true
        },
        privacy: {
          album_visibility: 'couple_only',
          diary_access: 'both',
          stats_sharing: true
        }
      }
      
      setCoupleSettings(mockSettings)
    } catch (error) {
      console.error('Error loading couple settings:', error)
    }
  }

  const loadInvitations = async () => {
    if (!user) return

    try {
      // TODO: Implement real API calls
      // const [sentResponse, receivedResponse] = await Promise.all([
      //   fetch('/api/couple-invitations/sent'),
      //   fetch('/api/couple-invitations/received')
      // ])
      
      // Mock data for now
      setInvitations({
        sent: [],
        received: []
      })
    } catch (error) {
      console.error('Error loading invitations:', error)
    }
  }

  const sendInvitation = async (data: {
    method: 'username' | 'email' | 'phone'
    username?: string
    email?: string
    phone?: string
    message: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch('/api/couple-invitations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock success
      const newInvitation: CoupleInvitation = {
        id: Date.now().toString(),
        from_user_id: user.id,
        to_email: data.email,
        to_phone: data.phone,
        message: data.message,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        from_user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name || user.username,
          avatar_url: user.avatar_url || ''
        }
      }

      setInvitations(prev => ({
        ...prev,
        sent: [newInvitation, ...prev.sent]
      }))

      return { success: true, invitation: newInvitation }
    } catch (error) {
      console.error('Error sending invitation:', error)
      return { success: false, error: 'Erro ao enviar convite' }
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch(`/api/couple-invitations/${invitationId}/accept`, {
      //   method: 'POST'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remove from received invitations
      setInvitations(prev => ({
        ...prev,
        received: prev.received.filter(inv => inv.id !== invitationId)
      }))

      // Load the new couple data
      await loadCouple()

      return { success: true }
    } catch (error) {
      console.error('Error accepting invitation:', error)
      return { success: false, error: 'Erro ao aceitar convite' }
    } finally {
      setLoading(false)
    }
  }

  const declineInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setInvitations(prev => ({
        ...prev,
        received: prev.received.filter(inv => inv.id !== invitationId)
      }))

      return { success: true }
    } catch (error) {
      console.error('Error declining invitation:', error)
      return { success: false, error: 'Erro ao recusar convite' }
    } finally {
      setLoading(false)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setInvitations(prev => ({
        ...prev,
        sent: prev.sent.filter(inv => inv.id !== invitationId)
      }))

      return { success: true }
    } catch (error) {
      console.error('Error canceling invitation:', error)
      return { success: false, error: 'Erro ao cancelar convite' }
    } finally {
      setLoading(false)
    }
  }

  const updateCouple = async (data: Partial<Couple>) => {
    if (!couple) throw new Error('No couple found')

    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch(`/api/couples/${couple.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCouple(prev => prev ? { ...prev, ...data } : null)
      
      return { success: true }
    } catch (error) {
      console.error('Error updating couple:', error)
      return { success: false, error: 'Erro ao atualizar perfil do casal' }
    } finally {
      setLoading(false)
    }
  }

  const updateCoupleSettings = async (settings: Partial<CoupleSettings>) => {
    if (!couple) throw new Error('No couple found')

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))

      setCoupleSettings(prev => prev ? { ...prev, ...settings } : null)
      
      return { success: true }
    } catch (error) {
      console.error('Error updating couple settings:', error)
      return { success: false, error: 'Erro ao atualizar configurações' }
    } finally {
      setLoading(false)
    }
  }

  const leaveCouple = async () => {
    if (!couple || !user) throw new Error('No couple or user found')

    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch(`/api/couples/${couple.id}/leave`, {
      //   method: 'POST'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      setCouple(null)
      setCoupleSettings(null)
      
      return { success: true }
    } catch (error) {
      console.error('Error leaving couple:', error)
      return { success: false, error: 'Erro ao sair do casal' }
    } finally {
      setLoading(false)
    }
  }

  const dissolveCouple = async () => {
    if (!couple || !isCouplePrimary) throw new Error('Only primary user can dissolve couple')

    setLoading(true)
    try {
      // TODO: Implement real API call
      // const response = await fetch(`/api/couples/${couple.id}`, {
      //   method: 'DELETE'
      // })
      
      await new Promise(resolve => setTimeout(resolve, 2000))

      setCouple(null)
      setCoupleSettings(null)
      
      return { success: true }
    } catch (error) {
      console.error('Error dissolving couple:', error)
      return { success: false, error: 'Erro ao desfazer casal' }
    } finally {
      setLoading(false)
    }
  }

  const addToSharedAlbum = async (files: File[]) => {
    if (!couple) throw new Error('No couple found')

    setLoading(true)
    try {
      // TODO: Implement real file upload and API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update album count
      setCouple(prev => prev ? {
        ...prev,
        shared_album_count: prev.shared_album_count + files.length
      } : null)
      
      return { success: true }
    } catch (error) {
      console.error('Error adding to shared album:', error)
      return { success: false, error: 'Erro ao adicionar fotos ao álbum' }
    } finally {
      setLoading(false)
    }
  }

  const addDiaryEntry = async (entry: {
    title: string
    content: string
    date: string
    mood?: string
    photos?: File[]
  }) => {
    if (!couple) throw new Error('No couple found')

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update diary entries count
      setCouple(prev => prev ? {
        ...prev,
        shared_diary_entries: prev.shared_diary_entries + 1
      } : null)
      
      return { success: true }
    } catch (error) {
      console.error('Error adding diary entry:', error)
      return { success: false, error: 'Erro ao adicionar entrada no diário' }
    } finally {
      setLoading(false)
    }
  }

  const startCoupleGame = async (gameId: string) => {
    if (!couple) throw new Error('No couple found')

    setLoading(true)
    try {
      // TODO: Implement real API call
      await new Promise(resolve => setTimeout(resolve, 500))

      return { success: true, gameSession: { id: gameId, started_at: new Date().toISOString() } }
    } catch (error) {
      console.error('Error starting couple game:', error)
      return { success: false, error: 'Erro ao iniciar jogo' }
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    couple,
    coupleSettings,
    invitations,
    loading,
    isInCouple,
    isCouplePrimary,

    // Actions
    sendInvitation,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    updateCouple,
    updateCoupleSettings,
    leaveCouple,
    dissolveCouple,
    addToSharedAlbum,
    addDiaryEntry,
    startCoupleGame,

    // Utilities
    loadCouple,
    loadInvitations
  }
}