import { createSupabaseClient } from '@/lib/supabase/client'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { UserBasic, Notification as DBNotification } from '@/types/database.types'

// Define NotificationData locally for now
interface NotificationData {
  type: 'like' | 'comment' | 'follow' | 'message' | 'subscription' | 'system'
}

// Extended notification interface with sender info
export interface Notification extends DBNotification {
  sender?: UserBasic  // populated from join
  
  // Legacy support (deprecated) - mapped for backward compatibility
  message?: string  // mapped from content
  entity_id?: string 
  entity_type?: string
  action_taken?: boolean 
  metadata?: Record<string, unknown> // Better than 'any'
}

export interface NotificationFilters {
  type?: NotificationData['type'] | 'all'
  read?: boolean | 'all'
  dateRange?: {
    from: Date
    to: Date
  }
}

class NotificationsService {
  private supabase: SupabaseClient
  private realtimeChannel: RealtimeChannel | null = null

  constructor() {
    this.supabase = createSupabaseClient()
  }

  // Get notifications with pagination and filters
  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: NotificationFilters
  ) {
    try {
      console.log('[NotificationsService] Starting query for userId:', userId)
      
      // First try simple query without joins
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 20))
      
      console.log('[NotificationsService] Executing simple query...')
      const { data, error, count } = await query

      if (error) {
        console.error('NotificationsService - Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        
        // Return empty data if query fails
        return {
          notifications: [],
          total: 0,
          page,
          limit,
          hasMore: false
        }
      }

      console.log('[NotificationsService] Query success! Found', data?.length, 'notifications')
      
      // If we have data, try to populate sender info separately
      const notificationsWithSender = await this.populateSenderInfo(data || [])
      
      return {
        notifications: notificationsWithSender as Notification[],
        total: count || data?.length || 0,
        page,
        limit,
        hasMore: false // Simplified for now
      }
    } catch (error) {
      console.error('NotificationsService - Catch error:', error)
      return {
        notifications: [],
        total: 0,
        page,
        limit,
        hasMore: false
      }
    }
  }
  
  // Helper method to populate sender info separately
  private async populateSenderInfo(notifications: any[]) {
    if (!notifications.length) return notifications
    
    // Get unique sender IDs
    const senderIds = [...new Set(
      notifications
        .map(n => n.sender_id)
        .filter(id => id)
    )]
    
    if (!senderIds.length) return notifications
    
    try {
      // Fetch sender info separately
      const { data: users } = await this.supabase
        .from('users')
        .select('id, username, name, avatar_url, is_verified, premium_type')
        .in('id', senderIds)
      
      // Map sender info to notifications
      return notifications.map(notification => ({
        ...notification,
        sender: users?.find(user => user.id === notification.sender_id) || null
      }))
    } catch (error) {
      console.error('Error fetching sender info:', error)
      // Return notifications without sender info if population fails
      return notifications
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Check if notifications table exists by trying a simple query first
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('NotificationsService - getUnreadCount error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        
        // If table doesn't exist, return 0 instead of throwing
        if (error.message?.includes('does not exist') || error.code === '42P01') {
          console.warn('Notifications table does not exist, returning 0')
          return 0
        }
        
        return 0 // Return 0 on any error instead of throwing
      }
      
      return count || 0
    } catch (error) {
      console.error('NotificationsService - getUnreadCount catch:', error)
      return 0
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    // Unsubscribe from previous channel if exists
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel)
    }

    this.realtimeChannel = this.supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        async (payload) => {
          // Fetch complete notification data with relations
          const { data } = await this.supabase
            .from('notifications')
            .select(`
              *,
              sender:users!sender_id(
                id,
                username,
                name,
                avatar_url,
                is_verified,
                premium_type
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            callback(data as Notification)
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      if (this.realtimeChannel) {
        this.supabase.removeChannel(this.realtimeChannel)
        this.realtimeChannel = null
      }
    }
  }

  // Create notification (usually called from server-side)
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .insert(notification)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  // Perform quick actions
  async performQuickAction(
    notificationId: string,
    action: 'follow_back' | 'reply' | 'view'
  ): Promise<void> {
    try {
      // Mark notification as read first
      await this.markAsRead(notificationId)

      // Update action_taken if it's a follow notification
      if (action === 'follow_back') {
        const { error } = await this.supabase
          .from('notifications')
          .update({ action_taken: true })
          .eq('id', notificationId)

        if (error) throw error
      }

      // Other actions are handled by the UI components
    } catch (error) {
      throw error
    }
  }
}

export const notificationsService = new NotificationsService()