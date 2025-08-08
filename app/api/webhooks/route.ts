import { NextRequest } from 'next/server'
import { webhookHandler } from '@/lib/services/webhook-handler'

/**
 * Generic webhook handler endpoint
 * 
 * Handles webhooks from various sources (Stripe, Supabase, Push notifications, etc.)
 * with automatic signature verification, rate limiting, and processing.
 */
export async function POST(request: NextRequest) {
  return await webhookHandler.processWebhook(request)
}

// Also handle GET for webhook verification (some services require it)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('hub.challenge')
  const verifyToken = searchParams.get('hub.verify_token')
  
  // Verify webhook subscription (for services like Facebook, etc.)
  if (challenge && verifyToken === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge)
  }
  
  return new Response('Webhook endpoint active', { status: 200 })
}