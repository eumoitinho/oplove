import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

// GET /api/v1/users/[id]/friends - Get user's friends list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createServerClient()
    const currentUser = await getCurrentUser()

    // Check if requesting user can view this friends list
    // Users can view their own friends or friends of public profiles
    if (currentUser?.id !== targetUserId) {
      const { data: targetUser } = await supabase
        .from('users')
        .select('privacy_settings')
        .eq('id', targetUserId)
        .single()

      if (!targetUser) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
      }

      // Check privacy settings
      const privacySettings = targetUser.privacy_settings as any
      if (privacySettings?.hide_friends_list) {
        // Only show if current user is also a friend
        if (currentUser) {
          const { data: areFriends } = await supabase
            .rpc('are_users_friends', {
              user1_id: currentUser.id,
              user2_id: targetUserId
            })

          if (!areFriends) {
            return NextResponse.json({ error: 'Lista de amigos é privada' }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: 'Lista de amigos é privada' }, { status: 403 })
        }
      }
    }

    // Get friends list using the helper function
    const { data: friends, error } = await supabase
      .rpc('get_user_friends', { target_user_id: targetUserId })

    if (error) {
      console.error('Error fetching friends:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Apply pagination
    const paginatedFriends = friends?.slice(offset, offset + limit) || []

    // If current user is viewing, mark mutual friendships
    let friendsWithMutualStatus = paginatedFriends
    if (currentUser && currentUser.id !== targetUserId) {
      friendsWithMutualStatus = await Promise.all(
        paginatedFriends.map(async (friend: any) => {
          const { data: isMutual } = await supabase
            .rpc('are_users_friends', {
              user1_id: currentUser.id,
              user2_id: friend.friend_id
            })

          return {
            ...friend,
            isMutualFriend: !!isMutual
          }
        })
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        friends: friendsWithMutualStatus,
        total: friends?.length || 0,
        pagination: {
          limit,
          offset,
          hasMore: friends ? offset + limit < friends.length : false
        }
      }
    })

  } catch (error) {
    console.error('Error fetching friends list:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}