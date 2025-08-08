import { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

/**
 * Safely fetch user profile from database with proper error handling
 * This utility prevents the common "Perfil não encontrado" error
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: string = "*",
  context?: string
) {
  const contextPrefix = context ? `[${context}]` : "[fetchUserProfile]"
  
  try {
    console.log(`${contextPrefix} Fetching profile for user:`, userId)
    
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(fields)
      .eq("id", userId)
      .single()
    
    if (profileError) {
      console.error(`${contextPrefix} Profile error:`, {
        error: profileError,
        userId,
        errorCode: profileError.code,
        errorMessage: profileError.message
      })
      
      // PGRST116 means no rows returned
      if (profileError.code === "PGRST116") {
        return {
          success: false,
          error: "Perfil não encontrado. Por favor, complete seu cadastro ou faça login novamente.",
          statusCode: 404,
          profile: null
        }
      }
      
      // Other database errors
      return {
        success: false,
        error: `Erro ao buscar perfil: ${profileError.message}`,
        statusCode: 500,
        profile: null
      }
    }
    
    if (!profile) {
      console.error(`${contextPrefix} Profile is null for user:`, userId)
      return {
        success: false,
        error: "Perfil não encontrado. Por favor, complete seu cadastro.",
        statusCode: 404,
        profile: null
      }
    }
    
    console.log(`${contextPrefix} Profile found:`, {
      userId: profile.id,
      username: profile.username,
      premiumType: profile.premium_type
    })
    
    return {
      success: true,
      error: null,
      statusCode: 200,
      profile
    }
  } catch (error) {
    console.error(`${contextPrefix} Unexpected error:`, error)
    return {
      success: false,
      error: "Erro inesperado ao buscar perfil",
      statusCode: 500,
      profile: null
    }
  }
}

/**
 * Create a NextResponse for profile fetch errors
 */
export function createProfileErrorResponse(
  error: string,
  statusCode: number,
  additionalData?: Record<string, any>
) {
  return NextResponse.json(
    {
      success: false,
      error,
      ...additionalData
    },
    { status: statusCode }
  )
}

/**
 * Helper to get user profile or return error response
 * Usage in API routes:
 * 
 * const profileResult = await getUserProfileOrError(supabase, user.id, "premium_type, is_verified", "POST /api/v1/posts")
 * if (profileResult instanceof NextResponse) return profileResult
 * const profile = profileResult
 */
export async function getUserProfileOrError(
  supabase: SupabaseClient,
  userId: string,
  fields: string = "*",
  context?: string
): Promise<any | NextResponse> {
  const result = await fetchUserProfile(supabase, userId, fields, context)
  
  if (!result.success) {
    return createProfileErrorResponse(result.error!, result.statusCode)
  }
  
  return result.profile
}