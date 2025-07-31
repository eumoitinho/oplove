import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"
import Stripe from "stripe"
import rateLimiter, { RATE_LIMIT_CONFIGS, getClientIP } from "@/lib/utils/rate-limit"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

// POST /api/v1/payments/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.webhook)
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for webhook from IP: ${clientIP}`)
    return NextResponse.json(
      { 
        error: "Too many requests", 
        retryAfter: rateLimitResult.retryAfter,
        success: false 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        }
      }
    )
  }

  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get("stripe-signature")
    
    if (!signature) {
      console.error("Missing Stripe signature")
      return NextResponse.json(
        { error: "Missing signature", success: false },
        { status: 401 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature", success: false },
        { status: 401 }
      )
    }
    
    const supabase = createServerClient()

    // Log webhook event for debugging
    await supabase
      .from("webhook_events")
      .insert({
        provider: "stripe",
        event_type: event.type,
        event_data: event.data,
        processed: false,
      })
      .then(() => console.log(`Logged Stripe webhook event: ${event.type}`))
      .catch(err => console.error("Failed to log webhook event:", err))

    // Handle different Stripe webhook events
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(supabase, event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(supabase, event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`)
    }

    // Mark webhook as processed
    await supabase
      .from("webhook_events")
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq("provider", "stripe")
      .eq("event_type", event.type)
      .eq("processed", false)
      .order("created_at", { ascending: false })
      .limit(1)

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    })
  } catch (error) {
    console.error("Stripe webhook processing error:", error)
    
    // Log failed webhook
    try {
      const supabase = createServerClient()
      await supabase
        .from("webhook_events")
        .insert({
          provider: "stripe",
          event_type: "unknown",
          event_data: { error: error.message },
          processed: false,
          error_message: error.message,
        })
    } catch (logError) {
      console.error("Failed to log webhook error:", logError)
    }
    
    return NextResponse.json(
      { error: "Erro ao processar webhook", success: false },
      { status: 500 }
    )
  }
}

// Stripe webhook handlers
async function handlePaymentIntentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    const { user_id, subscription_id } = paymentIntent.metadata || {}
    
    if (!user_id) {
      console.error("No user_id in payment intent metadata")
      return
    }

    // Update payment history
    await supabase
      .from("payment_history")
      .update({
        status: "completed",
        paid_at: new Date(paymentIntent.created * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", paymentIntent.id)

    console.log(`Payment intent succeeded: ${paymentIntent.id}`)
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error)
    throw error
  }
}

async function handlePaymentIntentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment history
    await supabase
      .from("payment_history")
      .update({
        status: "failed",
        error_message: paymentIntent.last_payment_error?.message || "Payment failed",
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", paymentIntent.id)

    console.log(`Payment intent failed: ${paymentIntent.id}`)
  } catch (error) {
    console.error("Error handling payment intent failed:", error)
    throw error
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  try {
    const subscription = invoice.subscription as string
    
    if (!subscription) {
      console.error("No subscription in invoice")
      return
    }

    // Find subscription in database
    const { data: dbSubscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("provider_subscription_id", subscription)
      .single()

    if (error || !dbSubscription) {
      console.error("Subscription not found for invoice:", subscription)
      return
    }

    // Update subscription status
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbSubscription.id)

    // Update user premium status
    await supabase
      .from("users")
      .update({
        premium_type: dbSubscription.plan_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbSubscription.user_id)

    console.log(`Invoice payment succeeded for subscription: ${subscription}`)
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error)
    throw error
  }
}

async function handleInvoicePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  try {
    const subscription = invoice.subscription as string
    
    if (!subscription) {
      console.error("No subscription in invoice")
      return
    }

    // Update subscription status to past_due
    await supabase
      .from("subscriptions")
      .update({
        status: "past_due",
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", subscription)

    console.log(`Invoice payment failed for subscription: ${subscription}`)
  } catch (error) {
    console.error("Error handling invoice payment failed:", error)
    throw error
  }
}

async function handleSubscriptionCreated(supabase: any, subscription: Stripe.Subscription) {
  try {
    const { user_id, plan_type } = subscription.metadata || {}
    
    if (!user_id || !plan_type) {
      console.error("Missing metadata in subscription:", subscription.id)
      return
    }

    console.log(`Subscription created: ${subscription.id} for user: ${user_id}`)
  } catch (error) {
    console.error("Error handling subscription created:", error)
    throw error
  }
}

async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status === "active" ? "active" : 
               subscription.status === "canceled" ? "cancelled" :
               subscription.status === "past_due" ? "past_due" : "pending",
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", subscription.id)

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription updated:", error)
    throw error
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  try {
    // Get subscription from database
    const { data: dbSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("provider_subscription_id", subscription.id)
      .single()

    if (dbSubscription) {
      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", dbSubscription.id)

      // Update user to free plan
      await supabase
        .from("users")
        .update({
          premium_type: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", dbSubscription.user_id)
    }

    console.log(`Subscription deleted: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling subscription deleted:", error)
    throw error
  }
}