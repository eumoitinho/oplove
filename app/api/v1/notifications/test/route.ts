import { NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || \!user) {
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
        sender:users\!sender_id(
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
      success: \!error,
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
