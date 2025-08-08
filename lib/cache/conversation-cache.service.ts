/**
 * Conversation Cache Service
 * Works with Redis when available, falls back to simple in-memory cache
 */

import { simpleCache } from './simple-cache.service'

// Only import Redis if the environment variable is available
let Redis: any = null
let redis: any = null

if (process.env.UPSTASH_REDIS_REST_URL) {
  try {
    Redis = require('@upstash/redis').Redis
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  } catch (error) {
    console.warn('Redis not available, using simple cache')
  }
}

async function compress(text: string): Promise<string> {
  // Simple compression: just return the text for now
  return text
}

async function decompress(text: string): Promise<string> {
  // Simple decompression: just return the text for now
  return text
}

export class ConversationCacheService {
  private readonly TTL = {
    CONVERSATIONS: 300, // 5 minutes
    MESSAGES: 180, // 3 minutes
    TYPING: 3, // 3 seconds
    ONLINE_STATUS: 60, // 1 minute
    UNREAD_COUNT: 120, // 2 minutes
  }

  private async setCache(key: string, value: string, ttl: number): Promise<void> {
    try {
      if (redis) {
        await redis.setex(key, ttl, value)
      } else {
        simpleCache.set(key, value, ttl)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  private async getCache(key: string): Promise<string | null> {
    try {
      if (redis) {
        return await redis.get(key)
      } else {
        return simpleCache.get(key)
      }
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  private async deleteCache(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key)
      } else {
        simpleCache.delete(key)
      }
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  private async getKeys(pattern: string): Promise<string[]> {
    try {
      if (redis) {
        return await redis.keys(pattern)
      } else {
        return simpleCache.keys(pattern)
      }
    } catch (error) {
      console.error('Cache keys error:', error)
      return []
    }
  }

  /**
   * Cache conversation list for a user
   */
  async setConversations(userId: string, conversations: any[]): Promise<void> {
    const key = `conversations:${userId}`
    const compressed = await compress(JSON.stringify(conversations))
    await this.setCache(key, compressed, this.TTL.CONVERSATIONS)
  }

  /**
   * Get cached conversations for a user
   */
  async getConversations(userId: string): Promise<any[] | null> {
    const key = `conversations:${userId}`
    const compressed = await this.getCache(key)
    if (!compressed) return null
    
    try {
      const decompressed = await decompress(compressed)
      return JSON.parse(decompressed)
    } catch (error) {
      console.error('Error parsing cached conversations:', error)
      return null
    }
  }

  /**
   * Cache messages for a conversation
   */
  async setMessages(
    conversationId: string,
    page: number,
    messages: any[]
  ): Promise<void> {
    const key = `messages:${conversationId}:${page}`
    const compressed = await compress(JSON.stringify(messages))
    await this.setCache(key, compressed, this.TTL.MESSAGES)
  }

  /**
   * Get cached messages for a conversation
   */
  async getMessages(
    conversationId: string,
    page: number
  ): Promise<any[] | null> {
    const key = `messages:${conversationId}:${page}`
    const compressed = await this.getCache(key)
    if (!compressed) return null
    
    try {
      const decompressed = await decompress(compressed)
      return JSON.parse(decompressed)
    } catch (error) {
      console.error('Error parsing cached messages:', error)
      return null
    }
  }

  /**
   * Set typing indicator
   */
  async setTyping(
    conversationId: string,
    userId: string,
    username: string
  ): Promise<void> {
    const key = `typing:${conversationId}:${userId}`
    const value = JSON.stringify({ username, timestamp: Date.now() })
    await this.setCache(key, value, this.TTL.TYPING)
  }

  /**
   * Get all users typing in a conversation
   */
  async getTypingUsers(conversationId: string): Promise<string[]> {
    const pattern = `typing:${conversationId}:*`
    const keys = await this.getKeys(pattern)
    
    if (keys.length === 0) return []
    
    const users: string[] = []
    for (const key of keys) {
      const data = await this.getCache(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          users.push(parsed.username)
        } catch (error) {
          console.error('Error parsing typing data:', error)
        }
      }
    }
    
    return users
  }

  /**
   * Cache online status
   */
  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const key = `online:${userId}`
    await this.setCache(key, isOnline ? '1' : '0', this.TTL.ONLINE_STATUS)
  }

  /**
   * Get online status for multiple users
   */
  async getOnlineStatus(userIds: string[]): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {}
    
    for (const userId of userIds) {
      const key = `online:${userId}`
      const value = await this.getCache(key)
      status[userId] = value === '1'
    }
    
    return status
  }

  /**
   * Cache unread count
   */
  async setUnreadCount(
    userId: string,
    conversationId: string,
    count: number
  ): Promise<void> {
    const key = `unread:${userId}:${conversationId}`
    await this.setCache(key, count.toString(), this.TTL.UNREAD_COUNT)
  }

  /**
   * Get cached unread count
   */
  async getUnreadCount(
    userId: string,
    conversationId: string
  ): Promise<number | null> {
    const key = `unread:${userId}:${conversationId}`
    const count = await this.getCache(key)
    return count ? parseInt(count, 10) : null
  }

  /**
   * Invalidate conversation cache
   */
  async invalidateConversation(conversationId: string): Promise<void> {
    try {
      // Delete conversation-specific caches
      const patterns = [
        `messages:${conversationId}:*`,
        `unread:*:${conversationId}`,
        'conversations:*' // Invalidate all user conversation lists
      ]

      for (const pattern of patterns) {
        const keys = await this.getKeys(pattern)
        for (const key of keys) {
          await this.deleteCache(key)
        }
      }
    } catch (error) {
      console.error('Error invalidating conversation cache:', error)
    }
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
      const patterns = [
        `conversations:${userId}`,
        `online:${userId}`,
        `unread:${userId}:*`
      ]

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          const keys = await this.getKeys(pattern)
          for (const key of keys) {
            await this.deleteCache(key)
          }
        } else {
          await this.deleteCache(pattern)
        }
      }
    } catch (error) {
      console.error('Error invalidating user cache:', error)
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    conversationsCached: number
    messagesCached: number
    typingIndicators: number
    onlineUsers: number
  }> {
    try {
      const [convKeys, msgKeys, typingKeys, onlineKeys] = await Promise.all([
        this.getKeys('conversations:*'),
        this.getKeys('messages:*'),
        this.getKeys('typing:*'),
        this.getKeys('online:*'),
      ])

      return {
        conversationsCached: convKeys.length,
        messagesCached: msgKeys.length,
        typingIndicators: typingKeys.length,
        onlineUsers: onlineKeys.length,
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return {
        conversationsCached: 0,
        messagesCached: 0,
        typingIndicators: 0,
        onlineUsers: 0,
      }
    }
  }

  /**
   * Clear all conversation-related caches
   */
  async clearAllCaches(): Promise<void> {
    try {
      const patterns = [
        'conversations:*',
        'messages:*',
        'typing:*',
        'online:*',
        'unread:*',
      ]

      for (const pattern of patterns) {
        const keys = await this.getKeys(pattern)
        for (const key of keys) {
          await this.deleteCache(key)
        }
      }
    } catch (error) {
      console.error('Error clearing caches:', error)
    }
  }
}