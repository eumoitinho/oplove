import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { headers } from "next/headers"

// POST /api/v1/payments/webhook - Handle payment provider webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headersList = headers()
    const signature = headersList.get("x-webhook-signature")
    
    // TODO: Verify webhook signature based on provider
    // This is a placeholder - implement actual signature verification
    
    const supabase = createServerClient()

    // Handle different webhook types
    const { event_type, data } = body

    switch (event_type) {
      case "payment.succeeded":
        // Handle successful payment
        const { subscription_id, payment_id } = data

        // Update subscription status
        const { data: subscription } = await supabase
          .from("subscriptions")
          .update({ 
            status: "active",
            activated_at: new Date().toISOString(),
          })
          .eq("payment_id", payment_id)
          .select()
          .single()

        if (subscription) {
          // Update user premium status
          await supabase
            .from("users")
            .update({
              premium_type: subscription.plan_id,
              premium_expires_at: subscription.end_date,
            })
            .eq("id", subscription.user_id)
        }
        break

      case "payment.failed":
        // Handle failed payment
        const { payment_id: failedPaymentId } = data

        await supabase
          .from("subscriptions")
          .update({ 
            status: "failed",
            failed_at: new Date().toISOString(),
          })
          .eq("payment_id", failedPaymentId)
        break

      case "subscription.cancelled":
        // Handle subscription cancellation
        const { user_id } = data

        await supabase
          .from("users")
          .update({
            premium_type: "free",
            premium_expires_at: null,
          })
          .eq("id", user_id)
        break

      case "pix.payment.confirmed":
        // Handle PIX payment confirmation
        const { pix_payment_id } = data

        const { data: pixSubscription } = await supabase
          .from("subscriptions")
          .update({ 
            status: "active",
            activated_at: new Date().toISOString(),
          })
          .eq("payment_id", pix_payment_id)
          .select()
          .single()

        if (pixSubscription) {
          await supabase
            .from("users")
            .update({
              premium_type: pixSubscription.plan_id,
              premium_expires_at: pixSubscription.end_date,
            })
            .eq("id", pixSubscription.user_id)
        }
        break

      default:
        console.log(`Unhandled webhook event: ${event_type}`)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    
    return NextResponse.json(
      { error: "Erro ao processar webhook", success: false },
      { status: 500 }
    )
  }
}