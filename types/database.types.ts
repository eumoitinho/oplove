/**
 * Database type aliases for OpenLove
 * 
 * This file provides clean, easy-to-use aliases for Supabase generated types.
 * These aliases maintain backward compatibility while migrating to official types.
 */

import { Database } from './supabase'

// ============================================================================
// Core Entity Types
// ============================================================================

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']

export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row']
export type ConversationParticipantInsert = Database['public']['Tables']['conversation_participants']['Insert']
export type ConversationParticipantUpdate = Database['public']['Tables']['conversation_participants']['Update']

export type Story = Database['public']['Tables']['stories']['Row']
export type StoryInsert = Database['public']['Tables']['stories']['Insert']
export type StoryUpdate = Database['public']['Tables']['stories']['Update']

export type StoryView = Database['public']['Tables']['story_views']['Row']
export type StoryViewInsert = Database['public']['Tables']['story_views']['Insert']
export type StoryViewUpdate = Database['public']['Tables']['story_views']['Update']

export type StoryDailyLimit = Database['public']['Tables']['story_daily_limits']['Row']
export type StoryDailyLimitInsert = Database['public']['Tables']['story_daily_limits']['Insert']
export type StoryDailyLimitUpdate = Database['public']['Tables']['story_daily_limits']['Update']

// Story reaction enum
export type StoryReaction = Database['public']['Enums']['story_reaction']

export type ProfileSeal = Database['public']['Tables']['profile_seals']['Row']
export type ProfileSealInsert = Database['public']['Tables']['profile_seals']['Insert']
export type ProfileSealUpdate = Database['public']['Tables']['profile_seals']['Update']

export type UserProfileSeal = Database['public']['Tables']['user_profile_seals']['Row']
export type UserProfileSealInsert = Database['public']['Tables']['user_profile_seals']['Insert']
export type UserProfileSealUpdate = Database['public']['Tables']['user_profile_seals']['Update']

// User related enums
export type PremiumType = Database['public']['Enums']['premium_type']

// ============================================================================
// Business & Premium Types
// ============================================================================

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

export type UserCredit = Database['public']['Tables']['user_credits']['Row']
export type UserCreditInsert = Database['public']['Tables']['user_credits']['Insert']
export type UserCreditUpdate = Database['public']['Tables']['user_credits']['Update']

export type UserCreditTransaction = Database['public']['Tables']['user_credit_transactions']['Row']
export type UserCreditTransactionInsert = Database['public']['Tables']['user_credit_transactions']['Insert']
export type UserCreditTransactionUpdate = Database['public']['Tables']['user_credit_transactions']['Update']

export type PaidContent = Database['public']['Tables']['paid_content']['Row']
export type PaidContentInsert = Database['public']['Tables']['paid_content']['Insert']
export type PaidContentUpdate = Database['public']['Tables']['paid_content']['Update']

// ============================================================================
// Social Features Types
// ============================================================================

export type Follow = Database['public']['Tables']['follows']['Row']
export type FollowInsert = Database['public']['Tables']['follows']['Insert']
export type FollowUpdate = Database['public']['Tables']['follows']['Update']

export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']
export type BlockedUserInsert = Database['public']['Tables']['blocked_users']['Insert']
export type BlockedUserUpdate = Database['public']['Tables']['blocked_users']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type PostReaction = Database['public']['Tables']['post_reactions']['Row']
export type PostReactionInsert = Database['public']['Tables']['post_reactions']['Insert']
export type PostReactionUpdate = Database['public']['Tables']['post_reactions']['Update']

export type Comment = Database['public']['Tables']['comments']['Row']
export type CommentInsert = Database['public']['Tables']['comments']['Insert']
export type CommentUpdate = Database['public']['Tables']['comments']['Update']

// ============================================================================
// Community & Events Types
// ============================================================================

export type Community = Database['public']['Tables']['communities']['Row']
export type CommunityInsert = Database['public']['Tables']['communities']['Insert']
export type CommunityUpdate = Database['public']['Tables']['communities']['Update']

export type CommunityMember = Database['public']['Tables']['community_members']['Row']
export type CommunityMemberInsert = Database['public']['Tables']['community_members']['Insert']
export type CommunityMemberUpdate = Database['public']['Tables']['community_members']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type EventParticipant = Database['public']['Tables']['event_participants']['Row']
export type EventParticipantInsert = Database['public']['Tables']['event_participants']['Insert']
export type EventParticipantUpdate = Database['public']['Tables']['event_participants']['Update']

// ============================================================================
// Couple System Types  
// ============================================================================

export type Couple = Database['public']['Tables']['couples']['Row']
export type CoupleInsert = Database['public']['Tables']['couples']['Insert']
export type CoupleUpdate = Database['public']['Tables']['couples']['Update']

export type CoupleUser = Database['public']['Tables']['couple_users']['Row']
export type CoupleUserInsert = Database['public']['Tables']['couple_users']['Insert']
export type CoupleUserUpdate = Database['public']['Tables']['couple_users']['Update']

// ============================================================================
// Dating & Matching Types
// ============================================================================

export type DatingProfile = Database['public']['Tables']['dating_profiles']['Row']
export type DatingProfileInsert = Database['public']['Tables']['dating_profiles']['Insert']
export type DatingProfileUpdate = Database['public']['Tables']['dating_profiles']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type Swipe = Database['public']['Tables']['swipes']['Row']
export type SwipeInsert = Database['public']['Tables']['swipes']['Insert']
export type SwipeUpdate = Database['public']['Tables']['swipes']['Update']

// ============================================================================
// Verification & Moderation Types
// ============================================================================

