import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase"

const updateSettingsSchema = z.object({
  // Account settings
  email: z.string().email().optional(),
  
  // Privacy settings
  privacy_settings: z.object({
    profile_visibility: z.enum(['public', 'friends', 'private']).optional(),
    show_location: z.boolean().optional(),
    show_age: z.boolean().optional(),
    show_last_active: z.boolean().optional(),
    show_online_status: z.boolean().optional(),
    allow_messages: z.enum(['everyone', 'friends', 'nobody']).optional(),
    show_ads: z.boolean().optional(),
  }).optional(),
  
  // Notification settings
  notification_settings: z.object({
    email_notifications: z.boolean().optional(),
    push_notifications: z.boolean().optional(),
    message_notifications: z.boolean().optional(),
    like_notifications: z.boolean().optional(),
    comment_notifications: z.boolean().optional(),
    follow_notifications: z.boolean().optional(),
    event_notifications: z.boolean().optional(),
  }).optional(),
  
  // Account status
  is_active: z.boolean().optional(),
  
  // Delete account
  delete_account: z.boolean().optional(),
})

// GET /api/v1/users/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const { data: settings, error } = await supabase
      .from("users")
      .select("email, privacy_settings, notification_settings, is_active")
      .eq("id", user.id)
      .single()

    if (error || !settings) {
      return NextResponse.json(
        { error: "Configurações não encontradas", success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      data: settings,
      success: true,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}

// PATCH /api/v1/users/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Não autorizado", success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const updates = updateSettingsSchema.parse(body)

    // Handle email update separately (requires auth update)
    if (updates.email && updates.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: updates.email
      })

      if (authError) {
        return NextResponse.json(
          { error: "Erro ao atualizar email: " + authError.message, success: false },
          { status: 400 }
        )
      }
    }

    // Handle account deletion
    if (updates.delete_account) {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from("users")
        .update({
          is_active: false,
          status: 'deleted',
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        return NextResponse.json(
          { error: "Erro ao deletar conta", success: false },
          { status: 400 }
        )
      }

      // Sign out the user
      await supabase.auth.signOut()

      return NextResponse.json({
        data: { message: "Conta deletada com sucesso" },
        success: true,
      })
    }

    // Update other settings
    const { email, delete_account, ...userUpdates } = updates
    
    if (Object.keys(userUpdates).length > 0) {
      const { data: updatedSettings, error } = await supabase
        .from("users")
        .update({
          ...userUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select("email, privacy_settings, notification_settings, is_active")
        .single()

      if (error) {
        return NextResponse.json(
          { error: error.message, success: false },
          { status: 400 }
        )
      }

      return NextResponse.json({
        data: updatedSettings,
        success: true,
      })
    }

    return NextResponse.json({
      data: { message: "Nenhuma alteração realizada" },
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message, success: false },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor", success: false },
      { status: 500 }
    )
  }
}