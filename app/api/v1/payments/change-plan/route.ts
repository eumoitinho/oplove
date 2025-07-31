import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"
import Stripe from "stripe"
import { getPlanPriceInCents } from "@/lib/config/pricing.config"
import rateLimiter, { RATE_LIMIT_CONFIGS } from "@/lib/utils/rate-limit"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
})

const changePlanSchema = z.object({
  new_plan_type: z.enum(["gold", "diamond", "couple"]),
  new_billing_period: z.enum(["monthly", "quarterly", "semiannual", "annual"]).optional(),
  apply_immediately: z.boolean().default(true),
})

// POST /api/v1/payments/change-plan
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

    // Apply rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit(
      user.id, 
      RATE_LIMIT_CONFIGS.payment
    )
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "Muitas tentativas. Tente novamente em alguns minutos.", 
          retryAfter: rateLimitResult.retryAfter,
          success: false 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          }
        }
      )
    }

    // Get current active subscription
    const { data: currentSub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (subError || !currentSub) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada", success: false },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { new_plan_type, new_billing_period, apply_immediately } = changePlanSchema.parse(body)

    // Use current billing period if not specified
    const billingPeriod = new_billing_period || currentSub.billing_period

    // Check if it's actually a change
    if (currentSub.plan_type === new_plan_type && currentSub.billing_period === billingPeriod) {
      return NextResponse.json(
        { error: "Novo plano é igual ao atual", success: false },
        { status: 400 }
      )
    }

    // Calculate prorating using the database function
    const { data: prorationData, error: prorationError } = await supabase
      .rpc('calculate_subscription_proration', {
        p_current_plan: currentSub.plan_type,
        p_new_plan: new_plan_type,
        p_billing_period: billingPeriod,
        p_current_period_start: currentSub.current_period_start,
        p_current_period_end: currentSub.current_period_end
      })

    if (prorationError) {
      console.error("Proration calculation error:", prorationError)
      return NextResponse.json(
        { error: "Erro ao calcular ajuste proporcional", success: false },
        { status: 500 }
      )
    }

    const prorationAmount = prorationData.proration_amount

    // If changing immediately and there's a positive proration, create payment
    let paymentIntentClientSecret = null
    let requiresPayment = prorationAmount > 0

    if (apply_immediately && requiresPayment) {
      // Create payment intent for the prorated amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(prorationAmount * 100), // Convert to cents
        currency: 'brl',
        customer: currentSub.stripe_customer_id || undefined,
        metadata: {
          user_id: user.id,
          subscription_id: currentSub.id,
          type: 'plan_change_proration',
          old_plan: currentSub.plan_type,
          new_plan: new_plan_type,
        },
        description: `Ajuste proporcional: ${currentSub.plan_type} → ${new_plan_type}`,
      })

      paymentIntentClientSecret = paymentIntent.client_secret
    }

    if (apply_immediately && !requiresPayment) {
      // Apply the change immediately using the atomic function
      const { data: changeResult, error: changeError } = await supabase
        .rpc('change_user_subscription', {
          p_subscription_id: currentSub.id,
          p_user_id: user.id,
          p_new_plan_type: new_plan_type,
          p_new_billing_period: billingPeriod,
          p_prorate_amount: prorationAmount
        })

      if (changeError) {
        console.error("Plan change error:", changeError)
        return NextResponse.json(
          { error: "Erro ao alterar plano", success: false },
          { status: 500 }
        )
      }

      // If there's a Stripe subscription, update it too
      if (currentSub.provider_subscription_id) {
        try {
          const newPrice = getPlanPriceInCents(new_plan_type, billingPeriod)
          
          await stripe.subscriptions.update(currentSub.provider_subscription_id, {
            items: [{
              id: currentSub.stripe_item_id,
              price_data: {
                currency: "brl",
                product_data: {
                  name: `OpenLove ${new_plan_type.charAt(0).toUpperCase() + new_plan_type.slice(1)}`,
                  description: `Assinatura ${new_plan_type} - ${billingPeriod}`,
                },
                unit_amount: newPrice,
                recurring: {
                  interval: billingPeriod === "monthly" ? "month" : 
                           billingPeriod === "quarterly" ? "month" :
                           billingPeriod === "semiannual" ? "month" : "year",
                  interval_count: billingPeriod === "monthly" ? 1 :
                                 billingPeriod === "quarterly" ? 3 :
                                 billingPeriod === "semiannual" ? 6 : 1,
                },
              },
            }],
            proration_behavior: 'none', // We handle proration manually
          })
        } catch (stripeError) {
          console.error("Stripe subscription update error:", stripeError)
          // Don't fail the request if Stripe update fails - we've already updated our DB
        }
      }

      return NextResponse.json({
        success: true,
        message: "Plano alterado com sucesso",
        data: {
          subscription_id: currentSub.id,
          old_plan: currentSub.plan_type,
          new_plan: new_plan_type,
          proration_amount: prorationAmount,
          applied_immediately: true,
        }
      })
    }

    // If not applying immediately or requires payment, return the details
    return NextResponse.json({
      success: true,
      message: requiresPayment ? "Pagamento necessário para alteração do plano" : "Alteração programada",
      data: {
        subscription_id: currentSub.id,
        old_plan: currentSub.plan_type,
        new_plan: new_plan_type,
        billing_period: billingPeriod,
        proration_amount: prorationAmount,
        proration_description: prorationData.proration_description,
        requires_payment: requiresPayment,
        client_secret: paymentIntentClientSecret,
        applied_immediately: false,
      }
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

    console.error("Change plan error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// GET /api/v1/payments/change-plan - Preview plan change
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const newPlanType = searchParams.get('plan_type')
    const newBillingPeriod = searchParams.get('billing_period')

    if (!newPlanType) {
      return NextResponse.json(
        { error: "Tipo de plano é obrigatório", success: false },
        { status: 400 }
      )
    }

    // Get current active subscription
    const { data: currentSub, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (subError || !currentSub) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa encontrada", success: false },
        { status: 404 }
      )
    }

    const billingPeriod = newBillingPeriod || currentSub.billing_period

    // Calculate prorating
    const { data: prorationData, error: prorationError } = await supabase
      .rpc('calculate_subscription_proration', {
        p_current_plan: currentSub.plan_type,
        p_new_plan: newPlanType,
        p_billing_period: billingPeriod,
        p_current_period_start: currentSub.current_period_start,
        p_current_period_end: currentSub.current_period_end
      })

    if (prorationError) {
      console.error("Proration calculation error:", prorationError)
      return NextResponse.json(
        { error: "Erro ao calcular ajuste proporcional", success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        current_plan: currentSub.plan_type,
        new_plan: newPlanType,
        current_billing_period: currentSub.billing_period,
        new_billing_period: billingPeriod,
        ...prorationData,
        requires_payment: prorationData.proration_amount > 0,
      }
    })

  } catch (error) {
    console.error("Preview plan change error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}