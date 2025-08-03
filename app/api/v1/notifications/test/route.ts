import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/notifications/test - Test notifications query
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Test 1: Basic notifications query
    console.log("🔍 Test 1: Basic notifications query for user:", user.id)
    const { data: basicNotifications, error: basicError } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log("🔍 Test 1 Result:", {
      error: basicError?.message,
      count: basicNotifications?.length,
      notifications: basicNotifications
    })

    // Test 2: Check if notifications table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)

    console.log("🔍 Test 2 - Table exists:", {
      exists: !tableError || tableError.code !== '42P01',
      error: tableError?.message
    })

    // Test 3: Check all notifications in system
    const { data: allNotifications, count: totalCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .limit(20)

    console.log("🔍 Test 3 - All notifications:", {
      totalInSystem: totalCount,
      sampleData: allNotifications?.slice(0, 5)
    })

    // Test 4: Try with joins
    const { data: withJoins, error: joinError } = await supabase
      .from('notifications')
      .select(`
        *,
        from_user:users!sender_id(
          id,
          username,
          name,
          avatar_url
        )
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    console.log("🔍 Test 4 - With joins:", {
      error: joinError?.message,
      count: withJoins?.length,
      firstNotification: withJoins?.[0]
    })

    // Return comprehensive test results
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      tests: {
        basicQuery: {
          error: basicError?.message,
          count: basicNotifications?.length || 0,
          data: basicNotifications || []
        },
        tableExists: !tableError || tableError.code !== '42P01',
        totalNotificationsInSystem: totalCount || 0,
        withJoins: {
          error: joinError?.message,
          count: withJoins?.length || 0,
          data: withJoins || []
        }
      },
      debug: {
        allNotificationsSample: allNotifications?.slice(0, 5),
        userNotifications: basicNotifications
      }
    })
  } catch (error) {
    console.error("[NOTIFICATIONS TEST] Error:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        details: error instanceof Error ? error.message : "Unknown error",
        success: false 
      },
      { status: 500 }
    )
  }
}

// POST /api/v1/notifications/test - Create test notification
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    // Create a test notification
    const testNotification = {
      recipient_id: user.id,
      type: "message",
      title: "Notificação de Teste",
      content: "Esta é uma notificação de teste criada em " + new Date().toLocaleString('pt-BR'),
      message: "Esta é uma notificação de teste criada em " + new Date().toLocaleString('pt-BR'),
      is_read: false,
      created_at: new Date().toISOString()
    }

    console.log("📝 Creating test notification:", testNotification)

    const { data, error } = await supabase
      .from("notifications")
      .insert(testNotification)
      .select()
      .single()

    if (error) {
      console.error("📝 Error creating test notification:", error)
      return NextResponse.json(
        { 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: error.hint,
          success: false 
        },
        { status: 400 }
      )
    }

    console.log("📝 Test notification created:", data)

    return NextResponse.json({
      success: true,
      message: "Notificação de teste criada com sucesso",
      data: data
    })
  } catch (error) {
    console.error("[CREATE TEST NOTIFICATION] Error:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor", 
        details: error instanceof Error ? error.message : "Unknown error",
        success: false 
      },
      { status: 500 }
    )
  }
}