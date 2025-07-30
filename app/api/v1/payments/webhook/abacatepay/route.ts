import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getAbacatePayService } from "@/lib/services/abacatepay.service"
import { headers } from "next/headers"

// POST /api/v1/payments/webhook/abacatepay - Handle AbacatePay webhooks
export async function POST(request: NextRequest) {
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
    // Find subscription by provider payment ID
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

async function handlePaymentExpired(supabase: any, data: any) {
  try {
    // Update subscription status to expired
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
    // Update subscription status to canceled
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