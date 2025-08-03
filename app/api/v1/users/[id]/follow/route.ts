import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/v1/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (currentUser) => {
    const { id: targetUserId } = await params
    
    // Can't follow yourself
    if (currentUser.id === targetUserId) {
      return {
        success: false,
        error: 'Você não pode seguir a si mesmo'
      }
    }

    const supabase = await createServerClient()

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)
      .single()

    if (existingFollow) {
      return {
        success: false,
        error: 'Você já está seguindo este usuário'
      }
    }

    // Create follow relationship
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUser.id,
        following_id: targetUserId
      })

    if (error) {
      console.error('Error following user:', error)
      return {
        success: false,
        error: 'Erro ao seguir usuário'
      }
    }

    // Check if this creates a mutual friendship
    const { data: isFollowedBack } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', targetUserId)
      .eq('following_id', currentUser.id)
      .single()

    let becameFriends = false
    if (isFollowedBack) {
      // They are now mutual friends - the trigger will handle creating the friendship
      becameFriends = true
      
      // Create friendship notification (will be created by trigger, but we can add additional context)
      await supabase
        .from('notifications')
        .insert({
          recipient_id: targetUserId,
          sender_id: currentUser.id,
          type: 'follow',
          title: 'Vocês agora são amigos!',
          content: `Você e ${currentUser.username || currentUser.name || 'Alguém'} se seguem mutuamente e agora são amigos no OpenLove.`,
          message: `Você e ${currentUser.username || currentUser.name || 'Alguém'} se seguem mutuamente e agora são amigos no OpenLove.`,
          entity_id: currentUser.id,
          entity_type: 'follow',
          related_data: { follower_id: currentUser.id, mutual: true },
          created_at: new Date().toISOString()
        })
    } else {
      // Regular follow notification
      await supabase
        .from('notifications')
        .insert({
          recipient_id: targetUserId,
          sender_id: currentUser.id,
          type: 'follow',
          title: `${currentUser.username || currentUser.name || 'Alguém'} começou a seguir você`,
          content: 'Siga de volta para se tornarem amigos!',
          message: 'Siga de volta para se tornarem amigos!',
          entity_id: currentUser.id,
          entity_type: 'follow',
          related_data: { follower_id: currentUser.id },
          created_at: new Date().toISOString()
        })
    }

    return {
      success: true,
      data: { 
        following: true,
        becameFriends 
      }
    }
  })
}

// DELETE /api/v1/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (currentUser) => {
    const { id: targetUserId } = await params
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)

    if (error) {
      console.error('Error unfollowing user:', error)
      return {
        success: false,
        error: 'Erro ao deixar de seguir usuário'
      }
    }

    return {
      success: true,
      data: { following: false }
    }
  })
}

// GET /api/v1/users/[id]/follow - Check if following and friendship status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (currentUser) => {
    const { id: targetUserId } = await params
    const supabase = await createServerClient()

    if (currentUser.id === targetUserId) {
      return {
        success: false,
        error: 'Não é possível verificar relacionamento consigo mesmo'
      }
    }

    // Check if following
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)
      .single()

    // Check if followed by
    const { data: followedByData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', targetUserId)
      .eq('following_id', currentUser.id)
      .single()

    // Check friendship status
    const { data: areFriends } = await supabase
      .rpc('are_users_friends', {
        user1_id: currentUser.id,
        user2_id: targetUserId
      })

    const isFollowing = !!followData
    const isFollowedBy = !!followedByData
    const isMutual = isFollowing && isFollowedBy

    return {
      success: true,
      data: { 
        following: isFollowing,
        followedBy: isFollowedBy,
        mutual: isMutual,
        friends: !!areFriends
      }
    }
  })
}