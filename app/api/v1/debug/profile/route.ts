import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Não autenticado",
        user: null,
        profile: null
      }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    // Also check with auth_id
    let profileByAuthId = null
    if (!profile) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", user.id)
        .single()
      profileByAuthId = data
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      profile,
      profileByAuthId,
      profileError: profileError?.message || null,
      debug: {
        hasProfile: !!profile,
        hasProfileByAuthId: !!profileByAuthId,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Erro interno",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}