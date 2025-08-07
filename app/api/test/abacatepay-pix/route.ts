import { type NextRequest, NextResponse } from "next/server"
import { getAbacatePayService } from "@/lib/services/abacatepay.service"
import { createServerClient } from "@/lib/supabase"

// Prevent running in production
if (process.env.NODE_ENV === "production") {
  throw new Error("Test routes are not allowed in production")
}

interface TestPixRequest {
  plan: "gold" | "diamond" | "couple"
  customer_email: string
  customer_name: string
  customer_document?: string
  billing_cycle?: "monthly" | "yearly"
  simulate_payment?: boolean // If true, will simulate payment completion
  simulate_delay?: number // Delay in seconds before simulating payment
}

interface TestPixResponse {
  success: boolean
  data?: {
    payment_id: string
    amount: number
    status: string
    pix_code: string
    qr_code: string
    qr_code_image: string
    expires_at: string
    simulation?: {
      will_simulate: boolean
      simulate_after_seconds: number
    }
  }
  error?: string
  logs: string[]
}

// Plan pricing configuration
const PLAN_PRICES = {
  gold: { monthly: 25.00, yearly: 270.00 },
  diamond: { monthly: 45.00, yearly: 486.00 },
  couple: { monthly: 69.90, yearly: 754.92 },
}

export async function POST(request: NextRequest) {
  const logs: string[] = []
  const supabase = createServerClient()
  
  try {
    // Environment check
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          error: "Test routes are only available in development environment",
          logs: ["ERROR: Not in development environment"],
        } satisfies TestPixResponse,
        { status: 403 }
      )
    }

    logs.push("INFO: Starting AbacatePay PIX test")
    
    const body = (await request.json()) as TestPixRequest
    const { 
      plan, 
      customer_email, 
      customer_name, 
      customer_document,
      billing_cycle = "monthly",
      simulate_payment = true,
      simulate_delay = 30
    } = body

    logs.push(`INFO: Test parameters - Plan: ${plan}, Email: ${customer_email}, Cycle: ${billing_cycle}`)
    logs.push(`INFO: Simulation enabled: ${simulate_payment}, Delay: ${simulate_delay}s`)

    // Validate input
    if (!plan || !customer_email || !customer_name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: plan, customer_email, customer_name",
          logs: [...logs, "ERROR: Missing required fields"],
        } satisfies TestPixResponse,
        { status: 400 }
      )
    }

    if (!(plan in PLAN_PRICES)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid plan. Must be one of: ${Object.keys(PLAN_PRICES).join(", ")}`,
          logs: [...logs, "ERROR: Invalid plan"],
        } satisfies TestPixResponse,
        { status: 400 }
      )
    }

    // Calculate amount
    const amount = PLAN_PRICES[plan][billing_cycle]
    logs.push(`INFO: Calculated amount: R$ ${amount.toFixed(2)}`)

    // Generate unique external ID for this test
    const externalId = `test-${plan}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    logs.push(`INFO: Generated external ID: ${externalId}`)

    // Step 1: Initialize AbacatePay service
    logs.push("STEP 1: Initializing AbacatePay service")
    const abacatePayService = getAbacatePayService()
    logs.push("SUCCESS: AbacatePay service initialized")

    // Step 2: Create PIX payment
    logs.push("STEP 2: Creating PIX payment")
    const pixPayment = await abacatePayService.createPixPayment({
      amount,
      description: `OpenLove - Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)} (${billing_cycle})`,
      externalId,
      customerName: customer_name,
      customerEmail: customer_email,
      customerDocument: customer_document,
      expiresIn: 60, // 60 minutes for test
    })

    logs.push(`SUCCESS: PIX payment created with ID: ${pixPayment.id}`)
    logs.push(`INFO: PIX code generated: ${pixPayment.pixCode.substring(0, 50)}...`)
    logs.push(`INFO: Payment expires at: ${pixPayment.expiresAt}`)

    // Step 3: Store payment in database for tracking
    logs.push("STEP 3: Storing payment record in database")
    const { data: paymentRecord, error: dbError } = await supabase
      .from("pix_payments")
      .insert([
        {
          external_id: externalId,
          abacatepay_id: pixPayment.id,
          amount: amount,
          currency: "BRL",
          description: pixPayment.description,
          customer_email: customer_email,
          customer_name: customer_name,
          customer_document: customer_document,
          plan_type: plan,
          billing_cycle: billing_cycle,
          pix_code: pixPayment.pixCode,
          qr_code: pixPayment.qrCode,
          qr_code_image: pixPayment.qrCodeImage,
          status: "pending",
          expires_at: pixPayment.expiresAt,
          is_test: true,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (dbError) {
      logs.push(`WARNING: Failed to store in database: ${dbError.message}`)
      // Continue anyway for testing purposes
    } else {
      logs.push("SUCCESS: Payment record stored in database")
    }

    // Step 4: Set up payment simulation if requested
    let simulationInfo = undefined
    if (simulate_payment) {
      logs.push(`STEP 4: Setting up payment simulation in ${simulate_delay} seconds`)
      
      // Use setTimeout to simulate payment after delay
      setTimeout(async () => {
        try {
          console.log(`[AbacatePay Test] Simulating payment completion for ${pixPayment.id}`)
          
          // Simulate the webhook payload that AbacatePay would send
          const webhookPayload = {
            id: pixPayment.id,
            status: "paid" as const,
            amount: Math.round(amount * 100), // AbacatePay sends in cents
            description: pixPayment.description,
            externalId: externalId,
            paidAt: new Date().toISOString(),
          }

          // Call our own webhook endpoint to simulate the callback
          const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/webhook/abacatepay`
          const webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Test-Simulation": "true", // Special header to identify test simulations
            },
            body: JSON.stringify(webhookPayload),
          })

          if (webhookResponse.ok) {
            console.log(`[AbacatePay Test] Successfully simulated payment completion`)
          } else {
            console.error(`[AbacatePay Test] Failed to simulate payment: ${webhookResponse.status}`)
          }
        } catch (error) {
          console.error(`[AbacatePay Test] Error simulating payment:`, error)
        }
      }, simulate_delay * 1000)

      simulationInfo = {
        will_simulate: true,
        simulate_after_seconds: simulate_delay,
      }
      logs.push("SUCCESS: Payment simulation scheduled")
    }

    // Prepare response
    const responseData = {
      payment_id: pixPayment.id,
      amount: amount,
      status: pixPayment.status,
      pix_code: pixPayment.pixCode,
      qr_code: pixPayment.qrCode,
      qr_code_image: pixPayment.qrCodeImage,
      expires_at: pixPayment.expiresAt,
      simulation: simulationInfo,
    }

    logs.push("SUCCESS: PIX test completed successfully")

    return NextResponse.json({
      success: true,
      data: responseData,
      logs,
    } satisfies TestPixResponse)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logs.push(`ERROR: ${errorMessage}`)
    
    console.error("AbacatePay PIX test error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        logs,
      } satisfies TestPixResponse,
      { status: 500 }
    )
  }
}

// Simulate PIX payment completion endpoint
export async function PUT(request: NextRequest) {
  const logs: string[] = []
  
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Test routes are only available in development environment" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("payment_id")
    
    if (!paymentId) {
      return NextResponse.json(
        { error: "payment_id is required as query parameter" },
        { status: 400 }
      )
    }

    logs.push(`INFO: Manual simulation requested for payment: ${paymentId}`)

    // Get payment details from AbacatePay
    logs.push("STEP 1: Getting payment details")
    const abacatePayService = getAbacatePayService()
    const paymentDetails = await abacatePayService.getPaymentStatus(paymentId)
    
    if (!paymentDetails) {
      logs.push("ERROR: Payment not found")
      return NextResponse.json(
        {
          success: false,
          error: "Payment not found",
          logs,
        },
        { status: 404 }
      )
    }

    logs.push(`SUCCESS: Payment found - Status: ${paymentDetails.status}`)

    // Simulate payment completion
    if (paymentDetails.status === "pending") {
      logs.push("STEP 2: Simulating payment completion")
      
      const webhookPayload = {
        id: paymentDetails.id,
        status: "paid" as const,
        amount: Math.round(paymentDetails.amount * 100),
        description: paymentDetails.description,
        externalId: paymentDetails.externalId,
        paidAt: new Date().toISOString(),
      }

      // Call our webhook endpoint
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/webhook/abacatepay`
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Test-Simulation": "true",
        },
        body: JSON.stringify(webhookPayload),
      })

      if (webhookResponse.ok) {
        logs.push("SUCCESS: Payment simulation completed")
        return NextResponse.json({
          success: true,
          message: "Payment simulated successfully",
          data: {
            payment_id: paymentId,
            old_status: "pending",
            new_status: "paid",
          },
          logs,
        })
      } else {
        logs.push(`ERROR: Webhook call failed with status: ${webhookResponse.status}`)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to call webhook",
            logs,
          },
          { status: 500 }
        )
      }
    } else {
      logs.push(`INFO: Payment already in status: ${paymentDetails.status}`)
      return NextResponse.json({
        success: false,
        error: `Payment is already in status: ${paymentDetails.status}`,
        logs,
      })
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    logs.push(`ERROR: ${errorMessage}`)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        logs,
      },
      { status: 500 }
    )
  }
}

