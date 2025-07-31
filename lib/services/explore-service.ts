import { createClient } from '@/app/lib/supabase-browser'
import type { UserProfile, ExploreFilters } from '@/types/adult'

class ExploreService {
  private supabase = createClient()

  /**
   * Busca perfis baseado nos filtros de exploração
   */
  async searchProfiles(
    userId: string, 
    filters: ExploreFilters, 
    page: number = 1, 
    limit: number = 20
  ) {
    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        distance_km: filters.distance_km.toString(),
        age_min: filters.age_range.min.toString(),
        age_max: filters.age_range.max.toString(),
        verification_required: filters.verification_required.toString(),
        online_only: filters.online_only.toString(),
        has_photos: filters.has_photos.toString(),
        premium_only: filters.premium_only.toString(),
        relationship_type: filters.relationship_type
      })

      // Add array params
      if (filters.gender.length > 0) {
        params.set('gender', filters.gender.join(','))
      }
      if (filters.interests.length > 0) {
        params.set('interests', filters.interests.join(','))
      }

      // Call API endpoint
      const response = await fetch(`/api/v1/explore/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to search profiles')
      }

      return {
        data: result.data || [],
        hasMore: result.hasMore || false,
        total: result.total
      }
    } catch (error) {
      console.error('Search profiles error:', error)
      throw error
    }
  }

  /**
   * Busca perfis populares (trending)
   */
  async getTrendingProfiles(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit

      const { data: profiles, error } = await this.supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          birth_date,
          gender,
          location,
          avatar_url,
          bio,
          interests,
          is_verified,
          is_active,
          premium_type,
          created_at
        `)
        .not('avatar_url', 'is', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1)

      if (error) throw error

      return profiles || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Busca recomendações personalizadas
   */
  async getRecommendations(userId: string, limit: number = 10) {
    try {
      // Buscar perfil do usuário com interesses
      const { data: currentUser } = await this.supabase
        .from('users')
        .select(`
          interests,
          location,
          gender,
          birth_date
        `)
        .eq('id', userId)
        .single()

      if (!currentUser) {
        throw new Error('User not found')
      }

      // Buscar usuários com interesses similares
      const { data: recommendations, error } = await this.supabase
        .from('users')
        .select(`
          id,
          username,
          name,
          birth_date,
          gender,
          location,
          avatar_url,
          bio,
          interests,
          is_verified,
          is_active,
          premium_type,
          created_at
        `)
        .neq('id', userId)
        .not('avatar_url', 'is', null)
        .eq('is_active', true)
        .overlaps('interests', currentUser.interests || [])
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return recommendations || []
    } catch (error) {
      throw error
    }
  }

  /**
   * Calcula distância entre duas coordenadas (em km)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }
}

export const exploreService = new ExploreService()