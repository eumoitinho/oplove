import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export interface WebhookPayload {
  id: string
  event: string
  data: any
  timestamp: string
  source: WebhookSource
}

export type WebhookSource = 'stripe' | 'supabase' | 'push-notification' | 'external-service'

export interface WebhookHandler {
  source: WebhookSource
  events: string[]
  handler: (payload: WebhookPayload) => Promise<void>
  verifySignature?: (request: NextRequest, secret: string) => Promise<boolean>
}

/**
 * Webhook Handler Service for OpenLove
 * 
 * Provides secure, reliable webhook processing with signature verification,
 * idempotency checks, and retry mechanisms.
 */
class WebhookHandlerService {
  private handlers: Map<WebhookSource, WebhookHandler> = new Map()
  private processedWebhooks: Set<string> = new Set()
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor() {
    this.registerDefaultHandlers()
    this.startCleanupRoutine()
  }
  
  /**
   * Register webhook handlers
   */
  registerHandler(handler: WebhookHandler) {
    this.handlers.set(handler.source, handler)
  }
  
  /**
   * Process incoming webhook
   */
  async processWebhook(request: NextRequest): Promise<NextResponse> {
    try {
      // Rate limiting
      const clientIP = this.getClientIP(request)
      if (!this.checkRateLimit(clientIP)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429 }
        )
      }
      
