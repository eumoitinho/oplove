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
  
  const [loading, setLoading] = useState(!hasInitialLoad)
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

    // Skip fetch if we have cached data and it's not stale
    if (!forceRefresh && hasInitialLoad && !isStale()) {
      setLoading(false)
      return
    }

    // Only show loading on initial load or when forcing refresh
    if (!hasInitialLoad || forceRefresh) {
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
    <div className={cn("space-y-4", className)}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificações</h1>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showFilters 
                ? "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400" 
                : "hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
            )}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-white/10 p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded text-gray-600 dark:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-white/10 text-gray-900 dark:text-white"
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Status
                </label>
                <select
                  value={filters.read === 'all' ? 'all' : filters.read ? 'read' : 'unread'}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    read: e.target.value === 'all' ? 'all' : e.target.value === 'read' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white dark:bg-white/10 text-gray-900 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value="unread">Não lidas</option>
                  <option value="read">Lidas</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications List */}
      <div className="space-y-2">
        {loading && !hasInitialLoad ? (
          Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma notificação encontrada</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-white/10 p-4 cursor-pointer transition-all hover:shadow-md hover:bg-white/90 dark:hover:bg-white/10",
                  !notification.is_read && "bg-pink-50/80 border-pink-200 dark:bg-pink-500/10 dark:border-pink-500/30"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {/* User Avatar */}
                      {notification.sender && (
                        <div 
                          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => handleUserClick(notification, e)}
                        >
                          <Image
                            src={notification.sender.avatar_url || '/placeholder-user.jpg'}
                            alt={notification.sender.username || 'Usuário'}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {notification.sender && (
                            <span 
                              className="font-semibold mr-1 text-gray-900 dark:text-white cursor-pointer hover:text-pink-500 transition-colors"
                              onClick={(e) => handleUserClick(notification, e)}
                            >
                              {notification.sender.name || notification.sender.username || 'Usuário'}
                            </span>
                          )}
                          <span className="text-gray-700 dark:text-gray-300">{notification.message || notification.content}</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                            className="mt-2 px-3 py-1 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600 transition-colors"
                          >
                            Seguir de volta
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification)
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
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
                      className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                      title="Remover notificação"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

          </>
        )}
      </div>
    </div>
  )
}