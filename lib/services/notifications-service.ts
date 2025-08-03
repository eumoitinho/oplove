import { createClient } from '@/app/lib/supabase-browser'
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'
import type { NotificationData, User } from '@/types/common'

// Extended notification interface with more details
export interface Notification extends NotificationData {
  recipient_id: string
  sender_id?: string
  sender?: User
  entity_id?: string // ID of the related entity (post, comment, etc)
  entity_type?: 'post' | 'comment' | 'message' | 'follow'
  action_taken?: boolean // For follow notifications - if user followed back
  metadata?: Record<string, any>
  is_read?: boolean
  read_at?: string | null
  content?: string
  message?: string
  related_data?: Record<string, any>
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
      console.log('🔔 NotificationsService - getNotifications called:', { userId, page, limit, filters })
      
      let query = this.supabase
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
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters?.read !== undefined && filters.read !== 'all') {
        query = query.eq('is_read', filters.read)
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString())
      }

      // Pagination
      const start = (page - 1) * limit
      const end = start + limit - 1
      query = query.range(start, end)

      const { data, error, count } = await query

      console.log('🔔 NotificationsService - Query result:', { 
        dataLength: data?.length, 
        count,
        error: error?.message,
        firstNotification: data?.[0]
      })

      if (error) {
        console.error('🔔 NotificationsService - Error getting notifications:', error)
        throw error
      }

      console.log('🔔 NotificationsService - Success:', { count, dataLength: data?.length })
      console.log('🔔 NotificationsService - First 3 notifications:', data?.slice(0, 3))

      return {
        notifications: data as Notification[],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      }
    } catch (error) {
      console.error('🔔 NotificationsService - Catch error:', error)
      throw error
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      console.log('🔔 NotificationsService - getUnreadCount called:', { userId })
      
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('recipient_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('🔔 NotificationsService - getUnreadCount error:', error)
        throw error
      }
      
      console.log('🔔 NotificationsService - getUnreadCount success:', { count })
      return count || 0
    } catch (error) {
      console.error('🔔 NotificationsService - getUnreadCount catch:', error)
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