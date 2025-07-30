"use client"

import { useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { createClient } from '@/app/lib/supabase-browser'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { ToastType } from '@/components/common/EngagementToast'

interface ToastUser {
  id: string
  name: string
  username: string
  avatar_url?: string
  is_verified?: boolean
  premium_type?: "gold" | "diamond" | "couple" | null
}

interface ToastData {
  type: ToastType
  users: ToastUser[]
  count?: number
  message?: string
  onAction?: () => void
}

// Global function to show toasts
declare global {
  interface Window {
    showEngagementToast: (toast: ToastData) => void
  }
}

export function useEngagementToasts() {
  const { user } = useAuth()
  const supabase = createClient()
  const channelsRef = useRef<RealtimeChannel[]>([])
  const lastNotificationTime = useRef<number>(Date.now())

  // Show a toast notification
  const showToast = useCallback((data: ToastData) => {
    if (typeof window !== 'undefined' && window.showEngagementToast) {
      window.showEngagementToast(data)
    }
  }, [])

  // Throttle notifications to avoid spam
  const throttleNotification = useCallback((key: string, callback: () => void, delay: number = 5000) => {
    const now = Date.now()
    if (now - lastNotificationTime.current > delay) {
      lastNotificationTime.current = now
      callback()
    }
  }, [])

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    // Subscribe to notifications table
    const notificationsChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          const notification = payload.new

          // Fetch user details
          const { data: fromUser } = await supabase
            .from('users')
            .select('id, username, full_name, avatar_url, is_verified, premium_type')
            .eq('id', notification.from_user_id)
            .single()

          if (!fromUser) return

          const toastUser: ToastUser = {
            id: fromUser.id,
            name: fromUser.full_name || fromUser.username,
            username: fromUser.username,
            avatar_url: fromUser.avatar_url,
            is_verified: fromUser.is_verified,
            premium_type: fromUser.premium_type
          }

          // Map notification types to toast types
          const typeMap: Record<string, ToastType> = {
            'like': 'like',
            'comment': 'comment',
            'follow': 'follow',
            'message': 'message',
            'mention': 'comment',
            'profile_view': 'visit',
            'story_view': 'story_view',
            'gift': 'gift_received'
          }

          const toastType = typeMap[notification.type]
          if (toastType) {
            showToast({
              type: toastType,
              users: [toastUser],
              message: notification.content
            })
          }
        }
      )
      .subscribe()

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('posts:new')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          const post = payload.new

          // Don't show for own posts
          if (post.author_id === user.id) return

          // Check if user follows the author
          const { data: following } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', post.author_id)
            .single()

          if (!following) return

          // Fetch author details
          const { data: author } = await supabase
            .from('users')
            .select('id, username, full_name, avatar_url, is_verified, premium_type')
            .eq('id', post.author_id)
            .single()

          if (author) {
            showToast({
              type: 'new_post',
              users: [{
                id: author.id,
                name: author.full_name || author.username,
                username: author.username,
                avatar_url: author.avatar_url,
                is_verified: author.is_verified,
                premium_type: author.premium_type
              }],
              onAction: () => window.location.reload()
            })
          }
        }
      )
      .subscribe()

    channelsRef.current = [notificationsChannel, postsChannel]

    // Clean up
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [user, supabase, showToast])

  return {
    showToast
  }
}