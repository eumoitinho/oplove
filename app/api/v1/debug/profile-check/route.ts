import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
        details: authError?.message
      }, { status: 401 })
    }
    
    // Check profile exists
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
    
    // Check by auth_id too
    const { data: profileByAuthId, error: authIdError } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single()
    
    // Count total profiles
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
    
    // Check if can create post
    let canCreatePost = false
    let postError = null
    
    try {
      const testPost = {
        user_id: user.id,
        content: "Test post",
        visibility: "public"
      }
      
      const { error } = await supabase
        .from("posts")
        .insert(testPost)
        .select()
        .single()
      
      if (!error) {
        canCreatePost = true
        // Clean up test post
        await supabase
          .from("posts")
          .delete()
          .eq("user_id", user.id)
          .eq("content", "Test post")
      } else {
        postError = error.message
      }
    } catch (e) {
      postError = e instanceof Error ? e.message : "Unknown error"
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile_check: {
        by_id: {
          found: !!profile,
          error: profileError?.message,
          data: profile ? {
            id: profile.id,
            auth_id: profile.auth_id,
            username: profile.username,
            premium_type: profile.premium_type
          } : null
        },
        by_auth_id: {
          found: !!profileByAuthId,
          error: authIdError?.message,
          data: profileByAuthId ? {
            id: profileByAuthId.id,
            auth_id: profileByAuthId.auth_id,
            username: profileByAuthId.username
          } : null
        }
      },
      database_stats: {
        total_profiles: count
      },
      permissions: {
        can_create_post: canCreatePost,
        post_error: postError
      },
      recommendations: {
        profile_exists: !!(profile || profileByAuthId),
        needs_profile_creation: !profile && !profileByAuthId,
        auth_id_mismatch: profile && profile.auth_id !== user.id,
        sql_to_run: !profile && !profileByAuthId 
          ? "/supabase/migrations/20250802_fix_all_rls_policies.sql"
          : null
      }
    })
    
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}