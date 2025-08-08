/**
 * Notification Formatter
 * Formats notifications with the pattern: "{username} action. há X tempo"
 */

interface NotificationData {
  type: 'like' | 'comment' | 'repost' | 'follow' | 'message' | 'comment_reply' | 'mutual_like'
  senderUsername: string
  senderName?: string
  targetType?: 'post' | 'comment' | 'story' | 'profile'
  commentPreview?: string
  timestamp: Date | string
}

/**
 * Format time ago in Portuguese
 * Returns: "há X segundos/minutos/horas/dias"
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffInMs = now.getTime() - past.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  
  // Less than a minute
  if (diffInSeconds < 60) {
    if (diffInSeconds < 5) return 'agora mesmo'
    return `há ${diffInSeconds} segundo${diffInSeconds !== 1 ? 's' : ''}`
  }
  
  // Less than an hour
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
  }
  
  // Less than a day
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `há ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
  }
  
  // Less than a week
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    if (diffInDays === 1) return 'há 1 dia'
    return `há ${diffInDays} dias`
  }
  
  // Less than a month
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    if (diffInWeeks === 1) return 'há 1 semana'
    return `há ${diffInWeeks} semanas`
  }
  
  // Less than a year
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    if (diffInMonths === 1) return 'há 1 mês'
    return `há ${diffInMonths} meses`
  }
  
  // Years
  const diffInYears = Math.floor(diffInDays / 365)
  if (diffInYears === 1) return 'há 1 ano'
  return `há ${diffInYears} anos`
}

/**
 * Format notification message
 * Returns formatted string like: "joão123 curtiu sua foto. há 2 minutos"
 */
export function formatNotificationMessage(data: NotificationData): string {
  const { type, senderUsername, targetType, commentPreview, timestamp } = data
  const timeAgo = formatTimeAgo(timestamp)
  
  switch (type) {
    case 'like':
      if (targetType === 'post') {
        return `${senderUsername} curtiu sua foto. ${timeAgo}`
      } else if (targetType === 'comment') {
        return `${senderUsername} curtiu seu comentário. ${timeAgo}`
      } else if (targetType === 'story') {
        return `${senderUsername} curtiu seu story. ${timeAgo}`
      }
      return `${senderUsername} curtiu seu conteúdo. ${timeAgo}`
    
    case 'comment':
      if (commentPreview) {
        const preview = commentPreview.length > 50 
          ? commentPreview.substring(0, 50) + '...'
          : commentPreview
        return `${senderUsername} comentou: "${preview}". ${timeAgo}`
      }
      return `${senderUsername} comentou em sua publicação. ${timeAgo}`
    
    case 'comment_reply':
      if (commentPreview) {
        const preview = commentPreview.length > 50 
          ? commentPreview.substring(0, 50) + '...'
          : commentPreview
        return `${senderUsername} respondeu: "${preview}". ${timeAgo}`
      }
      return `${senderUsername} respondeu seu comentário. ${timeAgo}`
    
    case 'repost':
      return `${senderUsername} repostou sua publicação. ${timeAgo}`
    
    case 'follow':
      return `${senderUsername} começou a seguir você. ${timeAgo}`
    
    case 'message':
      return `${senderUsername} enviou uma mensagem. ${timeAgo}`
    
    case 'mutual_like':
      return `${senderUsername} também curtiu você! 💕 Que tal mandar uma mensagem?`
    
    default:
      return `${senderUsername} interagiu com você. ${timeAgo}`
  }
}

/**
 * Format grouped notifications
 * Example: "joão123 e mais 5 pessoas curtiram sua foto"
 */
export function formatGroupedNotification(
  users: string[],
  action: string,
  timestamp: Date | string
): string {
  const timeAgo = formatTimeAgo(timestamp)
  
  if (users.length === 0) return ''
  
  if (users.length === 1) {
    return `${users[0]} ${action}. ${timeAgo}`
  }
  
  if (users.length === 2) {
    return `${users[0]} e ${users[1]} ${action}. ${timeAgo}`
  }
  
  if (users.length === 3) {
    return `${users[0]}, ${users[1]} e ${users[2]} ${action}. ${timeAgo}`
  }
  
  // More than 3 users
  const firstTwo = users.slice(0, 2).join(', ')
  const remaining = users.length - 2
  return `${firstTwo} e mais ${remaining} ${remaining === 1 ? 'pessoa' : 'pessoas'} ${action}. ${timeAgo}`
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: NotificationData['type']): string {
  switch (type) {
    case 'like':
      return '🔥'
    case 'comment':
    case 'comment_reply':
      return '💬'
    case 'repost':
      return '🔄'
    case 'follow':
      return '👤'
    case 'message':
      return '✉️'
    case 'mutual_like':
      return '💕'
    default:
      return '🔔'
  }
}

/**
 * Get notification action text for buttons
 */
export function getNotificationAction(type: NotificationData['type']): string {
  switch (type) {
    case 'like':
      return 'Ver publicação'
    case 'comment':
    case 'comment_reply':
      return 'Responder'
    case 'repost':
      return 'Ver repost'
    case 'follow':
      return 'Ver perfil'
    case 'message':
      return 'Abrir conversa'
    case 'mutual_like':
      return 'Enviar mensagem'
    default:
      return 'Ver'
  }
}

/**
 * Format notification for toast
 * Returns a shorter version for toast notifications
 */
export function formatToastNotification(data: NotificationData): string {
  const { type, senderUsername, commentPreview } = data
  
  switch (type) {
    case 'like':
      return `${senderUsername} curtiu sua foto 🔥`
    
    case 'comment':
      if (commentPreview) {
        const preview = commentPreview.length > 30 
          ? commentPreview.substring(0, 30) + '...'
          : commentPreview
        return `${senderUsername}: "${preview}"`
      }
      return `${senderUsername} comentou em sua foto`
    
    case 'repost':
      return `${senderUsername} repostou seu post 🔄`
    
    case 'follow':
      return `${senderUsername} seguiu você`
    
    case 'message':
      return `Nova mensagem de ${senderUsername}`
    
    case 'mutual_like':
      return `Match! ${senderUsername} também curtiu você 💕`
    
    default:
      return `Nova notificação de ${senderUsername}`
  }
}