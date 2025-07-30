import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/v1/payments/subscription - Get current user's subscription
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !subscription) {
      return NextResponse.json({
        data: null,
        success: true,
        message: "Nenhuma assinatura ativa",
      })
    }

    // Check if subscription is expired
    const isExpired = new Date(subscription.end_date) < new Date()
    
    if (isExpired && subscription.status === "active") {
      // Update subscription status
      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", subscription.id)

      // Update user to free plan
      await supabase
        .from("users")
        .update({ 
          premium_type: "free",
          premium_expires_at: null,
        })
        .eq("id", user.id)

      return NextResponse.json({
        data: null,
        success: true,
        message: "Assinatura expirada",
      })
    }

    return NextResponse.json({
      data: subscription,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// DELETE /api/v1/payments/subscription - Cancel subscription
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error || !subscription) {
      return NextResponse.json(
        { error: "Nenhuma assinatura ativa para cancelar", success: false },
        { status: 404 }
      )
    }

    // Update subscription to cancelled
    await supabase
      .from("subscriptions")
      .update({ 
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", subscription.id)

    // Update user to free plan
    await supabase
      .from("users")
      .update({ 
        premium_type: "free",
        premium_expires_at: null,
      })
      .eq("id", user.id)

    return NextResponse.json({
      success: true,
      message: "Assinatura cancelada com sucesso",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}