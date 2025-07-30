import { User } from "./common"

export type CommunityType = "public" | "private" | "secret"
export type CommunityCategory = 
  | "swing" 
  | "bdsm" 
  | "fetiche" 
  | "poliamor" 
  | "cuckold" 
  | "hotwife" 
  | "sexo_grupal" 
  | "exibicionismo" 
  | "voyeurismo" 
  | "roleplay" 
  | "tantrico" 
  | "gay" 
  | "lesbian" 
  | "bisexual" 
  | "trans" 
  | "casais" 
  | "singles" 
  | "maduros" 
  | "jovens" 
  | "iniciantes" 
  | "experientes" 
  | "outros"

export type MemberRole = "owner" | "admin" | "moderator" | "member"

export interface Community {
  id: string
  name: string
  description: string
  category: CommunityCategory
  type: CommunityType
  avatar_url?: string | null
  banner_url?: string | null
  rules?: string | null
  owner_id: string
  owner?: User
  member_count: number
  post_count: number
  created_at: string
  updated_at: string
  group_chat_id?: string | null
  is_member?: boolean
  member_role?: MemberRole
  requires_approval: boolean
  min_age?: number
  is_nsfw: boolean
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  user?: User
  role: MemberRole
  joined_at: string
  approved_at?: string | null
  approved_by?: string | null
  invitation_code?: string | null
}

export interface CommunityPost {
  id: string
  community_id: string
  user_id: string
  user?: User
  content: string
  media_urls?: string[] | null
  is_pinned: boolean
  likes_count: number
  comments_count: number
  is_liked?: boolean
  created_at: string
  updated_at: string
}

export interface CommunityInvite {
  id: string
  community_id: string
  code: string
  created_by: string
  uses_count: number
  max_uses?: number | null
  expires_at?: string | null
  created_at: string
}

export interface CommunityStats {
  total_members: number
  active_members_24h: number
  posts_today: number
  posts_this_week: number
  growth_rate: number
}