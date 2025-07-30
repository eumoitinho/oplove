import { supabase } from "@/lib/supabase-browser"

export interface CoupleInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email?: string
  to_phone?: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
  from_user?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
}

export interface Couple {
  id: string
  couple_name: string
  couple_avatar_url: string
  couple_cover_url: string
  anniversary_date: string
  bio: string
  status: 'active' | 'pending' | 'inactive'
  created_at: string
  updated_at: string
  shared_album_id?: string
  shared_diary_id?: string
  shared_playlist_url?: string
}

export interface CoupleUser {
  id: string
  couple_id: string
  user_id: string
  role: 'primary' | 'secondary'
  joined_at: string
  user?: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    premium_type: string
    is_verified: boolean
  }
}

export interface CouplePayment {
  id: string
  couple_id: string
  payer_user_id: string
  subscription_id: string
  amount: number
  status: 'active' | 'cancelled' | 'expired'
  current_period_start: string
  current_period_end: string
  created_at: string
}

class CoupleService {
  // Invitation Management
  async sendInvitation(data: {
    method: 'username' | 'email' | 'phone'
    username?: string
    email?: string
    phone?: string
    message: string
  }) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    // Create invitation record
    const invitationData = {
      from_user_id: session.session.user.id,
      to_email: data.email,
      to_phone: data.phone,
      message: data.message,
      status: 'pending' as const,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }

    // If inviting by username, find the user first
    if (data.method === 'username' && data.username) {
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', data.username.replace('@', ''))
        .single()

      if (userError || !targetUser) {
        throw new Error('Usuário não encontrado')
      }

      invitationData['to_user_id'] = targetUser.id
    }

