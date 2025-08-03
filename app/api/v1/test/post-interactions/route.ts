import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

// GET /api/v1/test/post-interactions - Test all post interaction functionality
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required for testing' }, { status: 401 })
    }

    const testResults: any[] = []

    // Test 1: Create a test post
    const { data: testPost, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: 'Test post for interaction testing 🧪',
        visibility: 'public'
      })
      .select('id')
      .single()

    if (postError) {
      testResults.push({
        test: 'Create test post',
        status: 'FAILED',
        error: postError.message
      })
    } else {
      testResults.push({
        test: 'Create test post',
        status: 'PASSED',
        data: { postId: testPost.id }
      })

      const postId = testPost.id

      // Test 2: Like the post
      const { error: likeError } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (likeError) {
        testResults.push({
          test: 'Like post',
          status: 'FAILED',
          error: likeError.message
        })
      } else {
        testResults.push({
          test: 'Like post',
          status: 'PASSED'
        })

        // Test 3: Check like count updated
        const { data: postAfterLike } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single()

        testResults.push({
          test: 'Like count updated',
          status: postAfterLike?.likes_count === 1 ? 'PASSED' : 'FAILED',
          data: { likes_count: postAfterLike?.likes_count }
        })
      }

      // Test 4: Comment on post
      const { error: commentError } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: 'Test comment 💬'
        })

      if (commentError) {
        testResults.push({
          test: 'Comment on post',
          status: 'FAILED',
          error: commentError.message
        })
      } else {
        testResults.push({
          test: 'Comment on post',
          status: 'PASSED'
        })

        // Test 5: Check comment count updated
        const { data: postAfterComment } = await supabase
          .from('posts')
          .select('comments_count')
          .eq('id', postId)
          .single()

        testResults.push({
          test: 'Comment count updated',
          status: postAfterComment?.comments_count === 1 ? 'PASSED' : 'FAILED',
          data: { comments_count: postAfterComment?.comments_count }
        })
      }

      // Test 6: Share post
      const { error: shareError } = await supabase
        .from('post_shares')
        .insert({
          post_id: postId,
          user_id: user.id,
          share_type: 'public'
        })

      if (shareError) {
        testResults.push({
          test: 'Share post',
          status: 'FAILED',
          error: shareError.message
        })
      } else {
        testResults.push({
          test: 'Share post',
          status: 'PASSED'
        })
      }

      // Test 7: Save post
      const { error: saveError } = await supabase
        .from('post_saves')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (saveError) {
        testResults.push({
          test: 'Save post',
          status: 'FAILED',
          error: saveError.message
        })
      } else {
        testResults.push({
          test: 'Save post',
          status: 'PASSED'
        })
      }

      // Test 8: Test get_post_with_interactions function
      const { data: postWithInteractions, error: funcError } = await supabase
        .rpc('get_post_with_interactions', {
          post_id_param: postId,
          user_id_param: user.id
        })

      if (funcError) {
        testResults.push({
          test: 'Get post with interactions function',
          status: 'FAILED',
          error: funcError.message
        })
      } else {
        const post = postWithInteractions[0]
        testResults.push({
          test: 'Get post with interactions function',
          status: 'PASSED',
          data: {
            likes_count: post?.likes_count,
            comments_count: post?.comments_count,
            is_liked: post?.is_liked,
            is_saved: post?.is_saved
          }
        })
      }

      // Test 9: Test API endpoints directly
      // Like API test
      try {
        const likeResponse = await fetch(`${request.nextUrl.origin}/api/v1/posts/${postId}/like`, {
          method: 'DELETE', // Unlike since we already liked
          headers: { 'Authorization': request.headers.get('Authorization') || '' }
        })
        
        const likeResult = await likeResponse.json()
        testResults.push({
          test: 'Like API endpoint',
          status: likeResponse.ok ? 'PASSED' : 'FAILED',
          data: likeResult
        })
      } catch (apiError) {
        testResults.push({
          test: 'Like API endpoint',
          status: 'FAILED',
          error: 'API call failed'
        })
      }

      // Clean up test post
      await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      testResults.push({
        test: 'Cleanup test post',
        status: 'PASSED'
      })
    }

    // Test 10: Test friendship system
    // This would require a second test user, so we'll just check the functions exist
    const { data: friendshipFunctions } = await supabase
      .rpc('are_users_friends', {
        user1_id: user.id,
        user2_id: user.id // Self-check should return false
      })

    testResults.push({
      test: 'Friendship functions available',
      status: friendshipFunctions === false ? 'PASSED' : 'FAILED',
      data: { result: friendshipFunctions }
    })

    // Calculate summary
    const passed = testResults.filter(r => r.status === 'PASSED').length
    const failed = testResults.filter(r => r.status === 'FAILED').length
    const total = testResults.length

    return NextResponse.json({
      success: true,
      summary: {
        total,
        passed,
        failed,
        passRate: `${Math.round((passed / total) * 100)}%`
      },
      testResults,
      message: failed === 0 ? 'All tests passed! 🎉' : `${failed} test(s) failed. Check the results for details.`
    })

  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST /api/v1/test/post-interactions - Test friendship system specifically
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required for testing' }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId required for friendship testing' }, { status: 400 })
    }

    const testResults: any[] = []

    // Test friendship status check
    const { data: friendshipStatus, error: statusError } = await supabase
      .rpc('get_friendship_status', {
        user1_id: user.id,
        user2_id: targetUserId
      })

    if (statusError) {
      testResults.push({
        test: 'Get friendship status',
        status: 'FAILED',
        error: statusError.message
      })
    } else {
      testResults.push({
        test: 'Get friendship status',
        status: 'PASSED',
        data: { status: friendshipStatus }
      })
    }

    // Test follow to create friendship
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: targetUserId
      })

    if (followError) {
      testResults.push({
        test: 'Create follow relationship',
        status: 'FAILED',
        error: followError.message
      })
    } else {
      testResults.push({
        test: 'Create follow relationship',
        status: 'PASSED'
      })

      // Check if friendship was created automatically (if target user follows back)
      const { data: friendsCheck } = await supabase
        .rpc('are_users_friends', {
          user1_id: user.id,
          user2_id: targetUserId
        })

      testResults.push({
        test: 'Automatic friendship creation',
        status: 'INFO',
        data: { areFriends: friendsCheck }
      })
    }

    return NextResponse.json({
      success: true,
      testResults,
      message: 'Friendship tests completed'
    })

  } catch (error) {
    console.error('Friendship test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Friendship test execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}