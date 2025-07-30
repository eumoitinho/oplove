import { createServerClient } from '@/app/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { User } from '@/types/common'

export async function getAuthUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get full user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    return profile as User
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export function createAuthResponse(
  data: any,
  status: number = 200,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(data, { status, headers })
}

export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

export async function withAuth<T = any>(
  handler: (user: User) => Promise<T>
): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const result = await handler(user)
    return createAuthResponse(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return createUnauthorizedResponse()
    }
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}