    const { data: invitation, error } = await supabase
      .from('couple_invitations')
      .insert(invitationData)
      .select(`
        *,
        from_user:users!from_user_id(id, username, full_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Send notification/email based on method
    await this.sendInvitationNotification(invitation, data.method)

    return invitation
  }

  private async sendInvitationNotification(invitation: any, method: string) {
    // TODO: Implement email/SMS/push notification
    // For now, just create in-app notification if user exists
    if (invitation.to_user_id) {
      await supabase.rpc('create_notification', {
        p_user_id: invitation.to_user_id,
        p_from_user_id: invitation.from_user_id,
        p_type: 'couple_invitation',
        p_title: 'Convite de Casal',
        p_message: `${invitation.from_user.full_name || invitation.from_user.username} quer ser seu parceiro(a) no OpenLove`,
        p_entity_id: invitation.id,
        p_entity_type: 'couple_invitation'
      })
    }
  }

  async getInvitations(type: 'sent' | 'received' = 'received') {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    const query = supabase
      .from('couple_invitations')
      .select(`
        *,
        from_user:users!from_user_id(id, username, full_name, avatar_url)
      `)

    if (type === 'sent') {
      query.eq('from_user_id', session.session.user.id)
    } else {
      query.or(`to_user_id.eq.${session.session.user.id},to_email.eq.${session.session.user.email}`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async acceptInvitation(invitationId: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    // Get invitation details
    const { data: invitation, error: invError } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('id', invitationId)
      .single()

    if (invError || !invitation) throw new Error('Convite não encontrado')
    if (invitation.status !== 'pending') throw new Error('Convite não está pendente')
    if (new Date(invitation.expires_at) < new Date()) throw new Error('Convite expirado')

    // Start transaction
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        couple_name: '', // Will be set later
        status: 'active',
        anniversary_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single()

    if (coupleError) throw coupleError

    // Add both users to couple
    const coupleUsers = [
      {
        couple_id: couple.id,
        user_id: invitation.from_user_id,
        role: 'primary' as const
      },
      {
        couple_id: couple.id,
        user_id: session.session.user.id,
        role: 'secondary' as const
      }
    ]

    const { error: usersError } = await supabase
      .from('couple_users')
      .insert(coupleUsers)

    if (usersError) throw usersError

    // Update users table with couple_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        couple_id: couple.id, 
        is_in_couple: true 
      })
      .in('id', [invitation.from_user_id, session.session.user.id])

    if (updateError) throw updateError

    // Update invitation status
    const { error: invUpdateError } = await supabase
      .from('couple_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId)

    if (invUpdateError) throw invUpdateError

    // Sync premium status if inviter has couple plan
    await this.syncCoupleSubscription(couple.id)

    return couple
  }

  async declineInvitation(invitationId: string) {
    const { error } = await supabase
      .from('couple_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId)

    if (error) throw error
  }

  async cancelInvitation(invitationId: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('couple_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('from_user_id', session.session.user.id)

    if (error) throw error
  }

  // Couple Management
  async getCouple(coupleId?: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    let query = supabase
      .from('couples')
      .select(`
        *,
        couple_users(
          *,
          user:users(id, username, full_name, avatar_url, premium_type, is_verified)
        )
      `)

    if (coupleId) {
      query = query.eq('id', coupleId)
    } else {
      // Get current user's couple
      const { data: user } = await supabase
        .from('users')
        .select('couple_id')
        .eq('id', session.session.user.id)
        .single()

      if (!user?.couple_id) return null
      query = query.eq('id', user.couple_id)
    }

    const { data, error } = await query.single()
    if (error) throw error

    return data
  }

  async updateCouple(coupleId: string, updates: Partial<Couple>) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    // Verify user is part of this couple
    const { data: coupleUser } = await supabase
      .from('couple_users')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('user_id', session.session.user.id)
      .single()

    if (!coupleUser) throw new Error('Não autorizado')

    const { data, error } = await supabase
      .from('couples')
      .update(updates)
      .eq('id', coupleId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async leaveCouple(coupleId: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    // Remove user from couple
    const { error: removeError } = await supabase
      .from('couple_users')
      .delete()
      .eq('couple_id', coupleId)
      .eq('user_id', session.session.user.id)

    if (removeError) throw removeError

    // Update user record
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        couple_id: null, 
        is_in_couple: false,
        premium_type: 'free' // Reset to free plan
      })
      .eq('id', session.session.user.id)

    if (updateError) throw updateError

    // Check if couple has any remaining users
    const { data: remainingUsers } = await supabase
      .from('couple_users')
      .select('*')
      .eq('couple_id', coupleId)

    // If no users left, delete the couple
    if (!remainingUsers || remainingUsers.length === 0) {
      await this.dissolveCouple(coupleId)
    } else if (remainingUsers.length === 1) {
      // If only one user left, convert them back to individual account
      const lastUser = remainingUsers[0]
      await supabase
        .from('users')
        .update({ 
          couple_id: null, 
          is_in_couple: false,
          premium_type: 'free'
        })
        .eq('id', lastUser.user_id)

      await this.dissolveCouple(coupleId)
    }
  }

  async dissolveCouple(coupleId: string) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    // Verify user is primary (only primary can dissolve)
    const { data: coupleUser } = await supabase
      .from('couple_users')
      .select('*')
      .eq('couple_id', coupleId)
      .eq('user_id', session.session.user.id)
      .single()

    if (!coupleUser || coupleUser.role !== 'primary') {
      throw new Error('Apenas o titular pode desfazer o casal')
    }

    // Get all users in couple
    const { data: coupleUsers } = await supabase
      .from('couple_users')
      .select('user_id')
      .eq('couple_id', coupleId)

    if (coupleUsers) {
      // Reset all users to free plan
      const userIds = coupleUsers.map(cu => cu.user_id)
      await supabase
        .from('users')
        .update({ 
          couple_id: null, 
          is_in_couple: false,
          premium_type: 'free'
        })
        .in('id', userIds)
    }

    // Delete couple record (cascade will handle related data)
    const { error } = await supabase
      .from('couples')
      .delete()
      .eq('id', coupleId)

    if (error) throw error

    // Cancel any active couple subscriptions
    await this.cancelCoupleSubscription(coupleId)
  }

  // Payment Integration
  async syncCoupleSubscription(coupleId: string) {
    // Get couple users
    const { data: coupleUsers } = await supabase
      .from('couple_users')
      .select('user_id, role, user:users(premium_type, premium_expires_at)')
      .eq('couple_id', coupleId)

    if (!coupleUsers) return

    // Find the primary user (payer)
    const primaryUser = coupleUsers.find(cu => cu.role === 'primary')
    if (!primaryUser) return

    // If primary user has couple plan, sync with secondary
    if (primaryUser.user.premium_type === 'couple') {
      const secondaryUser = coupleUsers.find(cu => cu.role === 'secondary')
      if (secondaryUser) {
        await supabase
          .from('users')
          .update({
            premium_type: 'couple',
            premium_expires_at: primaryUser.user.premium_expires_at
          })
          .eq('id', secondaryUser.user_id)
      }
    }
  }

  async cancelCoupleSubscription(coupleId: string) {
    // TODO: Integrate with Stripe/payment provider to cancel subscription
    // For now, just update the database
    const { error } = await supabase
      .from('couple_payments')
      .update({ status: 'cancelled' })
      .eq('couple_id', coupleId)

    if (error) console.error('Error canceling couple subscription:', error)
  }

  // Shared Features
  async addToSharedAlbum(coupleId: string, files: File[]) {
    // TODO: Implement file upload to Supabase Storage
    // TODO: Create album entries linked to couple
    return { success: true, uploaded: files.length }
  }

  async addDiaryEntry(coupleId: string, entry: {
    title: string
    content: string
    date: string
    mood?: string
    is_private?: boolean
  }) {
    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('couple_diary_entries')
      .insert({
        couple_id: coupleId,
        author_id: session.session.user.id,
        ...entry
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getCoupleStats(coupleId: string) {
    // TODO: Implement real stats calculation
    return {
      days_together: 365,
      posts_together: 42,
      memories_created: 128,
      games_played: 5,
      shared_photos: 67,
      diary_entries: 23
    }
  }
}

export const coupleService = new CoupleService()