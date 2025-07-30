import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

const createSubscriptionSchema = z.object({
  plan_type: z.enum(["gold", "diamond", "couple"]),
  payment_method_id: z.string(),
  billing_period: z.enum(["monthly", "quarterly", "semiannual", "annual"]),
  coupon_code: z.string().optional(),
})

// Preços dos planos em centavos
const PLAN_PRICES = {
  gold: {
    monthly: 2500, // R$ 25,00
    quarterly: 6750, // R$ 67,50 (10% desconto)
    semiannual: 12750, // R$ 127,50 (15% desconto)
    annual: 24000, // R$ 240,00 (20% desconto)
  },
  diamond: {
    monthly: 4500, // R$ 45,00
    quarterly: 12150, // R$ 121,50 (10% desconto)
    semiannual: 22950, // R$ 229,50 (15% desconto)
    annual: 43200, // R$ 432,00 (20% desconto)
  },
  couple: {
    monthly: 6990, // R$ 69,90
    quarterly: 18873, // R$ 188,73 (10% desconto)
    semiannual: 35649, // R$ 356,49 (15% desconto)
    annual: 67104, // R$ 671,04 (20% desconto)
  },
}

// POST /api/v1/payments/create-subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
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
    const { plan_type, payment_method_id, billing_period, coupon_code } = createSubscriptionSchema.parse(body)

    // Create or get Stripe customer
    let stripeCustomerId = profile.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.name || profile.username,
        metadata: {
          user_id: user.id,
        },
      })
      
      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id)
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(payment_method_id, {
      customer: stripeCustomerId,
    })

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: payment_method_id,
      },
    })

    // Calculate price
    let amount = PLAN_PRICES[plan_type][billing_period]
    let discountPercentage = 0

    // Apply discount based on billing period
    switch (billing_period) {
      case "quarterly":
        discountPercentage = 10
        break
      case "semiannual":
        discountPercentage = 15
        break
      case "annual":
        discountPercentage = 20
        break
    }

    // Apply coupon if provided
    let stripeCouponId: string | undefined
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .eq("is_active", true)
        .single()

      if (coupon && new Date(coupon.valid_until) > new Date()) {
        // Create Stripe coupon if not exists
        stripeCouponId = coupon.stripe_coupon_id
      }
    }

    // Calculate interval
    const interval = billing_period === "monthly" ? "month" : 
                    billing_period === "quarterly" ? "month" :
                    billing_period === "semiannual" ? "month" : "year"
    
    const intervalCount = billing_period === "monthly" ? 1 :
                         billing_period === "quarterly" ? 3 :
                         billing_period === "semiannual" ? 6 : 1

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{
        price_data: {
          currency: "brl",
          product_data: {
            name: `OpenLove ${plan_type.charAt(0).toUpperCase() + plan_type.slice(1)}`,
            description: `Assinatura ${plan_type} - ${billing_period}`,
          },
          unit_amount: amount,
          recurring: {
            interval: interval,
            interval_count: intervalCount,
          },
        },
      }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        user_id: user.id,
        plan_type,
        billing_period,
      },
      ...(stripeCouponId && { coupon: stripeCouponId }),
    })

    // Save subscription to database
    const { data: dbSubscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_type,
        billing_period,
        payment_method: "credit_card",
        provider: "stripe",
        provider_subscription_id: subscription.id,
        amount: amount / 100, // Convert to reais
        discount_percentage: discountPercentage,
        final_amount: (amount * (100 - discountPercentage) / 100) / 100,
        status: "pending",
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Cancel Stripe subscription if database save fails
      await stripe.subscriptions.cancel(subscription.id)
      
      return NextResponse.json(
        { error: "Erro ao salvar assinatura", success: false },
        { status: 500 }
      )
    }

    // Return client secret for payment confirmation
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return NextResponse.json({
      data: {
        subscription_id: dbSubscription.id,
        client_secret: paymentIntent.client_secret,
        stripe_subscription_id: subscription.id,
        status: paymentIntent.status,
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

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      )
    }

    console.error("Payment error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}