import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Prevent running in production
if (process.env.NODE_ENV === "production") {
  throw new Error("Test routes are not allowed in production")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

// Test cards from Stripe documentation
const TEST_CARDS = {
  success: "4242424242424242",
  decline_generic: "4000000000000002",
  decline_insufficient_funds: "4000000000009995",
  decline_lost_card: "4000000000009987",
  decline_stolen_card: "4000000000009979",
  require_authentication: "4000002500003155",
  charge_dispute: "4000000000000259",
} as const

interface TestCardData {
  card_number: string
  exp_month: number
  exp_year: number
  cvc: string
}

interface TestSubscriptionRequest {
  plan: "gold" | "diamond" | "couple"
  test_scenario: keyof typeof TEST_CARDS
  customer_email: string
  billing_cycle?: "monthly" | "yearly"
}

interface TestSubscriptionResponse {
  success: boolean
  data?: {
    subscription_id: string
    status: string
    client_secret?: string
    latest_invoice: {
      id: string
      status: string
      amount_paid: number
      payment_intent: {
        id: string
        status: string
        client_secret?: string
      }
    }
  }
  error?: string
  logs: string[]
}

// Plan pricing configuration
const PLAN_PRICES = {
  gold: { monthly: 2500, yearly: 27000 }, // R$ 25.00, R$ 270.00
  diamond: { monthly: 4500, yearly: 48600 }, // R$ 45.00, R$ 486.00  
  couple: { monthly: 6990, yearly: 75492 }, // R$ 69.90, R$ 754.92
}

// Stripe price IDs from environment
const STRIPE_PRICES = {
  gold: {
    monthly: process.env.STRIPE_PRICE_GOLD_MONTHLY,
    yearly: process.env.STRIPE_PRICE_GOLD_ANNUAL,
  },
  diamond: {
    monthly: process.env.STRIPE_PRICE_DIAMOND_MONTHLY,
    yearly: process.env.STRIPE_PRICE_DIAMOND_ANNUAL,
  },
  couple: {
    monthly: process.env.STRIPE_PRICE_COUPLE_MONTHLY, 
    yearly: process.env.STRIPE_PRICE_COUPLE_ANNUAL,
  },
}

export async function POST(request: NextRequest) {
  const logs: string[] = []
  
  try {
    // Environment check
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          error: "Test routes are only available in development environment",
          logs: ["ERROR: Not in development environment"],
        } satisfies TestSubscriptionResponse,
        { status: 403 }
      )
    }

    logs.push("INFO: Starting Stripe subscription test")
    
    const body = (await request.json()) as TestSubscriptionRequest
    const { plan, test_scenario, customer_email, billing_cycle = "monthly" } = body

    logs.push(`INFO: Test parameters - Plan: ${plan}, Scenario: ${test_scenario}, Cycle: ${billing_cycle}`)

    // Validate input
    if (!plan || !test_scenario || !customer_email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: plan, test_scenario, customer_email",
          logs: [...logs, "ERROR: Missing required fields"],
        } satisfies TestSubscriptionResponse,
        { status: 400 }
      )
    }

    if (!(test_scenario in TEST_CARDS)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid test_scenario. Must be one of: ${Object.keys(TEST_CARDS).join(", ")}`,
          logs: [...logs, "ERROR: Invalid test scenario"],
        } satisfies TestSubscriptionResponse,
        { status: 400 }
      )
    }

    const priceId = STRIPE_PRICES[plan]?.[billing_cycle]
    if (!priceId) {
      return NextResponse.json(
        {
          success: false,
          error: `Price ID not found for plan ${plan} with cycle ${billing_cycle}`,
          logs: [...logs, "ERROR: Price ID not configured"],
        } satisfies TestSubscriptionResponse,
        { status: 400 }
      )
    }

    // Step 1: Create test customer
    logs.push("STEP 1: Creating test customer")
    const customer = await stripe.customers.create({
      email: customer_email,
      description: `Test customer for OpenLove ${plan} plan`,
      metadata: {
        test_scenario,
        plan,
        billing_cycle,
        created_by: "test-api",
      },
    })
    logs.push(`SUCCESS: Customer created with ID: ${customer.id}`)

    // Step 2: Create test payment method
    logs.push("STEP 2: Creating test payment method")
    const testCard = TEST_CARDS[test_scenario]
    const currentYear = new Date().getFullYear()
    
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: testCard,
        exp_month: 12,
        exp_year: currentYear + 2,
        cvc: "123",
      },
    })
    logs.push(`SUCCESS: Payment method created with ID: ${paymentMethod.id}`)

    // Step 3: Attach payment method to customer
    logs.push("STEP 3: Attaching payment method to customer")
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customer.id,
    })
    logs.push("SUCCESS: Payment method attached to customer")

    // Step 4: Set as default payment method
    logs.push("STEP 4: Setting as default payment method")
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    })
    logs.push("SUCCESS: Default payment method set")

    // Step 5: Create subscription
    logs.push("STEP 5: Creating subscription")
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        test_scenario,
        plan,
        billing_cycle,
        created_by: "test-api",
      },
    })

    logs.push(`SUCCESS: Subscription created with ID: ${subscription.id}`)
    logs.push(`INFO: Subscription status: ${subscription.status}`)

    const latestInvoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent

    logs.push(`INFO: Invoice ID: ${latestInvoice?.id}`)
    logs.push(`INFO: Invoice status: ${latestInvoice?.status}`)
    logs.push(`INFO: Payment intent ID: ${paymentIntent?.id}`)
    logs.push(`INFO: Payment intent status: ${paymentIntent?.status}`)

    // Step 6: Simulate payment based on test scenario
    logs.push("STEP 6: Processing payment simulation")
    
    let finalStatus = paymentIntent?.status
    let clientSecret = paymentIntent?.client_secret

    // For scenarios that should succeed, attempt to confirm payment
    if (test_scenario === "success") {
      try {
        logs.push("ATTEMPT: Confirming payment for success scenario")
        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethod.id,
        })
        finalStatus = confirmedPaymentIntent.status
        logs.push(`SUCCESS: Payment confirmed with status: ${finalStatus}`)
      } catch (error) {
        logs.push(`INFO: Payment confirmation failed as expected: ${error}`)
      }
    }

    // Prepare response data
    const responseData = {
      subscription_id: subscription.id,
      status: subscription.status,
      client_secret: clientSecret,
      latest_invoice: {
        id: latestInvoice.id,
        status: latestInvoice.status,
        amount_paid: latestInvoice.amount_paid,
        payment_intent: {
          id: paymentIntent.id,
          status: finalStatus,
          client_secret: clientSecret,
        },
      },
    }

    logs.push("SUCCESS: Test completed successfully")

    return NextResponse.json({
      success: true,
      data: responseData,
      logs,
    } satisfies TestSubscriptionResponse)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logs.push(`ERROR: ${errorMessage}`)
    
    console.error("Stripe test error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        logs,
      } satisfies TestSubscriptionResponse,
      { status: 500 }
    )
  }
}

// GET endpoint to return available test scenarios and documentation
export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Test routes are only available in development environment" },
      { status: 403 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      available_scenarios: Object.keys(TEST_CARDS),
      test_cards: TEST_CARDS,
      available_plans: ["gold", "diamond", "couple"],
      billing_cycles: ["monthly", "yearly"],
      plan_prices: PLAN_PRICES,
      documentation: {
        endpoint: "/api/test/stripe-subscription",
        method: "POST",
        required_fields: ["plan", "test_scenario", "customer_email"],
        optional_fields: ["billing_cycle"],
        example_request: {
          plan: "gold",
          test_scenario: "success", 
          customer_email: "test@example.com",
          billing_cycle: "monthly",
        },
        test_scenarios: {
          success: "Payment succeeds normally",
          decline_generic: "Payment is declined with a generic decline code",
          decline_insufficient_funds: "Payment is declined due to insufficient funds",
          decline_lost_card: "Payment is declined because the card is reported lost",
          decline_stolen_card: "Payment is declined because the card is reported stolen",
          require_authentication: "Payment requires authentication (3D Secure)",
          charge_dispute: "Payment initially succeeds but is later disputed",
        },
      },
    },
  })
}