export type UserVerification = Database['public']['Tables']['user_verifications']['Row']
export type UserVerificationInsert = Database['public']['Tables']['user_verifications']['Insert']
export type UserVerificationUpdate = Database['public']['Tables']['user_verifications']['Update']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']

// ============================================================================
// Profile Seals & Gifts Types
// ============================================================================

export type ProfileSeal = Database['public']['Tables']['profile_seals']['Row']
export type ProfileSealInsert = Database['public']['Tables']['profile_seals']['Insert']
export type ProfileSealUpdate = Database['public']['Tables']['profile_seals']['Update']

export type UserProfileSeal = Database['public']['Tables']['user_profile_seals']['Row']
export type UserProfileSealInsert = Database['public']['Tables']['user_profile_seals']['Insert']
export type UserProfileSealUpdate = Database['public']['Tables']['user_profile_seals']['Update']

// ============================================================================
// Advertising & Analytics Types
// ============================================================================

export type AdCampaign = Database['public']['Tables']['ad_campaigns']['Row']
export type AdCampaignInsert = Database['public']['Tables']['ad_campaigns']['Insert']
export type AdCampaignUpdate = Database['public']['Tables']['ad_campaigns']['Update']

export type BusinessAd = Database['public']['Tables']['business_ads']['Row']
export type BusinessAdInsert = Database['public']['Tables']['business_ads']['Insert']
export type BusinessAdUpdate = Database['public']['Tables']['business_ads']['Update']

// Analytics tables - commented out if they don't exist in schema
// export type AnalyticsMetric = Database['public']['Tables']['analytics_metrics']['Row']
// export type AnalyticsMetricInsert = Database['public']['Tables']['analytics_metrics']['Insert']
// export type AnalyticsMetricUpdate = Database['public']['Tables']['analytics_metrics']['Update']

// ============================================================================
// Enum Types (for easier access)
// ============================================================================

export type PremiumStatus = Database['public']['Enums']['premium_status']
export type AccountType = Database['public']['Enums']['account_type']
export type GenderType = Database['public']['Enums']['gender_type']
export type ProfileType = Database['public']['Enums']['profile_type']
export type UserRole = Database['public']['Enums']['user_role']
export type UserStatus = Database['public']['Enums']['user_status']
export type MessageType = Database['public']['Enums']['message_type']
export type ConversationType = Database['public']['Enums']['conversation_type']
// Commenting out enums that may not exist in current schema
// export type NotificationType = Database['public']['Enums']['notification_type']
// export type ReactionType = Database['public']['Enums']['reaction_type']
// export type PostType = Database['public']['Enums']['post_type']
// export type PostStatus = Database['public']['Enums']['post_status']
// export type EventType = Database['public']['Enums']['event_type']
// export type EventStatus = Database['public']['Enums']['event_status']
// export type ReportType = Database['public']['Enums']['report_type']
// export type ReportStatus = Database['public']['Enums']['report_status']
// export type TransactionType = Database['public']['Enums']['transaction_type']
// export type TransactionStatus = Database['public']['Enums']['transaction_status']
export type BusinessType = Database['public']['Enums']['business_type']
export type CampaignObjective = Database['public']['Enums']['campaign_objective']
export type AdStatus = Database['public']['Enums']['ad_status']
export type AdminDepartment = Database['public']['Enums']['admin_department']

// ============================================================================
// Function Types (commonly used stored procedures)
// ============================================================================

export type GetUserConversationsResult = Database['public']['Functions']['get_user_conversations']['Returns'][0]
export type GetUserFriendsResult = Database['public']['Functions']['get_user_friends']['Returns'][0]
export type GetUserMessageActivityResult = Database['public']['Functions']['get_user_message_activity']['Returns'][0]
export type GetPostsWithInteractionsResult = Database['public']['Functions']['get_posts_with_interactions']['Returns'][0]
export type GetPollWithStatsResult = Database['public']['Functions']['get_poll_with_stats']['Returns'][0]
// export type GetConversationStatsResult = Database['public']['Functions']['get_conversation_stats']['Returns'][0]

// ============================================================================
// Utility Types for Complex Queries
// ============================================================================

// User with selected profile fields (commonly used)
export type UserProfile = Pick<User, 
  'id' | 'username' | 'name' | 'avatar_url' | 'bio' | 'is_verified' | 
  'premium_type' | 'city' | 'uf' | 'gender' | 'birth_date' | 'created_at'
>

// Basic user info for cards/avatars
export type UserBasic = Pick<User, 
  'id' | 'username' | 'name' | 'avatar_url' | 'is_verified' | 'premium_type'
>

// Extended user profile with commonly needed fields
export type UserProfileExtended = Pick<User, 
  'id' | 'username' | 'name' | 'avatar_url' | 'bio' | 'is_verified' | 
  'premium_type' | 'premium_status' | 'city' | 'uf' | 'gender' | 'birth_date' | 
  'created_at'
>

// Message with sender info
export type MessageWithSender = Message & {
  sender?: UserBasic
}

// Conversation with participants
export type ConversationWithParticipants = Conversation & {
  participants?: (ConversationParticipant & {
    user?: UserBasic
  })[]
  last_message?: MessageWithSender
  unread_count?: number
  is_typing?: string[]
}

// Post with author and interactions
export type PostWithDetails = Post & {
  author?: UserBasic
  like_count?: number
  comment_count?: number
  user_has_liked?: boolean
  user_has_saved?: boolean
  comments?: (Comment & {
    user?: UserBasic
  })[]
}

// Story with author info
export type StoryWithAuthor = Story & {
  author?: UserBasic
  view_count?: number
  user_has_viewed?: boolean
}

// Export the Database type for advanced use cases
export type { Database }