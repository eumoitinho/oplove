import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const subscribeSchema = z.object({
  plan_id: z.enum(["gold", "diamond", "couple"]),
  payment_method: z.enum(["card", "pix"]),
  payment_token: z.string().optional(), // For card payments
})

// POST /api/v1/payments/subscribe - Create a new subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plan_id, payment_method, payment_token } = subscribeSchema.parse(body)

    // Get plan details
    const planPrices = {
      gold: 25.00,
      diamond: 45.00,
      couple: 69.90,
    }

    const price = planPrices[plan_id]

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Você já possui uma assinatura ativa", success: false },
        { status: 400 }
      )
    }

    // Process payment based on method
    let paymentResult
    
    if (payment_method === "card") {
      // TODO: Integrate with Stripe for card payments
      // This is a placeholder - implement actual Stripe integration
      paymentResult = {
        success: true,
        payment_id: `stripe_${Date.now()}`,
        status: "succeeded",
      }
    } else if (payment_method === "pix") {
      // TODO: Integrate with PIX payment provider (e.g., AbacatePay)
      // This is a placeholder - implement actual PIX integration
      paymentResult = {
        success: true,
        payment_id: `pix_${Date.now()}`,
        status: "pending",
        pix_code: `00020126360014BR.GOV.BCB.PIX0114${Date.now()}`,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?data=pix_payment_${Date.now()}`,
      }
    }

    if (!paymentResult?.success) {
      return NextResponse.json(
        { error: "Falha ao processar pagamento", success: false },
        { status: 400 }
      )
    }

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id,
        status: payment_method === "pix" ? "pending" : "active",
        payment_method,
        payment_id: paymentResult.payment_id,
        price,
        currency: "BRL",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (subError) {
      return NextResponse.json(
        { error: "Erro ao criar assinatura", success: false },
        { status: 400 }
      )
    }

    // Update user premium status if payment succeeded
    if (payment_method === "card" && paymentResult.status === "succeeded") {
      await supabase
        .from("users")
        .update({
          premium_type: plan_id,
          premium_expires_at: subscription.end_date,
        })
        .eq("id", user.id)
    }

    // Return appropriate response based on payment method
    if (payment_method === "pix") {
      return NextResponse.json({
        success: true,
        data: {
          subscription,
          payment: {
            method: "pix",
            status: "pending",
            pix_code: paymentResult.pix_code,
            qr_code_url: paymentResult.qr_code_url,
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
          },
        },
        message: "PIX gerado. Complete o pagamento para ativar sua assinatura.",
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        payment: {
          method: "card",
          status: "succeeded",
        },
      },
      message: "Assinatura ativada com sucesso!",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}