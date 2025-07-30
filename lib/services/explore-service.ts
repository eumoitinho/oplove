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
          name,
          birth_date,
          gender,
          location,
          avatar_url,
          bio,
          is_verified,
          is_online,
          last_seen,
          premium_type,
          created_at
        `)
        .neq('id', userId) // Excluir o próprio usuário

      // Filtro de idade - calculado baseado em birth_date
      // Por enquanto, vamos comentar até implementar a lógica correta
      // if (filters.age_range.min > 0) {
      //   query = query.gte('age', filters.age_range.min)
      // }
      // if (filters.age_range.max > 0) {
      //   query = query.lte('age', filters.age_range.max)
      // }

      // Filtro de gênero
      if (filters.gender.length > 0) {
        query = query.in('gender', filters.gender)
      }

      // Filtro de verificação
      if (filters.verification_required) {
        query = query.eq('is_verified', true)
      }

      // Filtro de usuários ativos
      if (filters.online_only) {
        query = query.eq('is_active', true)
      }

      // Filtro de premium
      if (filters.premium_only) {
        query = query.in('premium_type', ['gold', 'diamond', 'couple'])
      }

      // Filtro de fotos - verifica se tem avatar
      if (filters.has_photos) {
        query = query.not('avatar_url', 'is', null)
      }

      // Adicionar filtro de usuários ativos
      query = query.eq('is_active', true)

      // Ordenação por atividade recente
      const { data: profiles, error } = await query
        .order('last_active_at', { ascending: false })
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