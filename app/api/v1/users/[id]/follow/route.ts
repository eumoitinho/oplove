import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'

// POST /api/v1/users/[id]/follow - Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (currentUser) => {
    const targetUserId = params.id
    
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

    // Create notification for the user being followed
    await supabase
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: 'follow',
        actor_id: currentUser.id,
        title: `${currentUser.username || currentUser.name} começou a seguir você`,
        read: false
      })

    return {
      success: true,
      data: { following: true }
    }
  })
}

// DELETE /api/v1/users/[id]/follow - Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (currentUser) => {
    const targetUserId = params.id
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

// GET /api/v1/users/[id]/follow - Check if following
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (currentUser) => {
    const targetUserId = params.id
    const supabase = await createServerClient()

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUserId)
      .single()

    return {
      success: true,
      data: { following: !!data }
    }
  })
}