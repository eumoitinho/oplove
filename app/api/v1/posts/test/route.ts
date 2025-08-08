import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/v1/posts/test - Test posts system
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const test = searchParams.get("test") || "all"
    
    const supabase = await createServerClient()
    const results: any = {}
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        error: "Not authenticated",
        message: "Please login to test the posts system"
      }, { status: 401 })
    }
    
    // Test 1: Check database schema
    if (test === "all" || test === "schema") {
      const { data: columns, error: schemaError } = await supabase
        .from('posts')
        .select('*')
        .limit(0)
      
      if (!schemaError) {
        // Get a sample post to check columns
        const { data: samplePost } = await supabase
          .from('posts')
          .select('*')
          .limit(1)
          .single()
        
        results.schema = {
          success: true,
          columns: samplePost ? Object.keys(samplePost) : [],
          message: "Schema check completed"
        }
      } else {
        results.schema = {
          success: false,
          error: schemaError.message
        }
      }
    }
    
    // Test 2: Fetch posts with correct fields
    if (test === "all" || test === "fetch") {
      const { data: posts, error: fetchError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          couple_id,
          content,
          media_urls,
          media_types,
          media_thumbnails,
          visibility,
          is_premium_content,
          price,
          location,
          latitude,
          longitude,
          hashtags,
          mentions,
          post_type,
          story_expires_at,
          is_event,
          event_id,
          poll_id,
          poll_question,
          poll_options,
          poll_expires_at,
          audio_duration,
          likes_count,
          comments_count,
          shares_count,
          saves_count,
          is_reported,
          is_hidden,
          report_count,
          created_at,
          updated_at,
          users!inner(
            id,
            username,
            name,
            avatar_url,
            is_verified,
            premium_type,
            gender
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (!fetchError) {
        results.fetch = {
          success: true,
          count: posts?.length || 0,
          posts: posts?.map(p => ({
            id: p.id,
            content: p.content?.substring(0, 50) + (p.content?.length > 50 ? '...' : ''),
            visibility: p.visibility,
            media_count: p.media_urls?.length || 0,
            user: p.users?.username,
            gender: p.users?.gender,
            counters: {
              likes: p.likes_count,
              comments: p.comments_count,
              shares: p.shares_count,
              saves: p.saves_count
            }
          }))
        }
      } else {
        results.fetch = {
          success: false,
          error: fetchError.message
        }
      }
    }
    
    // Test 3: Create a test post
    if (test === "all" || test === "create") {
      const testContent = `Test post created at ${new Date().toLocaleTimeString('pt-BR')} #teste @openlove`
      
      const { data: newPost, error: createError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: testContent,
          visibility: 'public',
          media_urls: [],
          media_types: [],
          media_thumbnails: [],
          hashtags: ['#teste'],
          mentions: ['@openlove'],
          post_type: 'regular',
          is_premium_content: false,
          is_event: false,
          is_reported: false,
          is_hidden: false,
          report_count: 0,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          saves_count: 0
        })
        .select()
        .single()
      
      if (!createError) {
        results.create = {
          success: true,
          postId: newPost.id,
          content: newPost.content,
          hashtags: newPost.hashtags,
          mentions: newPost.mentions
        }
        
        // Clean up - delete the test post
        await supabase.from('posts').delete().eq('id', newPost.id)
        results.create.message = "Test post created and deleted successfully"
      } else {
        results.create = {
          success: false,
          error: createError.message,
          details: createError
        }
      }
    }
    
    // Test 4: Check user permissions
    if (test === "all" || test === "permissions") {
      const { data: userProfile } = await supabase
        .from('users')
        .select('premium_type, is_verified, gender')
        .eq('id', user.id)
        .single()
      
      results.permissions = {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          premium_type: userProfile?.premium_type || 'free',
          is_verified: userProfile?.is_verified || false,
          gender: userProfile?.gender || null
        },
        features: {
          can_upload_images: userProfile?.premium_type !== 'free' || userProfile?.is_verified,
          can_upload_videos: userProfile?.premium_type !== 'free',
          can_create_polls: userProfile?.premium_type !== 'free',
          can_record_audio: userProfile?.premium_type !== 'free' || userProfile?.is_verified,
          daily_story_limit: userProfile?.premium_type === 'diamond' ? 'unlimited' : 
                            userProfile?.premium_type === 'gold' ? 10 : 
                            userProfile?.is_verified ? 3 : 0
        }
      }
    }
    
    // Test 5: Check visibility enum values
    if (test === "all" || test === "visibility") {
      // Test creating posts with different visibility values
      const visibilityTests = []
      
      for (const visibility of ['public', 'friends', 'private']) {
        const { error } = await supabase
          .from('posts')
          .insert({
            user_id: user.id,
            content: `Testing ${visibility} visibility`,
            visibility: visibility,
            media_urls: [],
            media_types: [],
            media_thumbnails: []
          })
          .select()
          .single()
        
        visibilityTests.push({
          visibility,
          success: !error,
          error: error?.message
        })
        
        // Clean up
        if (!error) {
          await supabase
            .from('posts')
            .delete()
            .eq('content', `Testing ${visibility} visibility`)
            .eq('user_id', user.id)
        }
      }
      
      // Test invalid visibility (should fail)
      const { error: invalidError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: 'Testing invalid visibility',
          visibility: 'followers', // This should fail
          media_urls: [],
          media_types: [],
          media_thumbnails: []
        })
        .select()
        .single()
      
      results.visibility = {
        success: true,
        valid_values: visibilityTests,
        invalid_test: {
          value: 'followers',
          failed_as_expected: !!invalidError,
          error: invalidError?.message
        },
        message: "Visibility enum values: 'public', 'friends', 'private' (NOT 'followers')"
      }
    }
    
    // Test 6: Check counters and interactions
    if (test === "all" || test === "counters") {
      // Get a recent post
      const { data: recentPost } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (recentPost) {
        results.counters = {
          success: true,
          post_id: recentPost.id,
          database_counters: {
            likes_count: recentPost.likes_count,
            comments_count: recentPost.comments_count,
            shares_count: recentPost.shares_count,
            saves_count: recentPost.saves_count
          },
          reaction_counters: {
            like_count: recentPost.like_count,
            love_count: recentPost.love_count,
            laugh_count: recentPost.laugh_count,
            wow_count: recentPost.wow_count,
            sad_count: recentPost.sad_count,
            angry_count: recentPost.angry_count
          },
          message: "Counters are stored directly in posts table (denormalized)"
        }
      } else {
        results.counters = {
          success: false,
          message: "No posts found to check counters"
        }
      }
    }
    
    // Summary
    const allSuccess = Object.values(results).every((r: any) => r.success !== false)
    
    return NextResponse.json({
      success: allSuccess,
      timestamp: new Date().toISOString(),
      test_type: test,
      results,
      summary: {
        total_tests: Object.keys(results).length,
        passed: Object.values(results).filter((r: any) => r.success).length,
        failed: Object.values(results).filter((r: any) => !r.success).length
      }
    })
    
  } catch (error) {
    console.error('[POST TEST] Fatal error:', error)
    return NextResponse.json({
      success: false,
      error: "Test suite failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/v1/posts/test - Test post creation with media
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({
        error: "Not authenticated"
      }, { status: 401 })
    }
    
    const formData = await request.formData()
    const content = formData.get('content') as string || `Test post with media at ${new Date().toLocaleTimeString('pt-BR')}`
    const visibility = formData.get('visibility') as string || 'public'
    
    // Extract hashtags and mentions
    const hashtags = content ? [...content.matchAll(/#[a-zA-Z0-9_]+/g)].map(m => m[0]) : []
    const mentions = content ? [...content.matchAll(/@[a-zA-Z0-9_]+/g)].map(m => m[0]) : []
    
    // Create test post
    const { data: newPost, error: createError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        visibility: visibility === 'followers' ? 'friends' : visibility, // Fix old value
        media_urls: [],
        media_types: [],
        media_thumbnails: [],
        hashtags,
        mentions,
        post_type: 'regular',
        is_premium_content: false,
        is_event: false,
        is_reported: false,
        is_hidden: false,
        report_count: 0,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        saves_count: 0
      })
      .select(`
        *,
        users!inner(
          id,
          username,
          name,
          avatar_url,
          is_verified,
          premium_type,
          gender
        )
      `)
      .single()
    
    if (createError) {
      return NextResponse.json({
        success: false,
        error: createError.message,
        details: createError
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Test post created successfully",
      post: {
        id: newPost.id,
        content: newPost.content,
        visibility: newPost.visibility,
        hashtags: newPost.hashtags,
        mentions: newPost.mentions,
        user: newPost.users,
        created_at: newPost.created_at
      }
    })
    
  } catch (error) {
    console.error('[POST TEST CREATE] Error:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to create test post",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}