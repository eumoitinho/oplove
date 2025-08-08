import { NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
        authError: authError?.message
      })
    }
    
    // Test notifications table with correct column names
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(`
        *,
        sender:users!sender_id(
          id,
          username,
          name,
          avatar_url,
          is_verified,
          premium_type
        )
      `)
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      success: !error,
      userId: user.id,
      userEmail: user.email,
      notificationsCount: notifications?.length || 0,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details
      } : null,
      notifications: notifications || []
    })
  } catch (error) {
    console.error("[Test Notifications API] Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function POST() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      })
    }
    
    // Create test notification
    const testNotification = {
      recipient_id: user.id,
      sender_id: user.id, // Self notification for testing
      type: 'like',
      title: 'Notificação de Teste',
      content: 'Esta é uma notificação de teste criada automaticamente.',
      icon: 'heart',
      related_data: {
        post_id: 'test-post-id',
        test: true
      },
      action_url: '/feed',
      is_read: false
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([testNotification])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: "Erro ao criar notificação",
        details: {
          message: error.message,
          code: error.code,
          details: error.details
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: "Notificação de teste criada com sucesso!",
      data: data
    })
    
  } catch (error) {
    console.error("[Create Test Notification API] Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
