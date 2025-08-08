import { createClient } from "@/app/lib/supabase-browser"
import type { Community, CommunityMember } from "@/types/database.types"

// Define response types locally
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// TODO: These types should be added to database.types.ts when available
type CommunityPost = any
type CommunityInvite = any  
type CommunityCategory = string
type CommunityType = string

interface FetchCommunitiesParams {
  page?: number
  limit?: number
  category?: CommunityCategory
  type?: CommunityType
  search?: string
  myCommunitiesOnly?: boolean
  sortBy?: "trending" | "recent" | "members" | "posts"
}

interface CreateCommunityData {
  name: string
  description: string
  category: CommunityCategory
  type: CommunityType
  rules?: string
  requires_approval?: boolean
  min_age?: number
  is_nsfw?: boolean
  avatar_url?: string
  banner_url?: string
}

export class CommunitiesService {
  /**
   * Fetch communities with pagination and filters
   */
  static async fetchCommunities(params: FetchCommunitiesParams): Promise<{
    data: Community[]
    hasMore: boolean
    total: number
  }> {
    const supabase = createClient()
    const { 
      page = 1, 
      limit = 20, 
      category, 
      type, 
      search,
      myCommunitiesOnly = false,
      sortBy = "trending"
    } = params

    try {
      let query = supabase
        .from("communities")
        .select("*, owner:users!owner_id(*), members:community_members(count)", { count: "exact" })

      // Apply filters
      if (category) {
        query = query.eq("category", category)
      }

      if (type) {
        query = query.eq("type", type)
      }

      if (search) {
        query = query.ilike("name", `%${search}%`)
      }

      // If filtering by user's communities
      if (myCommunitiesOnly) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Get user's community IDs
          const { data: memberData } = await supabase
            .from("community_members")
            .select("community_id")
            .eq("user_id", user.id)

          const communityIds = memberData?.map(m => m.community_id) || []
          if (communityIds.length > 0) {
            query = query.in("id", communityIds)
          } else {
            return { data: [], hasMore: false, total: 0 }
          }
        }
      }

      // Apply sorting
      switch (sortBy) {
        case "trending":
          // Sort by activity (posts in last 24h + member growth)
          query = query.order("post_count", { ascending: false })
          break
        case "recent":
          query = query.order("created_at", { ascending: false })
          break
        case "members":
          query = query.order("member_count", { ascending: false })
          break
        case "posts":
          query = query.order("post_count", { ascending: false })
          break
      }

      // Apply pagination
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      // Check if user is member of each community
      const { data: { user } } = await supabase.auth.getUser()
      if (user && data) {
        const communityIds = data.map(c => c.id)
        const { data: memberships } = await supabase
          .from("community_members")
          .select("community_id, role")
          .eq("user_id", user.id)
          .in("community_id", communityIds)

        const membershipMap = new Map(
          memberships?.map(m => [m.community_id, m.role]) || []
        )

        data.forEach(community => {
          community.is_member = membershipMap.has(community.id)
          community.member_role = membershipMap.get(community.id)
          community.member_count = community.members?.[0]?.count || 0
          delete community.members
        })
      }

