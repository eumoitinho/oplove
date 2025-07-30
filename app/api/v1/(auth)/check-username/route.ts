import { NextResponse } from 'next/server'
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate username format
    if (username.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Username can only contain letters, numbers and underscores' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if username already exists
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      console.error('Error checking username:', error)
      return NextResponse.json(
        { available: false, error: 'Error checking username availability' },
        { status: 500 }
      )
    }

    // If data exists, username is taken
    const available = !data

    return NextResponse.json({ available })
  } catch (error) {
    console.error('Username check error:', error)
    return NextResponse.json(
      { available: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}