'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { realtimeService } from '@/lib/services/realtime-service'
import { formatToastNotification, formatTimeAgo } from '@/utils/notification-formatter'
import { useRouter } from 'next/navigation'

interface NotificationData {
  id: string
  type: 'like' | 'comment' | 'repost' | 'follow' | 'message' | 'mutual_like'
  sender_id: string
  recipient_id: string
  title: string
  message?: string
  content?: string
  entity_id?: string
  entity_type?: string
  created_at: string
  sender?: {
    id: string
    username: string
    name?: string
    avatar_url?: string
  }
}

interface UseRealtimeNotificationsOptions {
  enabled?: boolean
  playSound?: boolean
  showToast?: boolean
  onNotification?: (notification: NotificationData) => void
}

/**
 * Hook for real-time notifications with toast display
 * 
 * Features:
 * - Real-time notification delivery via Supabase
 * - Toast notifications with actions
 * - Sound effects (optional)
 * - Auto-formatting with time ago
 * - Click actions to navigate
 */
export function useRealtimeNotifications({
  enabled = true,
  playSound = true,
  showToast = true,
  onNotification
}: UseRealtimeNotificationsOptions = {}) {
  const { user } = useAuth()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastNotificationTime = useRef<number>(0)
  
  // Initialize audio for notification sound
  useEffect(() => {
    if (playSound && typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.5
    }
  }, [playSound])
  
  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (playSound && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Could not play notification sound:', err)
      })
    }
  }, [playSound])
  
  // Handle incoming notification
  const handleNotification = useCallback((notification: NotificationData) => {
    // Prevent duplicate notifications (within 1 second)
    const now = Date.now()
    if (now - lastNotificationTime.current < 1000) {
      return
    }
    lastNotificationTime.current = now
    
    // Format notification for display
    const formattedMessage = notification.sender ? formatToastNotification({
      type: notification.type as any,
      senderUsername: notification.sender.username,
      commentPreview: notification.type === 'comment' ? notification.content : undefined,
      timestamp: notification.created_at
    }) : notification.title || notification.message || 'Nova notificação'
    
    // Show toast notification
    if (showToast) {
      const toastId = toast(formattedMessage, {
        duration: 5000,
        position: 'top-right',
        className: 'notification-toast',
        action: getNotificationAction(notification),
        onDismiss: () => {
          // Mark as read when dismissed
          markAsRead(notification.id)
        }
      })
      
      // Auto-dismiss mutual like toasts after 8 seconds (they're special)
      if (notification.type === 'mutual_like') {
        setTimeout(() => toast.dismiss(toastId), 8000)
      }
    }
    
    // Play sound
    playNotificationSound()
    
    // Call custom handler
    onNotification?.(notification)
  }, [showToast, playNotificationSound, onNotification, router])
  
  // Get action button for notification
  const getNotificationAction = (notification: NotificationData) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'repost':
        if (notification.entity_id && notification.entity_type === 'post') {
          return {
            label: 'Ver post',
            onClick: () => {
              router.push(`/feed?view=post&id=${notification.entity_id}`)
            }
          }
        }
        break
      
      case 'follow':
        if (notification.sender_id) {
          return {
            label: 'Ver perfil',
            onClick: () => {
              router.push(`/feed?view=user-profile&userId=${notification.sender_id}`)
            }
          }
        }
        break
      
      case 'message':
        if (notification.sender_id) {
          return {
            label: 'Responder',
            onClick: () => {
              router.push(`/messages?user=${notification.sender_id}`)
            }
          }
        }
        break
      
      case 'mutual_like':
        if (notification.sender_id) {
          return {
            label: '💕 Enviar mensagem',
            onClick: () => {
              router.push(`/messages?user=${notification.sender_id}`)
            }
          }
        }
        break
    }
    
    return undefined
  }
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user || !enabled) return
    
    console.log('[useRealtimeNotifications] Subscribing to notifications for user:', user.id)
    
    const unsubscribe = realtimeService.subscribeToUserNotifications(
      user.id,
      handleNotification
    )
    
    return () => {
      console.log('[useRealtimeNotifications] Unsubscribing from notifications')
      unsubscribe()
    }
  }, [user, enabled, handleNotification])
  
  // Test notification (for development)
  const sendTestNotification = useCallback(() => {
    const testNotification: NotificationData = {
      id: `test-${Date.now()}`,
      type: 'like',
      sender_id: 'test-user',
      recipient_id: user?.id || '',
      title: 'Test Notification',
      message: 'joão123 curtiu sua foto',
      created_at: new Date().toISOString(),
      sender: {
        id: 'test-user',
        username: 'joão123',
        name: 'João Silva'
      }
    }
    
    handleNotification(testNotification)
  }, [user, handleNotification])
  
  return {
    sendTestNotification
  }
}