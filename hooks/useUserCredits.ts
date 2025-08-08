import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { UserCredit } from '@/types/database.types'

// Helper interface for the hook's return data structure  
interface UserCreditsData {
  userId: string
  creditBalance: number
  totalPurchased: number
  totalSpent: number
  totalGifted: number
  totalReceived: number
}

export function useUserCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCreditsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadCredits()
    } else {
      setCredits(null)
      setLoading(false)
    }
  }, [user])

  const loadCredits = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/v1/credits/balance')
      
      if (!response.ok) {
        console.warn('[useUserCredits] Credits API returned non-ok status:', response.status)
        // Don't throw, just use default values
      }
      
      const data = await response.json()
      
      // Use data if valid, otherwise use defaults
      setCredits({
        userId: data?.userId || user?.id || '',
        creditBalance: data?.creditBalance || 0,
        totalPurchased: data?.totalPurchased || 0,
        totalSpent: data?.totalSpent || 0,
        totalGifted: data?.totalGifted || 0,
        totalReceived: data?.totalReceived || 0
      })
    } catch (err) {
      console.warn('[useUserCredits] Non-critical error loading credits:', err)
      // Don't set error state for this non-critical feature
      
      // Set default credits if error
      setCredits({
        userId: user?.id || '',
        creditBalance: 0,
        totalPurchased: 0,
        totalSpent: 0,
        totalGifted: 0,
        totalReceived: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    if (user) {
      await loadCredits()
    }
  }

  const purchaseCredits = async (packageId: string, paymentMethod: 'credit_card' | 'pix') => {
    try {
      const response = await fetch('/api/v1/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, paymentMethod })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao comprar créditos')
      }

      const data = await response.json()
      await refreshCredits()
      return data
    } catch (err) {
      console.error('Error purchasing credits:', err)
      throw err
    }
  }

  return {
    credits,
    loading,
    error,
    refreshCredits,
    purchaseCredits
  }
}