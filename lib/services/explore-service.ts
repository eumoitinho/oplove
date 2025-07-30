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
      const offset = (page - 1) * limit

      // Buscar localização do usuário atual
      const { data: currentUser } = await this.supabase
        .from('users')
        .select('location')
        .eq('id', userId)
        .single()

      if (!currentUser?.location) {
        throw new Error('User location not found')
      }

      // Query com filtros
      let query = this.supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          age,
          gender,
          location,
          avatar_url,
          banner_url,
          bio,
          interests,
          is_verified,
          is_online,
          last_seen,
          premium_type,
          rating,
          review_count,
          photos,
          is_couple,
          couple_partner,
          created_at
        `)
        .neq('id', userId) // Excluir o próprio usuário

      // Filtro de idade
      if (filters.age_range.min > 0) {
        query = query.gte('age', filters.age_range.min)
      }
      if (filters.age_range.max > 0) {
        query = query.lte('age', filters.age_range.max)
      }

      // Filtro de gênero
      if (filters.gender.length > 0) {
        query = query.in('gender', filters.gender)
      }

      // Filtro de verificação
      if (filters.verification_required) {
        query = query.eq('is_verified', true)
      }

      // Filtro de online
      if (filters.online_only) {
        query = query.eq('is_online', true)
      }

      // Filtro de premium
      if (filters.premium_only) {
        query = query.in('premium_type', ['gold', 'diamond', 'couple'])
      }

      // Filtro de fotos
      if (filters.has_photos) {
        query = query.not('photos', 'is', null)
        query = query.neq('photos', '{}')
      }

      // Ordenação por distância será feita no frontend
      const { data: profiles, error } = await query
        .order('last_seen', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Calcular distâncias e filtrar
      const profilesWithDistance = profiles
        ?.map(profile => ({
          ...profile,
          distance: this.calculateDistance(
            currentUser.location.latitude,
            currentUser.location.longitude,
            profile.location?.latitude || 0,
            profile.location?.longitude || 0
          )
        }))
        .filter(profile => profile.distance <= filters.distance_km)
        .sort((a, b) => a.distance - b.distance) || []

      return {
        data: profilesWithDistance,
        hasMore: profilesWithDistance.length === limit,
        total: undefined
      }
    } catch (error) {
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
          full_name,
          age,
          gender,
          location,
          avatar_url,
          bio,
          interests,
          is_verified,
          is_online,
          premium_type,
          rating,
          review_count,
          photos,
          is_couple
        `)
        .not('avatar_url', 'is', null)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
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
          full_name,
          age,
          gender,
          location,
          avatar_url,
          bio,
          interests,
          is_verified,
          is_online,
          premium_type,
          rating,
          is_couple
        `)
        .neq('id', userId)
        .not('avatar_url', 'is', null)
        .overlaps('interests', currentUser.interests || [])
        .order('rating', { ascending: false })
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