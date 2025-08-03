import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing posts API...')
    
    const supabase = await createServerClient()
    console.log('✅ Supabase client created')

    // Test 1: Simple posts query
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(5)

    if (postsError) {
      console.error('❌ Posts query error:', postsError)
      return NextResponse.json({
        success: false,
        error: "Posts query error",
        details: postsError
      })
    }

    console.log('✅ Posts query successful, found:', posts?.length || 0)

    // Test 2: Posts with user join
    const { data: postsWithUser, error: joinError } = await supabase
      .from('posts')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users!inner(
          id,
          username,
          name,
          avatar_url
        )
      `)
      .limit(5)

    if (joinError) {
      console.error('❌ Posts with user join error:', joinError)
      return NextResponse.json({
        success: false,
        error: "Posts with user join error",
        details: joinError
      })
    }

    console.log('✅ Posts with user join successful, found:', postsWithUser?.length || 0)

    // Test 3: Check users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, name, avatar_url, premium_type, is_verified')
      .limit(5)

    if (usersError) {
      console.error('❌ Users query error:', usersError)
    } else {
      console.log('✅ Users query successful, found:', users?.length || 0)
    }

    return NextResponse.json({
      success: true,
      message: "Posts API test successful",
      data: {
        posts: posts || [],
        postsWithUser: postsWithUser || [],
        users: users || [],
        testResults: {
          postsQuery: !postsError,
          postsWithUserJoin: !joinError,
          usersQuery: !usersError
        }
      }
    })

  } catch (error) {
    console.error('💥 Posts API test failed:', error)
    return NextResponse.json({
      success: false,
      error: "Posts API test failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}