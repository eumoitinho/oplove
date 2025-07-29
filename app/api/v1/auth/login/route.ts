import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message, success: false }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        user: data.user,
        session: data.session,
      },
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data", success: false }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
