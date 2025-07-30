import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"
import { getAbacatePayService } from "@/lib/services/abacatepay.service"

const createPixSchema = z.object({
  plan_type: z.enum(["gold", "diamond", "couple"]),
  billing_period: z.enum(["monthly", "quarterly", "semiannual", "annual"]),
})

// Preços dos planos em reais
const PLAN_PRICES = {
  gold: {
    monthly: 25.00,
    quarterly: 67.50, // 10% desconto
    semiannual: 127.50, // 15% desconto
    annual: 240.00, // 20% desconto
  },
  diamond: {
    monthly: 45.00,
    quarterly: 121.50, // 10% desconto
    semiannual: 229.50, // 15% desconto
    annual: 432.00, // 20% desconto
  },
  couple: {
    monthly: 69.90,
    quarterly: 188.73, // 10% desconto
    semiannual: 356.49, // 15% desconto
    annual: 671.04, // 20% desconto
  },
}

// POST /api/v1/payments/create-pix
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado", success: false },
        { status: 404 }
      )
    }

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

    const body = await request.json()
    const { plan_type, billing_period } = createPixSchema.parse(body)

    // Calculate price
    const amount = PLAN_PRICES[plan_type][billing_period]
    
    // Create PIX payment with AbacatePay
    const abacatePayService = getAbacatePayService()
    
    const pixPayment = await abacatePayService.createPixPayment({
      amount,
      description: `OpenLove ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)} - ${billing_period}`,
      externalId: `sub_${user.id}_${Date.now()}`,
      customerName: profile.full_name || profile.username,
      customerEmail: user.email!,
      customerDocument: profile.document,
      expiresIn: 30, // 30 minutes
    })

    // Save subscription to database as pending
    const { data: dbSubscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_type,
        billing_period,
        payment_method: "pix",
        provider: "abacatepay",
        provider_subscription_id: pixPayment.id,
        amount,
        discount_percentage: billing_period === "quarterly" ? 10 : 
                            billing_period === "semiannual" ? 15 :
                            billing_period === "annual" ? 20 : 0,
        final_amount: amount,
        status: "pending",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + (
          billing_period === "monthly" ? 30 :
          billing_period === "quarterly" ? 90 :
          billing_period === "semiannual" ? 180 :
          365
        ) * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single()

    if (subError) {
      // Cancel PIX payment if database save fails
      await abacatePayService.cancelPayment(pixPayment.id)
      
      return NextResponse.json(
        { error: "Erro ao salvar assinatura", success: false },
        { status: 500 }
      )
    }

    // Save PIX payment details
    await supabase
      .from("payment_history")
      .insert({
        user_id: user.id,
        subscription_id: dbSubscription.id,
        amount,
        currency: "BRL",
        payment_method: "pix",
        provider: "abacatepay",
        provider_payment_id: pixPayment.id,
        status: "pending",
        metadata: {
          pix_key: pixPayment.pixKey,
          pix_code: pixPayment.pixCode,
          qr_code: pixPayment.qrCode,
          qr_code_image: pixPayment.qrCodeImage,
          expires_at: pixPayment.expiresAt,
        },
      })

    return NextResponse.json({
      data: {
        subscription_id: dbSubscription.id,
        payment: {
          id: pixPayment.id,
          status: pixPayment.status,
          amount: pixPayment.amount,
          pix_code: pixPayment.pixCode,
          qr_code: pixPayment.qrCode,
          qr_code_image: pixPayment.qrCodeImage,
          expires_at: pixPayment.expiresAt,
        },
      },
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    console.error("PIX payment error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}