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
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { notificationsService, type Notification, type NotificationFilters } from '@/lib/services/notifications-service'
import { PostSkeleton } from '@/components/feed/PostSkeleton'
import type { NotificationData } from '@/types/common'

interface NotificationsViewProps {
  className?: string
}

export function NotificationsView({ className }: NotificationsViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    read: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)


  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return

    const unsubscribe = notificationsService.subscribeToNotifications(
      user.id,
      (notification) => {
        setNotifications(prev => [notification, ...prev])
        showToast(notification.message, 'info')
      }
    )

    return unsubscribe
  }, [user, showToast])

  // Infinite scroll fetch function
  const fetchNotifications = useCallback(async (pageNum: number) => {
    if (!user) {
      return { data: [], hasMore: false }
    }

    try {
      const result = await notificationsService.getNotifications(
        user.id,
        pageNum,
        20,
        filters
      )
      
      return {
        data: result.notifications,
        hasMore: result.hasMore,
        total: result.total
      }
    } catch (error) {
      showToast('Erro ao carregar notificações', 'error')
      return { data: [], hasMore: false }
    }
  }, [user, filters, showToast])

  // Use infinite scroll hook
  const {
    data: scrollNotifications,
    loading: scrollLoading,
    hasMore,
    loadMore,
    refresh,
    containerRef,
    loadingState
  } = useInfiniteScroll({
    fetchFn: fetchNotifications,
    limit: 20,
    enabled: !!user,
    dependencies: [filters]
  })

  // Update local state when scroll data changes
  useEffect(() => {
    setNotifications(scrollNotifications)
    setLoading(scrollLoading)
  }, [scrollNotifications, scrollLoading])

  // Mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return

    try {
      await notificationsService.markAsRead(notification.id)
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      )
    } catch (error) {
      showToast('Erro ao marcar como lida', 'error')
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await notificationsService.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      showToast('Todas as notificações foram marcadas como lidas', 'success')
    } catch (error) {
      showToast('Erro ao marcar todas como lidas', 'error')
    }
  }

  // Delete notification
  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      showToast('Notificação removida', 'success')
    } catch (error) {
      showToast('Erro ao remover notificação', 'error')
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    await handleMarkAsRead(notification)

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.entity_id) {
          router.push(`/post/${notification.entity_id}`)
        }
        break
      case 'follow':
        if (notification.sender_id) {
          router.push(`/profile/${notification.sender?.username}`)
        }
        break
      case 'message':
        router.push('/messages')
        break
      case 'post':
        if (notification.entity_id) {
          router.push(`/post/${notification.entity_id}`)
        }
        break
    }
  }

  // Quick action: Follow back
  const handleFollowBack = async (notification: Notification) => {
    if (!notification.sender_id) return

    try {
      await notificationsService.performQuickAction(notification.id, 'follow_back')
      // TODO: Call follow API
      showToast('Seguindo de volta!', 'success')
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, action_taken: true } : n)
      )
    } catch (error) {
      showToast('Erro ao seguir de volta', 'error')
    }
  }

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-purple-500" />
      case 'message':
        return <Mail className="h-5 w-5 text-cyan-500" />
      case 'post':
        return <FileText className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Marcar todas como lidas
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showFilters ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"
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
            className="bg-white rounded-lg border p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <select
                  value={filters.read === 'all' ? 'all' : filters.read ? 'read' : 'unread'}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    read: e.target.value === 'all' ? 'all' : e.target.value === 'read' 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        {loading && notifications.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma notificação encontrada</p>
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
                  "bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md",
                  !notification.is_read && "bg-purple-50 border-purple-200"
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
                        <div className="flex-shrink-0">
                          <Image
                            src={notification.sender.avatar_url || '/placeholder-user.jpg'}
                            alt={notification.sender.username}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="flex-1">
                        <p className="text-sm">
                          {notification.sender && (
                            <span className="font-semibold mr-1">
                              {notification.sender.name || notification.sender.username}
                            </span>
                          )}
                          <span className="text-gray-700">{notification.message}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
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
                            className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700 transition-colors"
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
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Marcar como lida"
                      >
                        <Check className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(notification.id)
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Remover notificação"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load more trigger */}
            {hasMore && (
              <div ref={containerRef} className="py-4">
                {loading && <PostSkeleton />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}