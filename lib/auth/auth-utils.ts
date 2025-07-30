import { createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function getAuthenticatedUser(request?: NextRequest) {
  const supabase = await createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile from database
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Alias for backward compatibility
export const getCurrentUser = getAuthenticatedUser

export async function requireAuthentication(request?: NextRequest) {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export function createAuthError(message: string = 'Unauthorized') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function createForbiddenError(message: string = 'Forbidden') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' }
  })
}