import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    console.log('🔍 GET CONVERSATIONS API - Fetching for user:', user.id)

    // Get conversations using direct API call to avoid RLS issues
    const conversationsResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/conversations?select=id,type,name,avatar_url,last_message_at,created_at,updated_at,initiated_by,initiated_by_premium,group_type,participants:conversation_participants!inner(user_id,role,joined_at,last_read_at,notifications_enabled,user:users(id,username,name,avatar_url,is_verified,premium_type))&conversation_participants.user_id=eq.${user.id}&order=last_message_at.desc.nullslast`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!conversationsResponse.ok) {
      const errorText = await conversationsResponse.text()
      console.error('🔍 GET CONVERSATIONS API - Error:', errorText)
      throw new Error(`Failed to fetch conversations: ${errorText}`)
    }

    const conversations = await conversationsResponse.json()
    console.log('🔍 GET CONVERSATIONS API - Found conversations:', conversations?.length || 0)

    return NextResponse.json({
      success: true,
      data: conversations || [],
      count: conversations?.length || 0
    })

  } catch (error) {
    console.error('🔍 GET CONVERSATIONS API - Fatal error:', error)
    return NextResponse.json(
      { 
        error: error.message, 
        success: false
      },
      { status: 500 }
    )
  }
}