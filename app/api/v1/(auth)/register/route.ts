import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"

const registerSchema = z.object({
  // Basic required fields
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
  
  // Account type
  account_type: z.enum(['personal', 'business']).default('personal'),
  
  // Personal account specific fields
  gender: z.enum(['male', 'female', 'non_binary', 'other', 'prefer_not_say']).optional(),
  profile_type: z.enum(['single', 'couple', 'trans', 'other']).optional(),
  looking_for: z.array(z.string()).optional(),
  relationship_goals: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  
  // Profile information
  bio: z.string().min(10).optional(),
  
  // Location fields
  city: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().length(2).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  // Premium plan selection
  plan: z.enum(['free', 'gold', 'diamond', 'couple']).default('free'),
  
  // Business account specific fields (optional)
  business_name: z.string().min(2).max(200).optional(),
  business_type: z.enum(['creator', 'product', 'service', 'event']).optional(),
  cnpj: z.string().optional(),
}).refine((data) => {
  // Business accounts must have business-specific fields
  if (data.account_type === 'business') {
    return data.business_name && data.business_type
  }
  return true
}, {
  message: "Contas business devem incluir nome e tipo do negócio",
  path: ["business_name"]
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("[REGISTER] Received request body:", {
      ...body,
      password: body.password ? "[REDACTED]" : undefined
    })
    
    const validatedData = registerSchema.parse(body)
    const { email, password, username, name, birth_date } = validatedData

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
      
      // Build the user data object with all validated fields
      const userData: any = {
        id: authData.user.id,
        auth_id: authData.user.id,
        email,
        username,
        name,
        birth_date,
        account_type: validatedData.account_type || 'personal',
        premium_type: validatedData.plan || 'free',
        is_verified: false,
        created_at: new Date().toISOString(),
      }

      // Add optional fields if they exist
      if (validatedData.bio) userData.bio = validatedData.bio
      if (validatedData.city) userData.city = validatedData.city
      if (validatedData.state) userData.state = validatedData.state
      if (validatedData.uf) userData.uf = validatedData.uf
      if (validatedData.latitude !== undefined) userData.latitude = validatedData.latitude
      if (validatedData.longitude !== undefined) userData.longitude = validatedData.longitude
      
      // Add location string if city and state exist
      if (validatedData.city && validatedData.state) {
        userData.location = `${validatedData.city}, ${validatedData.state}`
      }
      
      // Add personal account specific fields
      if (validatedData.account_type === 'personal') {
        if (validatedData.gender) userData.gender = validatedData.gender
        if (validatedData.profile_type) userData.profile_type = validatedData.profile_type
        if (validatedData.looking_for?.length) userData.looking_for = validatedData.looking_for
        if (validatedData.relationship_goals?.length) userData.relationship_goals = validatedData.relationship_goals
        if (validatedData.interests?.length) userData.interests = validatedData.interests
      }
      
      const { error: profileError } = await supabaseAdmin.from("users").insert(userData)
      
      if (profileError) {
        console.error("[REGISTER] Error creating user profile:", profileError)
        console.error("[REGISTER] User data attempted:", userData)
        
        // Delete the auth user if profile creation failed
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        
        return NextResponse.json(
          { 
            success: false,
            error: "Erro ao criar perfil do usuário",
            details: profileError.message
          },
          { status: 500 }
        )
      }
      
      console.log("[REGISTER] User profile created successfully for:", authData.user.id)
      
      if (validatedData.account_type === 'business') {
        // Create business profile for business accounts
        const businessData = {
          id: crypto.randomUUID(),
          owner_id: authData.user.id,
          business_type: validatedData.business_type!,
          business_name: validatedData.business_name!,
          cnpj: validatedData.cnpj,
          contact: {
            email: validatedData.email,
            phone: null
          },
          created_at: new Date().toISOString(),
        }
        
        const { error: businessError } = await supabaseAdmin.from("businesses").insert(businessData)
        
        if (!businessError) {
          // Update user with business_id
          await supabaseAdmin
            .from("users")
            .update({ business_id: businessData.id })
            .eq("id", authData.user.id)
        }
      }

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
      
      // Enhanced error handling for business accounts
      if (validatedData.account_type === 'business') {
        const { error: businessCheckError } = await supabaseAdmin
          .from("users")
          .select("business_id")
          .eq("id", authData.user.id)
          .single()
          
        if (businessCheckError || !businessCheckError) {
          console.warn("Business account created but business profile may have failed")
        }
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
      console.error("[REGISTER] Validation error:", error.errors)
      return NextResponse.json(
        { 
          error: error.errors[0].message, 
          success: false,
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error("[REGISTER] Unexpected error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}