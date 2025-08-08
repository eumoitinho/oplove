import { createClient } from '@/app/lib/supabase-browser'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { NotificationData, User } from '@/types/common'

// Extended notification interface matching actual database columns
export interface Notification {
  id: string
  user_id: string  // who receives the notification
  from_user_id?: string  // who triggered the notification
  sender?: User  // populated from join
  type: 'like' | 'comment' | 'follow' | 'message' | 'post'
  title: string
  message: string
  read: boolean
  entity_id?: string // ID of the related entity (post, comment, etc)
  entity_type?: 'post' | 'comment' | 'message' | 'follow'
  action_taken?: boolean // For follow notifications - if user followed back
  metadata?: any // JSONB field
  created_at: string
  content?: string  // Alternative to message for display
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
    this.supabase = createClient()
  }

  // Get notifications with pagination and filters
  async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: NotificationFilters
  ) {
    try {
      // Query notifications with sender info
      let query = this.supabase
        .from('notifications')
        .select(`
          *,
          sender:users!from_user_id(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 20))
      
      let data, error, count
      try {
        const result = await Promise.race([
          query,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 3s')), 8000)
          )
        ]) as any
        data = result.data
        error = result.error
        count = result.count
      } catch (queryError) {
        error = queryError
        data = null
        count = 0
      }

      if (error) {
        console.error('NotificationsService - Error getting notifications:', error)
        
        // Return empty data if query fails
        return {
          notifications: [],
          total: 0,
          page,
          limit,
          hasMore: false
        }
      }

      return {
        notifications: data as Notification[],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      }
    } catch (error) {
      console.error('NotificationsService - Catch error:', error)
      throw error
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('NotificationsService - getUnreadCount error:', error)
        throw error
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
        .update({ read: true })
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
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

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