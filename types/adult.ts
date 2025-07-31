// OpenLove - Adult Social Network Types
// Esta é uma plataforma adulta (+18) para relacionamentos e conteúdo adulto

export type Gender = 'man' | 'woman' | 'trans' | 'couple_mm' | 'couple_ww' | 'couple_mw'

export type AdultInterest = 
  // Orientações e preferências
  | 'men'
  | 'women' 
  | 'trans'
  | 'couples'
  | 'couple_mm'
  | 'couple_ww'
  | 'couple_mw'
  // Fetiches e práticas
  | 'swing'
  | 'menage'
  | 'bdsm'
  | 'fisting'
  | 'anal'
  | 'oral'
  | 'voyeur'
  | 'exhibitionist'
  | 'dominance'
  | 'submission'
  | 'fetishism'
  | 'roleplay'
  | 'tantric'
  | 'rough'
  | 'gentle'
  | 'outdoor'
  | 'public'
  | 'group'
  | 'threesome'
  | 'orgy'
  | 'cuckolding'
  | 'hotwife'
  | 'bull'
  | 'unicorn'
  | 'polyamory'
  | 'casual'
  | 'serious'

export type EventType = 
  | 'party'
  | 'orgy'
  | 'gang_bang'
  | 'swing_party'
  | 'bdsm_session'
  | 'menage'
  | 'group_sex'
  | 'exhibition'
  | 'roleplay_session'
  | 'tantric_workshop'
  | 'fetish_party'
  | 'couples_night'
  | 'singles_mixer'
  | 'polyamory_meetup'
  | 'kink_workshop'
  | 'adult_education'

export type CommunityType = 
  | 'cuckold'
  | 'hotwife'
  | 'swing'
  | 'bdsm'
  | 'fetish'
  | 'polyamory'
  | 'group_sex'
  | 'exhibition'
  | 'voyeur'
  | 'roleplay'
  | 'tantric'
  | 'gay_men'
  | 'lesbian_women'
  | 'bisexual'
  | 'trans_friendly'
  | 'couples_only'
  | 'singles_only'
  | 'mature'
  | 'young_adults'
  | 'experienced'
  | 'beginners'

export interface UserPreferences {
  interests: AdultInterest[]
  gender: Gender
  looking_for: Gender[]
  age_range: {
    min: number
    max: number
  }
  distance_km: number
  relationship_type: 'casual' | 'serious' | 'both'
  experience_level: 'beginner' | 'experienced' | 'expert'
  verification_required: boolean
  couples_friendly: boolean
  single_friendly: boolean
}

export interface LocationData {
  latitude: number
  longitude: number
  city: string
  state: string
  country: string
  address?: string
  visibility: 'public' | 'private' | 'friends'
}

export interface AdultEvent {
  id: string
  title: string
  description: string
  type: EventType
  location: LocationData
  date: string
  duration_hours: number
  max_participants: number
  current_participants: number
  age_restriction: {
    min: number
    max?: number
  }
  gender_restrictions: Gender[]
  requirements: AdultInterest[]
  price?: number
  is_private: boolean
  requires_verification: boolean
  host: {
    id: string
    username: string
    avatar_url?: string
    is_verified: boolean
    rating: number
  }
  images: string[]
  created_at: string
  updated_at: string
}

export interface AdultCommunity {
  id: string
  name: string
  description: string
  type: CommunityType
  member_count: number
  is_private: boolean
  requires_verification: boolean
  age_restriction: {
    min: number
    max?: number
  }
  gender_restrictions: Gender[]
  interests: AdultInterest[]
  rules: string[]
  moderators: string[]
  created_at: string
  avatar_url?: string
  banner_url?: string
}

export interface UserProfile {
  id: string
  username: string
  display_name: string
  age: number
  gender: Gender
  location: LocationData
  avatar_url?: string
  banner_url?: string
  bio: string
  interests: AdultInterest[]
  preferences: UserPreferences
  is_verified: boolean
  is_online: boolean
  last_seen: string
  premium_type: 'free' | 'gold' | 'diamond' | 'couple'
  rating: number
  review_count: number
  photos: string[]
  videos?: string[]
  created_at: string
  is_couple: boolean
  couple_partner?: {
    id: string
    username: string
    avatar_url?: string
  }
}

export interface FeedAlgorithmWeights {
  location: number // 40%
  interests: number // 30%
  activity: number // 15%
  premium: number // 10%
  verification: number // 5%
}

export interface ExploreFilters {
  distance_km: number
  age_range: {
    min: number
    max: number
  }
  gender: Gender[]
  interests: AdultInterest[]
  verification_required: boolean
  online_only: boolean
  has_photos: boolean
  premium_only: boolean
  relationship_type: 'casual' | 'serious' | 'both'
}