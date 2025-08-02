import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/auth/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ExploreFilters } from '@/types/adult'

// GET /api/v1/explore/users - Search and filter users
export async function GET(request: NextRequest) {
  return withAuth(async (currentUser) => {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Parse filters from query params
    const filters: ExploreFilters = {
      distance_km: parseInt(searchParams.get('distance_km') || '50'),
      age_range: {
        min: parseInt(searchParams.get('age_min') || '18'),
        max: parseInt(searchParams.get('age_max') || '65')
      },
      gender: searchParams.get('gender')?.split(',').filter(Boolean) || [],
      interests: searchParams.get('interests')?.split(',').filter(Boolean) || [],
      verification_required: searchParams.get('verification_required') === 'true',
      online_only: searchParams.get('online_only') === 'true',
      has_photos: searchParams.get('has_photos') === 'true',
      premium_only: searchParams.get('premium_only') === 'true',
      relationship_type: (searchParams.get('relationship_type') || 'both') as any
    }

    const supabase = await createServerClient()

    try {
      // Get current user location
      const { data: userData } = await supabase
        .from('users')
        .select('location')
        .eq('id', currentUser.id)
        .single()

      if (!userData?.location || !userData.location.latitude || !userData.location.longitude) {
        console.warn('User location not found for:', currentUser.id)
        // Use default location (São Paulo) if user has no location
        userData.location = {
          latitude: -23.5505,
          longitude: -46.6333
        }
      }

      // Build query
      let query = supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          display_name,
          birth_date,
          gender,
          location,
          avatar_url,
          bio,
          interests,
          is_verified,
          last_active_at,
          premium_type,
          created_at
        `)
        .neq('id', currentUser.id)

      // Apply filters
      if (filters.gender.length > 0) {
        query = query.in('gender', filters.gender)
      }

      if (filters.verification_required) {
        query = query.eq('is_verified', true)
      }

      if (filters.online_only) {
        // Consider online if last active within 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        query = query.gte('last_active_at', fiveMinutesAgo)
      }

      if (filters.premium_only) {
        query = query.in('premium_type', ['gold', 'diamond', 'couple'])
      }

      if (filters.has_photos) {
        query = query.not('avatar_url', 'is', null)
      }

      // Apply age filter based on birth_date
      if (filters.age_range.min > 0 || filters.age_range.max > 0) {
        const today = new Date()
        const maxBirthDate = new Date(today.getFullYear() - filters.age_range.min, today.getMonth(), today.getDate())
        const minBirthDate = new Date(today.getFullYear() - filters.age_range.max - 1, today.getMonth(), today.getDate())
        
        query = query.lte('birth_date', maxBirthDate.toISOString())
        query = query.gte('birth_date', minBirthDate.toISOString())
      }

      // Execute query
      console.log('🔍 Explore API - Executing query with filters:', {
        gender: filters.gender,
        verification_required: filters.verification_required,
        online_only: filters.online_only,
        premium_only: filters.premium_only,
        has_photos: filters.has_photos,
        age_range: filters.age_range,
        offset,
        limit
      })

      const { data: profiles, error } = await query
        .order('last_active_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('❌ Explore API - Error fetching profiles:', error)
        return {
          success: false,
          error: 'Failed to fetch profiles'
        }
      }

      console.log('✅ Explore API - Found profiles:', profiles?.length || 0)

      // Calculate age and distance for each profile
      const profilesWithDetails = profiles?.map(profile => {
        // Calculate age
        const birthDate = new Date(profile.birth_date)
        const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

        // Calculate distance
        const distance = calculateDistance(
          userData.location.latitude,
          userData.location.longitude,
          profile.location?.latitude || 0,
          profile.location?.longitude || 0
        )

        // Format photos array - for now just use avatar_url
        const photos = profile.avatar_url ? [profile.avatar_url] : []

        return {
          ...profile,
          age,
          distance,
          photos,
          is_online: profile.last_active_at && 
            new Date(profile.last_active_at).getTime() > Date.now() - 5 * 60 * 1000
        }
      }) || []

      // Filter by distance
      const filteredProfiles = profilesWithDetails
        .filter(profile => profile.distance <= filters.distance_km)
        .sort((a, b) => a.distance - b.distance)

      // Filter by interests if specified
      const finalProfiles = filters.interests.length > 0
        ? filteredProfiles.filter(profile => 
            profile.interests?.some((interest: string) => filters.interests.includes(interest))
          )
        : filteredProfiles

      return {
        success: true,
        data: finalProfiles,
        hasMore: finalProfiles.length === limit,
        total: finalProfiles.length
      }
    } catch (error) {
      console.error('Explore users error:', error)
      return {
        success: false,
        error: 'An error occurred while searching profiles'
      }
    }
  })
}

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180)
}