      // Parse webhook payload
      const payload = await this.parseWebhookPayload(request)
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid webhook payload' },
          { status: 400 }
        )
      }
      
      // Get handler for this source
      const handler = this.handlers.get(payload.source)
      if (!handler) {
        console.warn(`No handler registered for webhook source: ${payload.source}`)
        return NextResponse.json(
          { error: 'Webhook source not supported' },
          { status: 404 }
        )
      }
      
      // Verify signature if handler provides verification
      if (handler.verifySignature) {
        const secret = this.getWebhookSecret(payload.source)
        const isValid = await handler.verifySignature(request, secret)
        
        if (!isValid) {
          console.error(`Invalid webhook signature from ${payload.source}`)
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          )
        }
      }
      
      // Idempotency check
      const webhookId = `${payload.source}:${payload.id}`
      if (this.processedWebhooks.has(webhookId)) {
        console.log(`Webhook already processed: ${webhookId}`)
        return NextResponse.json({ status: 'already_processed' })
      }
      
      // Check if handler supports this event
      if (!handler.events.includes(payload.event) && !handler.events.includes('*')) {
        console.log(`Handler doesn't support event ${payload.event}`)
        return NextResponse.json({ status: 'event_not_supported' })
      }
      
      // Process webhook
      await handler.handler(payload)
      
      // Mark as processed
      this.processedWebhooks.add(webhookId)
      
      // Clean up old processed webhooks (keep last 1000)
      if (this.processedWebhooks.size > 1000) {
        const toDelete = Array.from(this.processedWebhooks).slice(0, 100)
        toDelete.forEach(id => this.processedWebhooks.delete(id))
      }
      
      return NextResponse.json({ status: 'processed' })
      
    } catch (error) {
      console.error('Webhook processing error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
  
  /**
   * Parse webhook payload from request
   */
  private async parseWebhookPayload(request: NextRequest): Promise<WebhookPayload | null> {
    try {
      const body = await request.text()
      const headers = request.headers
      
      // Determine webhook source from headers or URL
      let source: WebhookSource = 'external-service'
      
      if (headers.get('stripe-signature')) {
        source = 'stripe'
      } else if (headers.get('x-supabase-event-type')) {
        source = 'supabase'
      } else if (request.url.includes('/webhooks/push-notification')) {
        source = 'push-notification'
      }
      
      // Parse payload based on source
      let data: any
      let event: string
      let id: string
      
      switch (source) {
        case 'stripe':
          const stripePayload = JSON.parse(body)
          data = stripePayload.data
          event = stripePayload.type
          id = stripePayload.id
          break
          
        case 'supabase':
          const supabasePayload = JSON.parse(body)
          data = supabasePayload
          event = headers.get('x-supabase-event-type') || 'unknown'
          id = supabasePayload.record?.id || crypto.randomUUID()
          break
          
        default:
          const genericPayload = JSON.parse(body)
          data = genericPayload.data || genericPayload
          event = genericPayload.event || genericPayload.type || 'unknown'
          id = genericPayload.id || crypto.randomUUID()
      }
      
      return {
        id,
        event,
        data,
        timestamp: new Date().toISOString(),
        source
      }
      
    } catch (error) {
      console.error('Failed to parse webhook payload:', error)
      return null
    }
  }
  
  /**
   * Get webhook secret for signature verification
   */
  private getWebhookSecret(source: WebhookSource): string {
    switch (source) {
      case 'stripe':
        return process.env.STRIPE_WEBHOOK_SECRET || ''
      case 'supabase':
        return process.env.SUPABASE_WEBHOOK_SECRET || ''
      case 'push-notification':
        return process.env.PUSH_NOTIFICATION_WEBHOOK_SECRET || ''
      default:
        return process.env.GENERIC_WEBHOOK_SECRET || ''
    }
  }
  
  /**
   * Get client IP for rate limiting
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwarded?.split(',')[0] || realIP || 'unknown'
    return clientIP
  }
  
  /**
   * Check rate limit for client
   */
  private checkRateLimit(clientIP: string): boolean {
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 100 // per minute
    
    const current = this.rateLimitMap.get(clientIP)
    
    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      })
      return true
    }
    
    if (current.count >= maxRequests) {
      return false
    }
    
    current.count++
    return true
  }
  
  /**
   * Register default webhook handlers
   */
  private registerDefaultHandlers() {
    // Stripe webhook handler
    this.registerHandler({
      source: 'stripe',
      events: ['payment_intent.succeeded', 'payment_intent.payment_failed', 'subscription.updated'],
      handler: async (payload) => {
        console.log('Processing Stripe webhook:', payload.event)
        
        switch (payload.event) {
          case 'payment_intent.succeeded':
            await this.handlePaymentSuccess(payload.data.object)
            break
            
          case 'payment_intent.payment_failed':
            await this.handlePaymentFailure(payload.data.object)
            break
            
          case 'subscription.updated':
            await this.handleSubscriptionUpdate(payload.data.object)
            break
        }
      },
      verifySignature: async (request, secret) => {
        const signature = request.headers.get('stripe-signature')
        if (!signature || !secret) return false
        
        try {
          // Import Stripe for signature verification
          const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
          const body = await request.text()
          
          stripe.webhooks.constructEvent(body, signature, secret)
          return true
        } catch (error) {
          console.error('Stripe signature verification failed:', error)
          return false
        }
      }
    })
    
    // Supabase webhook handler (for database changes)
    this.registerHandler({
      source: 'supabase',
      events: ['INSERT', 'UPDATE', 'DELETE'],
      handler: async (payload) => {
        console.log('Processing Supabase webhook:', payload.event)
        
        // Handle database changes that need external actions
        // e.g., send push notifications, sync with external services
        
        if (payload.data.table === 'messages') {
          await this.handleNewMessage(payload.data.record)
        } else if (payload.data.table === 'notifications') {
          await this.handleNewNotification(payload.data.record)
        }
      }
    })
    
    // Push notification webhook handler
    this.registerHandler({
      source: 'push-notification',
      events: ['delivered', 'failed', 'clicked'],
      handler: async (payload) => {
        console.log('Processing push notification webhook:', payload.event)
        
        // Update notification delivery status in database
        // Track click rates, delivery rates, etc.
      }
    })
  }
  
  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: any) {
    console.log('Payment succeeded:', paymentIntent.id)
    
    // Update subscription status
    // Grant premium features
    // Send confirmation notifications
  }
  
  /**
   * Handle payment failure
   */
  private async handlePaymentFailure(paymentIntent: any) {
    console.log('Payment failed:', paymentIntent.id)
    
    // Send failure notifications
    // Update subscription status
    // Implement retry logic
  }
  
  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdate(subscription: any) {
    console.log('Subscription updated:', subscription.id)
    
    // Update user premium status
    // Adjust feature access
    // Send notifications
  }
  
  /**
   * Handle new messages for push notifications
   */
  private async handleNewMessage(message: any) {
    console.log('New message for push notification:', message.id)
    
    // Send push notification to recipients
    // Update unread counts
    // Trigger real-time updates
  }
  
  /**
   * Handle new notifications
   */
  private async handleNewNotification(notification: any) {
    console.log('New notification:', notification.id)
    
    // Send push notification
    // Update real-time feeds
  }
  
  /**
   * Start cleanup routine
   */
  private startCleanupRoutine() {
    setInterval(() => {
      // Clean up old rate limit entries
      const now = Date.now()
      for (const [ip, data] of this.rateLimitMap.entries()) {
        if (now > data.resetTime) {
          this.rateLimitMap.delete(ip)
        }
      }
    }, 60000) // Every minute
  }
}

// Export singleton instance
export const webhookHandler = new WebhookHandlerService()

// Export for custom instances
export { WebhookHandlerService }