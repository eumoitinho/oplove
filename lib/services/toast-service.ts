import type { ToastType } from '@/components/common/EngagementToast'

interface ToastUser {
  id: string
  name: string
  username: string
  avatar_url?: string
  is_verified?: boolean
  premium_type?: "gold" | "diamond" | "couple" | null
}

interface ToastOptions {
  type: ToastType
  users: ToastUser[]
  count?: number
  message?: string
  onAction?: () => void
  duration?: number
}

class ToastService {
  private toastQueue: ToastOptions[] = []
  private isProcessing = false

  /**
   * Show an engagement toast notification
   */
  show(options: ToastOptions) {
    // Add to queue
    this.toastQueue.push(options)
    
    // Process queue
    this.processQueue()
  }

  /**
   * Show a success toast (uses engagement toast for consistency)
   */
  success(message: string, user?: ToastUser) {
    this.show({
      type: 'like',
      users: user ? [user] : [],
      message,
      duration: 4000
    })
  }

  /**
   * Show an error toast
   */
  error(message: string) {
    // For errors, we'll use the window.alert as fallback
    // In production, this should use a proper error toast
    console.error('Toast Error:', message)
  }

  /**
   * Show a new post notification
   */
  newPost(user: ToastUser, count: number = 1) {
    this.show({
      type: 'new_post',
      users: [user],
      count,
      onAction: () => window.location.reload()
    })
  }

  /**
   * Show a like notification
   */
  like(users: ToastUser[], count?: number) {
    this.show({
      type: 'like',
      users,
      count: count || users.length
    })
  }

  /**
   * Show a comment notification
   */
  comment(user: ToastUser, comment: string) {
    this.show({
      type: 'comment',
      users: [user],
      message: `comentou: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`
    })
  }

  /**
   * Show a follow notification
   */
  follow(user: ToastUser) {
    this.show({
      type: 'follow',
      users: [user],
      onAction: () => window.location.href = `/profile/${user.username}`
    })
  }

  /**
   * Show a message notification
   */
  message(user: ToastUser, preview?: string) {
    this.show({
      type: 'message',
      users: [user],
      message: preview ? `enviou: "${preview.substring(0, 30)}${preview.length > 30 ? '...' : ''}"` : undefined,
      onAction: () => window.location.href = '/messages'
    })
  }

  /**
   * Show a profile visit notification
   */
  visit(users: ToastUser[], count?: number) {
    this.show({
      type: 'visit',
      users,
      count: count || users.length,
      onAction: () => window.location.href = '/profile/visitors'
    })
  }

  /**
   * Show a story view notification
   */
  storyView(users: ToastUser[], count: number) {
    this.show({
      type: 'story_view',
      users,
      count
    })
  }

  /**
   * Show a gift received notification
   */
  giftReceived(user: ToastUser, giftName: string) {
    this.show({
      type: 'gift_received',
      users: [user],
      message: `enviou ${giftName}`
    })
  }

  /**
   * Process the toast queue
   */
  private async processQueue() {
    if (this.isProcessing || this.toastQueue.length === 0) return

    this.isProcessing = true

    while (this.toastQueue.length > 0) {
      const toast = this.toastQueue.shift()
      if (toast && typeof window !== 'undefined' && window.showEngagementToast) {
        window.showEngagementToast(toast)
        
        // Wait a bit before showing the next toast
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    this.isProcessing = false
  }
}

// Export singleton instance
export const toastService = new ToastService()

// Export convenience functions
export const toast = {
  show: (options: ToastOptions) => toastService.show(options),
  success: (message: string, user?: ToastUser) => toastService.success(message, user),
  error: (message: string) => toastService.error(message),
  newPost: (user: ToastUser, count?: number) => toastService.newPost(user, count),
  like: (users: ToastUser[], count?: number) => toastService.like(users, count),
  comment: (user: ToastUser, comment: string) => toastService.comment(user, comment),
  follow: (user: ToastUser) => toastService.follow(user),
  message: (user: ToastUser, preview?: string) => toastService.message(user, preview),
  visit: (users: ToastUser[], count?: number) => toastService.visit(users, count),
  storyView: (users: ToastUser[], count: number) => toastService.storyView(users, count),
  giftReceived: (user: ToastUser, giftName: string) => toastService.giftReceived(user, giftName)
}