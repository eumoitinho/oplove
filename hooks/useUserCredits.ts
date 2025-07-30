import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { UserCredits } from '@/types/stories.types'

export function useUserCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)
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
        throw new Error('Failed to load credits')
      }
      
      const data = await response.json()
      setCredits(data)
    } catch (err) {
      console.error('Error loading credits:', err)
      setError('Erro ao carregar créditos')
      
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