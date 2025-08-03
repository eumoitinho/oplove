import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/auth-utils'

// GET /api/v1/users/[id]/friendship - Get friendship status between current user and target user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const supabase = await createServerClient()
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'Não é possível verificar amizade consigo mesmo' }, { status: 400 })
    }

    // Check friendship status
    const { data: friendshipStatus, error } = await supabase
      .rpc('get_friendship_status', {
        user1_id: currentUser.id,
        user2_id: targetUserId
      })

    if (error) {
      console.error('Error checking friendship status:', error)
      return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }

    // Get more detailed information
    const isFollowing = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)
      .single()

    const isFollowedBy = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', targetUserId)
      .eq('following_id', currentUser.id)
      .single()

    const areFriends = await supabase
      .rpc('are_users_friends', {
        user1_id: currentUser.id,
        user2_id: targetUserId
      })

    return NextResponse.json({
      success: true,
      data: {
        status: friendshipStatus,
        isFollowing: !!isFollowing.data,
        isFollowedBy: !!isFollowedBy.data,
        areFriends: !!areFriends.data,
        isMutual: friendshipStatus === 'friends'
      }
    })

  } catch (error) {
    console.error('Error getting friendship status:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE /api/v1/users/[id]/friendship - Remove friendship (unfriend)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params
    const supabase = await createServerClient()
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (currentUser.id === targetUserId) {
      return NextResponse.json({ error: 'Não é possível desfazer amizade consigo mesmo' }, { status: 400 })
    }

    // Remove friendship from both sides
    const { error: friendshipError } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${currentUser.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUser.id})`)

    if (friendshipError) {
      console.error('Error removing friendship:', friendshipError)
      return NextResponse.json({ error: 'Erro ao desfazer amizade' }, { status: 500 })
    }

    // Also unfollow each other to break the mutual follow
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)

    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', targetUserId)
      .eq('following_id', currentUser.id)

    return NextResponse.json({
      success: true,
      message: 'Amizade desfeita com sucesso'
    })

  } catch (error) {
    console.error('Error removing friendship:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}