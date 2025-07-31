import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getAbacatePayService } from "@/lib/services/abacatepay.service"
import { headers } from "next/headers"
import rateLimiter, { RATE_LIMIT_CONFIGS, getClientIP } from "@/lib/utils/rate-limit"

// POST /api/v1/payments/webhook/abacatepay - Handle AbacatePay webhooks
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const clientIP = getClientIP(request)
  const rateLimitResult = await rateLimiter.checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.webhook)
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for AbacatePay webhook from IP: ${clientIP}`)
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
    const signature = headersList.get("x-abacatepay-signature") || ""
    
    // Verify webhook signature
    const abacatePayService = getAbacatePayService()
    const isValidSignature = abacatePayService.verifyWebhookSignature(body, signature)
    
    if (!isValidSignature) {
      console.error("Invalid AbacatePay webhook signature")
      return NextResponse.json(
        { error: "Invalid signature", success: false },
        { status: 401 }
      )
    }

    const webhookData = JSON.parse(body)
    const processedWebhook = abacatePayService.processWebhook(webhookData)
    
    const supabase = createServerClient()

    // Handle different webhook events
    switch (processedWebhook.type) {
      case "payment.succeeded":
        await handlePaymentSucceeded(supabase, processedWebhook.data)
        break
        
      case "payment.expired":
        await handlePaymentExpired(supabase, processedWebhook.data)
        break
        
      case "payment.canceled":
        await handlePaymentCanceled(supabase, processedWebhook.data)
        break
        
      default:
        console.log(`Unhandled AbacatePay webhook event: ${processedWebhook.type}`)
    }

    // Log webhook event
    await supabase
      .from("webhook_events")
      .insert({
        provider: "abacatepay",
        event_type: processedWebhook.type,
        event_data: processedWebhook.data,
        processed: true,
        processed_at: new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("AbacatePay webhook processing error:", error)
    
    // Log failed webhook
    try {
      const supabase = createServerClient()
      await supabase
        .from("webhook_events")
        .insert({
          provider: "abacatepay",
          event_type: "unknown",
          event_data: { error: error.message },
          processed: false,
          error_message: error.message,
        })
    } catch (logError) {
      console.error("Failed to log webhook error:", logError)
    }
    
    return NextResponse.json(
      { error: "Webhook processing failed", success: false },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(supabase: any, data: any) {
  try {
    // Check if this is a credit purchase
    if (data.metadata?.type === 'credit_purchase') {
      await handleCreditPurchaseSucceeded(supabase, data)
      return
    }

    // Otherwise, handle as subscription payment
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("provider_subscription_id", data.id)
      .single()

    if (subError || !subscription) {
      console.error("Subscription not found for payment:", data.id)
      return
    }

    // Update subscription status to active
    await supabase
      .from("subscriptions")
      .update({
        status: "active",
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    // Update user premium status
    await supabase
      .from("users")
      .update({
        premium_type: subscription.plan_type,
        premium_expires_at: subscription.current_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscription.user_id)

    // Update payment history
    await supabase
      .from("payment_history")
      .update({
        status: "completed",
        paid_at: data.paidAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", data.id)

    console.log(`Payment succeeded for subscription: ${subscription.id}`)
  } catch (error) {
    console.error("Error handling payment succeeded:", error)
    throw error
  }
}

async function handleCreditPurchaseSucceeded(supabase: any, data: any) {
  try {
    const { business_id, package_id, credits } = data.metadata || {}
    
    if (!business_id || !package_id || !credits) {
      console.error("Invalid credit purchase metadata:", data.metadata)
      return
    }

    // Get the pending transaction
    const { data: transaction, error: txError } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("payment_reference", data.id)
      .eq("payment_status", "pending")
      .single()

    if (txError || !transaction) {
      console.error("Pending transaction not found for payment:", data.id)
      return
    }

    // Get current business credit balance
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("credit_balance")
      .eq("id", business_id)
      .single()

    if (bizError || !business) {
      console.error("Business not found:", business_id)
      return
    }

    const newBalance = business.credit_balance + credits

    // Start a transaction to update both the business balance and transaction record
    const { error: updateError } = await supabase.rpc("process_credit_purchase", {
      p_business_id: business_id,
      p_transaction_id: transaction.id,
      p_new_balance: newBalance,
      p_payment_id: data.id,
      p_paid_at: data.paidAt || new Date().toISOString()
    })

    if (updateError) {
      // If the RPC doesn't exist, do it manually
      // Update business credit balance
      await supabase
        .from("businesses")
        .update({
          credit_balance: newBalance,
          total_credits_purchased: supabase.raw("total_credits_purchased + ?", [credits]),
          updated_at: new Date().toISOString()
        })
        .eq("id", business_id)

      // Update transaction status
      await supabase
        .from("credit_transactions")
        .update({
          payment_status: "paid",
          balance_after: newBalance,
          metadata: {
            ...transaction.metadata,
            paid_at: data.paidAt || new Date().toISOString(),
            payment_provider_data: data
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", transaction.id)
    }

    console.log(`Credit purchase succeeded for business ${business_id}: ${credits} credits added`)
  } catch (error) {
    console.error("Error handling credit purchase succeeded:", error)
    throw error
  }
}

async function handlePaymentExpired(supabase: any, data: any) {
  try {
    // Check if this is a credit purchase
    if (data.metadata?.type === 'credit_purchase') {
      // Update credit transaction status
      await supabase
        .from("credit_transactions")
        .update({
          payment_status: "expired",
          metadata: {
            expired_at: data.expiredAt || new Date().toISOString(),
            payment_provider_data: data
          },
          updated_at: new Date().toISOString()
        })
        .eq("payment_reference", data.id)
        .eq("payment_status", "pending")
      
      console.log(`Credit purchase payment expired: ${data.id}`)
      return
    }

    // Otherwise, handle as subscription payment
    await supabase
      .from("subscriptions")
      .update({
        status: "expired",
        expired_at: data.expiredAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", data.id)

    // Update payment history
    await supabase
      .from("payment_history")
      .update({
        status: "expired",
        expired_at: data.expiredAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", data.id)

    console.log(`Payment expired for payment: ${data.id}`)
  } catch (error) {
    console.error("Error handling payment expired:", error)
    throw error
  }
}

async function handlePaymentCanceled(supabase: any, data: any) {
  try {
    // Check if this is a credit purchase
    if (data.metadata?.type === 'credit_purchase') {
      // Update credit transaction status
      await supabase
        .from("credit_transactions")
        .update({
          payment_status: "canceled",
          metadata: {
            canceled_at: data.canceledAt || new Date().toISOString(),
            payment_provider_data: data
          },
          updated_at: new Date().toISOString()
        })
        .eq("payment_reference", data.id)
        .eq("payment_status", "pending")
      
      console.log(`Credit purchase payment canceled: ${data.id}`)
      return
    }

    // Otherwise, handle as subscription payment
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        canceled_at: data.canceledAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_subscription_id", data.id)

    // Update payment history
    await supabase
      .from("payment_history")
      .update({
        status: "canceled",
        canceled_at: data.canceledAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_payment_id", data.id)

    console.log(`Payment canceled for payment: ${data.id}`)
  } catch (error) {
    console.error("Error handling payment canceled:", error)
    throw error
  }
}