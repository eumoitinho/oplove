import { type NextRequest, NextResponse } from "next/server"

// Development only - test payment modal functionality
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: "Not available in production", success: false },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { plan_type, billing_period, payment_method } = body
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Simulate payment success for testing
    const mockData = {
      subscription_id: `sub_${Date.now()}`,
      payment_id: `pay_${Date.now()}`,
      amount: plan_type === 'gold' ? 25.00 : 
              plan_type === 'diamond' ? 45.00 : 
              plan_type === 'couple' ? 69.90 : 0,
      status: 'completed',
      payment_method,
      billing_period,
      plan_type
    }

    return NextResponse.json({
      data: mockData,
      success: true,
      message: "Payment processed successfully (test mode)"
    })
  } catch (error) {
    console.error("Test payment error:", error)
    return NextResponse.json(
      { error: "Test payment failed", success: false },
      { status: 500 }
    )
  }
}