import { create } from 'zustand'
import type { Notification, NotificationFilters } from '@/lib/services/notifications-service'

interface NotificationsCacheState {
  notifications: Notification[]
  lastFetch: number | null
  filters: NotificationFilters
  hasInitialLoad: boolean
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
  removeNotification: (id: string) => void
  addNotification: (notification: Notification) => void
  setFilters: (filters: NotificationFilters) => void
  setHasInitialLoad: (loaded: boolean) => void
  isStale: () => boolean
  clearCache: () => void
}

const CACHE_TTL = 60000 // 1 minute cache

export const useNotificationsCache = create<NotificationsCacheState>((set, get) => ({
  notifications: [],
  lastFetch: null,
  filters: {
    type: 'all',
    read: 'all'
  },
  hasInitialLoad: false,

  setNotifications: (notifications) => set({ 
    notifications, 
    lastFetch: Date.now(),
    hasInitialLoad: true
  }),

  updateNotification: (id, updates) => set(state => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, ...updates } : n
    )
  })),

  removeNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  addNotification: (notification) => set(state => ({
    notifications: [notification, ...state.notifications]
  })),

  setFilters: (filters) => set({ filters }),

  setHasInitialLoad: (loaded) => set({ hasInitialLoad: loaded }),

  isStale: () => {
    const { lastFetch } = get()
    if (!lastFetch) return true
    return Date.now() - lastFetch > CACHE_TTL
  },

  clearCache: () => set({
    notifications: [],
    lastFetch: null,
    hasInitialLoad: false
  })
}))