import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Test endpoint for authentication flow
 * GET /api/auth/test
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({
        success: false,
        error: "Session error: " + sessionError.message,
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({
        success: false,
        error: "No active session",
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, email, full_name, username, avatar_url, is_verified, premium_type")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: "Profile error: " + profileError.message,
        data: null,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0"
        }
      }, { status: 500 })
    }

    // Check session expiry
    const now = Date.now() / 1000
    const expiresAt = session.expires_at || 0
    const timeUntilExpiry = expiresAt - now
    const isExpiringSoon = timeUntilExpiry < 300 // 5 minutes

    return NextResponse.json({
      success: true,
      error: null,
      data: {
        session: {
          isValid: true,
          expiresAt: session.expires_at,
          timeUntilExpiry: Math.round(timeUntilExpiry),
          isExpiringSoon
        },
        user: profile,
        authFlowTest: {
          sessionExists: !!session,
          userExists: !!session.user,
          profileExists: !!profile,
          sessionValid: timeUntilExpiry > 0,
          allChecksPass: !!session && !!session.user && !!profile && timeUntilExpiry > 0
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    })

  } catch (error) {
    console.error("[AUTH_TEST] Unexpected error:", error)
    
    return NextResponse.json({
      success: false,
      error: "Internal server error: " + (error as Error).message,
      data: null,
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    }, { status: 500 })
  }
}