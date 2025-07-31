/**
 * Community-related TypeScript types for OpenLove
 */

import { User } from './user.types'

export type CommunityTheme = 'cuckold' | 'bdsm' | 'swinger' | 'fetish'
export type MemberRole = 'member' | 'moderator' | 'admin'
export type MemberStatus = 'pending' | 'active' | 'banned'

export interface Community {
  id: string
  slug: string
  name: string
  description: string
  avatar_url: string | null
  cover_url: string | null
  
  // Theme and category
  theme: CommunityTheme
  is_official: boolean
  is_adult: boolean
  requires_verification: boolean
  
  // Rules and guidelines
  rules: string[]
  welcome_message: string | null
  
  // Stats
  members_count: number
  posts_count: number
  
  // Settings
  is_private: boolean
  auto_approve_members: boolean
  allow_member_posts: boolean
  
  // Creator
  created_by: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  
  // Member role
  role: MemberRole
  
  // Member status
  status: MemberStatus
  
  // Activity
  last_activity: string
  posts_count: number
  
  // Timestamps
  joined_at: string
  created_at: string
  
  // Relations
  user?: User
  community?: Community
}

export interface CommunityPost {
  id: string
  community_id: string
  user_id: string
  
  // Post content
  content: string
  media_urls: string[]
  
  // Stats
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  
  // Visibility
  is_pinned: boolean
  is_hidden: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations
  user?: User
  community?: Community
  interactions?: CommunityPostInteraction[]
  comments?: CommunityPostComment[]
  
  // UI state
  has_liked?: boolean
  has_viewed?: boolean
}

export interface CommunityPostInteraction {
  id: string
  post_id: string
  user_id: string
  type: 'like' | 'view'
  created_at: string
  
  // Relations
  user?: User
}

export interface CommunityPostComment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  
  // Comment content
  content: string
  
  // Stats
  likes_count: number
  
  // Visibility
  is_hidden: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // Relations
  user?: User
  replies?: CommunityPostComment[]
}

export interface CreateCommunityPostData {
  community_id: string
  content: string
  media_urls?: string[]
}

export interface CreateCommunityCommentData {
  post_id: string
  content: string
  parent_id?: string
}

export interface CommunityFilters {
  theme?: CommunityTheme
  is_official?: boolean
  search?: string
}

export interface JoinCommunityResponse {
  success: boolean
  message: string
  member?: CommunityMember
}

export interface CommunityStats {
  total_members: number
  active_members: number
  total_posts: number
  posts_today: number
  posts_this_week: number
  most_active_users: {
    user: User
    posts_count: number
  }[]
}

// Theme metadata for UI
export const COMMUNITY_THEMES = {
  cuckold: {
    name: 'Cuckold',
    color: 'purple',
    icon: '♠️',
    description: 'Para casais e indivíduos no estilo de vida cuckold'
  },
  bdsm: {
    name: 'BDSM',
    color: 'red',
    icon: '⛓️',
    description: 'Dominação, submissão, disciplina e mais'
  },
  swinger: {
    name: 'Swing',
    color: 'pink',
    icon: '💑',
    description: 'Para casais liberais e solteiros(as)'
  },
  fetish: {
    name: 'Fetiches',
    color: 'orange',
    icon: '🔥',
    description: 'Explore diversos fetiches sem julgamentos'
  }
} as const