// GET endpoint for documentation and test utilities
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
      available_plans: ["gold", "diamond", "couple"],
      billing_cycles: ["monthly", "yearly"],
      plan_prices: PLAN_PRICES,
      documentation: {
        create_pix: {
          endpoint: "/api/test/abacatepay-pix",
          method: "POST",
          description: "Create a test PIX payment with optional automatic simulation",
          required_fields: ["plan", "customer_email", "customer_name"],
          optional_fields: [
            "customer_document",
            "billing_cycle",
            "simulate_payment",
            "simulate_delay"
          ],
          example_request: {
            plan: "gold",
            customer_email: "test@example.com",
            customer_name: "João Test",
            customer_document: "12345678900",
            billing_cycle: "monthly",
            simulate_payment: true,
            simulate_delay: 30,
          },
        },
        simulate_payment: {
          endpoint: "/api/test/abacatepay-pix?payment_id={payment_id}",
          method: "PUT",
          description: "Manually simulate payment completion for a specific payment",
          query_parameters: ["payment_id"],
          example: "/api/test/abacatepay-pix?payment_id=abc_123456789",
        },
        features: [
          "Automatic PIX QR code generation",
          "Database storage for payment tracking",
          "Automatic payment simulation with configurable delay",
          "Manual payment simulation endpoint",
          "Webhook simulation for testing integration",
          "Detailed logging for debugging",
        ],
        notes: [
          "All payments created by this endpoint are marked as test payments",
          "Automatic simulation calls the webhook endpoint after the specified delay",
          "Manual simulation can be used to test payment completion at any time",
          "QR codes generated are functional and can be used for testing",
        ],
      },
    },
  })
}