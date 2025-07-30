import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get refresh token from request body
    const body = await request.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token não fornecido", success: false },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      data: {
        session: data.session,
        user: data.user,
      },
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}