      return {
        data: data || [],
        hasMore: count ? (offset + limit) < count : false,
        total: count || 0
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
      throw error
    }
  }

  /**
   * Get single community details
   */
  static async getCommunity(communityId: string): Promise<Community | null> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*, owner:users!owner_id(*)")
        .eq("id", communityId)
        .single()

      if (error) throw error

      // Check if user is member
      const { data: { user } } = await supabase.auth.getUser()
      if (user && data) {
        const { data: membership } = await supabase
          .from("community_members")
          .select("role")
          .eq("community_id", communityId)
          .eq("user_id", user.id)
          .single()

        data.is_member = !!membership
        data.member_role = membership?.role
      }

      return data
    } catch (error) {
      console.error("Error fetching community:", error)
      return null
    }
  }

  /**
   * Create new community (Diamond+ only)
   */
  static async createCommunity(data: CreateCommunityData): Promise<ApiResponse<Community>> {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          success: false, 
          error: "Usuário não autenticado", 
          data: null 
        }
      }

      // Check if user can create communities (Diamond+)
      const { data: userData } = await supabase
        .from("users")
        .select("premium_type")
        .eq("id", user.id)
        .single()

      if (!userData || !["diamond", "couple"].includes(userData.premium_type)) {
        return {
          success: false,
          error: "Apenas usuários Diamond ou Couple podem criar comunidades",
          data: null
        }
      }

      // Create community
      const { data: community, error } = await supabase
        .from("communities")
        .insert({
          ...data,
          owner_id: user.id,
          member_count: 1,
          post_count: 0
        })
        .select("*, owner:users!owner_id(*)")
        .single()

      if (error) throw error

      // Add owner as first member
      await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: "owner",
          approved_at: new Date().toISOString()
        })

      // Create community group chat
      const { data: groupChat } = await supabase
        .from("conversations")
        .insert({
          name: community.name,
          is_group: true,
          group_type: "community",
          created_by: user.id,
          avatar_url: community.avatar_url
        })
        .select()
        .single()

      if (groupChat) {
        // Update community with chat ID
        await supabase
          .from("communities")
          .update({ group_chat_id: groupChat.id })
          .eq("id", community.id)

        // Add owner to chat
        await supabase
          .from("conversation_participants")
          .insert({
            conversation_id: groupChat.id,
            user_id: user.id,
            role: "admin"
          })
      }

      return {
        success: true,
        data: community,
        error: null
      }
    } catch (error: any) {
      console.error("Error creating community:", error)
      return {
        success: false,
        error: error.message || "Erro ao criar comunidade",
        data: null
      }
    }
  }

  /**
   * Join community
   */
  static async joinCommunity(communityId: string): Promise<ApiResponse<boolean>> {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          success: false, 
          error: "Usuário não autenticado", 
          data: false 
        }
      }

      // Check user plan
      const { data: userData } = await supabase
        .from("users")
        .select("premium_type")
        .eq("id", user.id)
        .single()

      if (!userData) {
        return {
          success: false,
          error: "Usuário não encontrado",
          data: false
        }
      }

      // Free users cannot join communities
      if (userData.premium_type === "free") {
        return {
          success: false,
          error: "Usuários Free não podem participar de comunidades",
          data: false
        }
      }

      // Gold users can join up to 5 communities
      if (userData.premium_type === "gold") {
        const { count } = await supabase
          .from("community_members")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (count && count >= 5) {
          return {
            success: false,
            error: "Usuários Gold podem participar de no máximo 5 comunidades",
            data: false
          }
        }
      }

      // Get community details
      const { data: community } = await supabase
        .from("communities")
        .select("type, requires_approval, group_chat_id")
        .eq("id", communityId)
        .single()

      if (!community) {
        return {
          success: false,
          error: "Comunidade não encontrada",
          data: false
        }
      }

      // Check if already member
      const { data: existingMember } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single()

      if (existingMember) {
        return {
          success: false,
          error: "Você já é membro desta comunidade",
          data: false
        }
      }

      // Join community
      const memberData = {
        community_id: communityId,
        user_id: user.id,
        role: "member" as const,
        approved_at: community.requires_approval ? null : new Date().toISOString()
      }

      const { error } = await supabase
        .from("community_members")
        .insert(memberData)

      if (error) throw error

      // If approved immediately, add to group chat
      if (!community.requires_approval && community.group_chat_id) {
        await supabase
          .from("conversation_participants")
          .insert({
            conversation_id: community.group_chat_id,
            user_id: user.id,
            role: "participant"
          })
      }

      // Update member count
      await supabase.rpc("increment_community_members", {
        community_id: communityId,
        increment: 1
      })

      return {
        success: true,
        data: true,
        error: null
      }
    } catch (error: any) {
      console.error("Error joining community:", error)
      return {
        success: false,
        error: error.message || "Erro ao entrar na comunidade",
        data: false
      }
    }
  }

  /**
   * Leave community
   */
  static async leaveCommunity(communityId: string): Promise<ApiResponse<boolean>> {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          success: false, 
          error: "Usuário não autenticado", 
          data: false 
        }
      }

      // Check if member and not owner
      const { data: membership } = await supabase
        .from("community_members")
        .select("role")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single()

      if (!membership) {
        return {
          success: false,
          error: "Você não é membro desta comunidade",
          data: false
        }
      }

      if (membership.role === "owner") {
        return {
          success: false,
          error: "O dono não pode sair da comunidade",
          data: false
        }
      }

      // Remove from community
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id)

      if (error) throw error

      // Remove from group chat
      const { data: community } = await supabase
        .from("communities")
        .select("group_chat_id")
        .eq("id", communityId)
        .single()

      if (community?.group_chat_id) {
        await supabase
          .from("conversation_participants")
          .delete()
          .eq("conversation_id", community.group_chat_id)
          .eq("user_id", user.id)
      }

      // Update member count
      await supabase.rpc("increment_community_members", {
        community_id: communityId,
        increment: -1
      })

      return {
        success: true,
        data: true,
        error: null
      }
    } catch (error: any) {
      console.error("Error leaving community:", error)
      return {
        success: false,
        error: error.message || "Erro ao sair da comunidade",
        data: false
      }
    }
  }

  /**
   * Get community members
   */
  static async getCommunityMembers(
    communityId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<CommunityMember>> {
    const supabase = createClient()
    
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from("community_members")
        .select("*, user:users(*)", { count: "exact" })
        .eq("community_id", communityId)
        .order("role", { ascending: true })
        .order("joined_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error("Error fetching community members:", error)
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  /**
   * Get community posts
   */
  static async getCommunityPosts(
    communityId: string,
    page = 1,
    limit = 10
  ): Promise<{
    data: CommunityPost[]
    hasMore: boolean
  }> {
    const supabase = createClient()
    
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from("community_posts")
        .select("*, user:users(*)", { count: "exact" })
        .eq("community_id", communityId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Check likes for current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user && data) {
        const postIds = data.map(p => p.id)
        const { data: likes } = await supabase
          .from("community_post_likes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds)

        const likedPosts = new Set(likes?.map(l => l.post_id) || [])
        data.forEach(post => {
          post.is_liked = likedPosts.has(post.id)
        })
      }

      return {
        data: data || [],
        hasMore: count ? (offset + limit) < count : false
      }
    } catch (error) {
      console.error("Error fetching community posts:", error)
      return {
        data: [],
        hasMore: false
      }
    }
  }

  /**
   * Create community post
   */
  static async createCommunityPost(
    communityId: string,
    content: string,
    mediaUrls?: string[]
  ): Promise<ApiResponse<CommunityPost>> {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { 
          success: false, 
          error: "Usuário não autenticado", 
          data: null 
        }
      }

      // Check if user is member
      const { data: membership } = await supabase
        .from("community_members")
        .select("id")
        .eq("community_id", communityId)
        .eq("user_id", user.id)
        .single()

      if (!membership) {
        return {
          success: false,
          error: "Você precisa ser membro para postar",
          data: null
        }
      }

      // Create post
      const { data: post, error } = await supabase
        .from("community_posts")
        .insert({
          community_id: communityId,
          user_id: user.id,
          content,
          media_urls: mediaUrls || null,
          is_pinned: false,
          likes_count: 0,
          comments_count: 0
        })
        .select("*, user:users(*)")
        .single()

      if (error) throw error

      // Update post count
      await supabase.rpc("increment_community_posts", {
        community_id: communityId,
        increment: 1
      })

      return {
        success: true,
        data: post,
        error: null
      }
    } catch (error: any) {
      console.error("Error creating community post:", error)
      return {
        success: false,
        error: error.message || "Erro ao criar post",
        data: null
      }
    }
  }
}