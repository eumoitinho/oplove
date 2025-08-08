import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { notificationsService } from '@/lib/services/notifications-service'

export function useNotifications() {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch initial unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    const fetchUnreadCount = async () => {
      try {
        // Temporarily disabled to avoid console errors
        // const count = await notificationsService.getUnreadCount(user.id)
        // setUnreadCount(count)
        setUnreadCount(0) // Default to 0 for now
      } catch (error) {
        console.error('Error fetching unread count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()
  }, [user])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = notificationsService.subscribeToNotifications(
      user.id,
      (notification) => {
        // Increment unread count when new notification arrives
        if (!notification.is_read) {
          setUnreadCount(prev => prev + 1)
        }
      }
    )

    return unsubscribe
  }, [user])

  // Function to manually update count (e.g., after marking as read)
  const decrementUnreadCount = (amount: number = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount))
  }

  const resetUnreadCount = () => {
    setUnreadCount(0)
  }

  return {
    unreadCount,
    loading,
    decrementUnreadCount,
    resetUnreadCount
  }
}