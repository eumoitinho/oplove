import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  name: z.string().min(2).max(50),
  birth_date: z.string().refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 18
  }, "Você deve ter pelo menos 18 anos"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, name, birth_date } = registerSchema.parse(body)

    const supabase = createServerClient()

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Nome de usuário já está em uso", success: false },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name,
          birth_date,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message, success: false },
        { status: 400 }
      )
    }

    // Create user profile using service role to bypass RLS
    if (authData.user) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { error: profileError } = await supabaseAdmin.from("users").insert({
        id: authData.user.id,
        email,
        username,
        name,
        birth_date,
        premium_type: "free",
        is_verified: false,
        created_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        
        // If profile creation fails, try to delete the auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error("Failed to delete auth user after profile creation failed:", deleteError)
        }
        
        return NextResponse.json(
          { error: profileError.message || "Erro ao criar perfil do usuário", success: false },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      data: {
        user: authData.user,
        session: authData.session,
      },
      success: true,
      message: "Conta criada com sucesso! Verifique seu email para confirmar.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    console.error("Register endpoint error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}