import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      })
    }

    console.log('✅ Environment variables found')
    console.log('🔗 Supabase URL:', supabaseUrl)

    // Test client creation
    const supabase = await createServerClient()
    console.log('✅ Supabase client created')

    // Test simple query - check if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, created_at')
      .limit(1)

    if (usersError) {
      console.error('❌ Users table error:', usersError)
      return NextResponse.json({
        success: false,
        error: "Users table error",
        details: usersError
      })
    }

    console.log('✅ Users table accessible, found', users?.length || 0, 'records')

    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, created_at, user_id')
      .limit(1)

    if (postsError) {
      console.error('❌ Posts table error:', postsError)
      return NextResponse.json({
        success: false,
        error: "Posts table error", 
        details: postsError
      })
    }

    console.log('✅ Posts table accessible, found', posts?.length || 0, 'records')

    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('⚠️ No authenticated user (this is normal for unauthenticated requests)')
    } else {
      console.log('✅ Auth check completed, user:', user?.id || 'none')
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        supabaseUrl,
        tablesAccessible: {
          users: !usersError,
          posts: !postsError
        },
        recordCounts: {
          users: users?.length || 0,
          posts: posts?.length || 0
        },
        auth: {
          hasUser: !!user,
          userId: user?.id || null
        }
      }
    })

  } catch (error) {
    console.error('💥 Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}