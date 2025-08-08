'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Mail,
  FileText,
  Check,
  Trash2,
  Filter,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { notificationsService, type Notification, type NotificationFilters } from '@/lib/services/notifications-service'
import { PostSkeleton } from '@/components/feed/PostSkeleton'
import type { Notification as NotificationType } from '@/types/database.types'
import { useNotificationsCache } from '@/lib/stores/notifications-cache'

interface NotificationsViewProps {
  className?: string
}

export function NotificationsView({ className }: NotificationsViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const {
    notifications,
    filters,
    hasInitialLoad,
    setNotifications,
    updateNotification,
    removeNotification,
    addNotification,
    setFilters: setCacheFilters,
    setHasInitialLoad,
    isStale,
    clearCache
  } = useNotificationsCache()
  
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Local wrapper for filters to update both local state and cache
  const setFilters = (newFilters: NotificationFilters | ((prev: NotificationFilters) => NotificationFilters)) => {
    if (typeof newFilters === 'function') {
      setCacheFilters(newFilters(filters))
    } else {
      setCacheFilters(newFilters)
    }
  }


  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = notificationsService.subscribeToNotifications(
      user.id,
      (notification) => {
        addNotification(notification)
        toast.info(notification.content || notification.message || 'Nova notificação')
      }
    )

    return unsubscribe
  }, [user, addNotification])

  // Direct fetch function (simplified)
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      setHasInitialLoad(true)
      return
    }

    // Skip fetch if we have cached data and it's not stale (unless forcing refresh)
    if (!forceRefresh && hasInitialLoad && !isStale() && notifications.length > 0) {
      console.log('[NotificationsView] Using cached data, skipping fetch')
      setLoading(false)
      return
    }

    // Only show loading if we don't have any cached data OR we're forcing refresh
    const shouldShowLoading = !hasInitialLoad || (notifications.length === 0) || forceRefresh
    if (shouldShowLoading) {
      console.log('[NotificationsView] Setting loading=true, hasInitialLoad:', hasInitialLoad, 'notifications.length:', notifications.length, 'forceRefresh:', forceRefresh)
      setLoading(true)
    }
    
    try {
      console.log('[NotificationsView] Fetching notifications for user:', user.id)
      const result = await notificationsService.getNotifications(
        user.id,
        1,
        20,
        filters
      )
      
      console.log('[NotificationsView] Result:', result)
      setNotifications(result.notifications || [])
      setHasInitialLoad(true)
    } catch (error) {
      console.error('[NotificationsView] Error fetching notifications:', error)
      toast.error('Erro ao carregar notificações')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [user, filters, hasInitialLoad, isStale, setNotifications, setHasInitialLoad])

  // Load notifications on mount and filter changes
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])
  
  // Clear cache when user changes
  useEffect(() => {
    return () => {
      // Don't clear cache on unmount if user is still logged in
      if (!user) {
        clearCache()
      }
    }
  }, [user, clearCache])

  // Mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return

    try {
      await notificationsService.markAsRead(notification.id)
      updateNotification(notification.id, { is_read: true })
    } catch (error) {
      toast.error('Erro ao marcar como lida')
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await notificationsService.markAllAsRead(user.id)
      notifications.forEach(n => {
        if (!n.is_read) {
          updateNotification(n.id, { is_read: true })
        }
      })
      toast.success('Todas as notificações foram marcadas como lidas')
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas')
    }
  }

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId)
      removeNotification(notificationId)
      toast.success('Notificação removida')
    } catch (error) {
      toast.error('Erro ao remover notificação')
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    await handleMarkAsRead(notification)

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        // Navigate to timeline to see post interactions
        router.push('/feed?view=timeline')
        break
      case 'follow':
      case 'friend_request_accepted':
        if (notification.sender_id) {
          // Navigate to user profile
          router.push(`/feed?view=user-profile&userId=${notification.sender_id}`)
        }
        break
      case 'message':
        router.push('/feed?view=messages')
        break
      case 'post':
        // Navigate to timeline to see new posts
        router.push('/feed?view=timeline')
        break
      default:
        // Default to timeline for unknown types
        router.push('/feed?view=timeline')
        break
    }
  }

  // Handle user profile click
  const handleUserClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (notification.sender_id) {
      const profileUrl = `/feed?view=user-profile&userId=${notification.sender_id}`
      router.push(profileUrl)
    } else {
      toast.error('Perfil não encontrado')
    }
  }

  // Quick action: Follow back
  const handleFollowBack = async (notification: Notification) => {
    if (!notification.sender_id) return

    try {
      await notificationsService.performQuickAction(notification.id, 'follow_back')
      // TODO: Call follow API
      toast.success('Seguindo de volta!')
      updateNotification(notification.id, { action_taken: true })
    } catch (error) {
      toast.error('Erro ao seguir de volta')
    }
  }

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-pink-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-pink-500" />
      case 'message':
        return <Mail className="h-5 w-5 text-pink-500" />
      case 'post':
        return <FileText className="h-5 w-5 text-pink-500" />
      default:
        return <Bell className="h-5 w-5 text-pink-500" />
    }
  }

  return (
    <div className={cn("flex flex-col h-full max-w-2xl mx-auto", className)}>
      {/* Header - Fixed */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Notificações</h1>
            {notifications.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {notifications.filter(n => !n.is_read).length} não lidas de {notifications.length} total
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="hidden sm:block text-sm text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-500/10"
              >
                Marcar todas como lidas
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-2 rounded-full transition-colors",
                showFilters 
                  ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" 
                  : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
              )}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
          >
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Tipo
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="all">Todas</option>
                    <option value="like">Curtidas</option>
                    <option value="comment">Comentários</option>
                    <option value="follow">Seguidores</option>
                    <option value="message">Mensagens</option>
                    <option value="post">Posts</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Status
                  </label>
                  <select
                    value={filters.read === 'all' ? 'all' : filters.read ? 'read' : 'unread'}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      read: e.target.value === 'all' ? 'all' : e.target.value === 'read' 
                    }))}
                    className="w-full px-3 py-2.5 border border-gray-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  >
                    <option value="all">Todas</option>
                    <option value="unread">Não lidas</option>
                    <option value="read">Lidas</option>
                  </select>
                </div>
              </div>
              
              {/* Mobile Mark All as Read */}
              {notifications.some(n => !n.is_read) && (
                <div className="sm:hidden pt-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full text-sm text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors py-2 px-4 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/10"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-4 sm:p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Você não tem notificações no momento. Quando alguém curtir seus posts ou te seguir, você verá aqui!
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-2">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    "group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800",
                    !notification.is_read && "bg-pink-50 border-pink-200 dark:bg-pink-500/5 dark:border-pink-500/20"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  {!notification.is_read && (
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-500 rounded-full" />
                  )}
                  
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* User Avatar */}
                    {notification.sender && (
                      <div 
                        className="flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => handleUserClick(notification, e)}
                      >
                        <Image
                          src={notification.sender.avatar_url || '/placeholder-user.jpg'}
                          alt={notification.sender.username || 'Usuário'}
                          width={44}
                          height={44}
                          className="rounded-full border border-gray-200 dark:border-gray-700"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-5">
                            {notification.sender && (
                              <span 
                                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-pink-500 transition-colors"
                                onClick={(e) => handleUserClick(notification, e)}
                              >
                                {notification.sender.name || notification.sender.username || 'Usuário'}
                              </span>
                            )}
                            {notification.sender && ' '}
                            <span className="text-gray-700 dark:text-gray-300">
                              {notification.message || notification.content}
                            </span>
                          </p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                            
                            {/* Quick Actions */}
                            {notification.type === 'follow' && !notification.action_taken && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleFollowBack(notification)
                                }}
                                className="text-xs bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600 transition-colors"
                              >
                                Seguir de volta
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification)
                              }}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(notification.id)
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            title="Remover notificação"
                          >
                            <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}