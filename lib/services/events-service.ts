import { createClient } from "@/app/lib/supabase-browser"
import type { Event, EventParticipant, UserBasic } from "@/types/database.types"

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

export class EventsService {
  private static supabase = createClient()

  /**
   * Get paginated list of events with filters
   */
  static async getEvents(params: {
    page?: number
    limit?: number
    category?: string
    location_type?: string
    search?: string
    upcoming_only?: boolean
    user_events?: boolean
    user_id?: string
  }): Promise<PaginatedResponse<Event>> {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      location_type, 
      search, 
      upcoming_only = true,
      user_events = false,
      user_id
    } = params

    try {
      let query = this.supabase
        .from("events")
        .select(`
          *,
          user:users(id, username, name, avatar_url, is_verified, premium_type),
          participants:event_participants(count)
        `, { count: "exact" })

      // Apply filters
      if (upcoming_only) {
        query = query.gte("start_date", new Date().toISOString())
      }

      if (category) {
        query = query.eq("category", category)
      }

      if (location_type) {
        query = query.eq("location_type", location_type)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (user_events && user_id) {
        // Get events where user is participant
        const { data: participations } = await this.supabase
          .from("event_participants")
          .select("event_id")
          .eq("user_id", user_id)
          .eq("status", "confirmed")

        if (participations) {
          const eventIds = participations.map(p => p.event_id)
          query = query.in("id", eventIds)
        }
      }

      // Order and pagination
      query = query
        .order("start_date", { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      // Get participation status for current user
      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (user && data) {
        const eventIds = data.map(event => event.id)
        const { data: participations } = await this.supabase
          .from("event_participants")
          .select("event_id")
          .eq("user_id", user.id)
          .in("event_id", eventIds)
          .eq("status", "confirmed")

        const participatingIds = new Set(participations?.map(p => p.event_id) || [])
        
        data.forEach((event: any) => {
          event.is_participating = participatingIds.has(event.id)
          event.is_owner = event.user_id === user.id
          event.current_participants = event.participants?.[0]?.count || 0
        })
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error: any) {
      console.error("Error fetching events:", error)
      throw error
    }
  }

  /**
   * Get single event by ID
   */
  static async getEvent(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await this.supabase
        .from("events")
        .select(`
          *,
          user:users(id, username, name, avatar_url, is_verified, premium_type),
          participants:event_participants(
            user:users(id, username, name, avatar_url, is_verified, premium_type)
          )
        `)
        .eq("id", eventId)
        .single()

      if (error) throw error

      // Check if current user is participating
      const { data: { user } } = await this.supabase.auth.getUser()
      if (user) {
        const { data: participation } = await this.supabase
          .from("event_participants")
          .select("*")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .eq("status", "confirmed")
          .single()

        data.is_participating = !!participation
        data.is_owner = data.user_id === user.id
      }

      data.current_participants = data.participants?.length || 0

      return { data, error: null, success: true }
    } catch (error: any) {
      console.error("Error fetching event:", error)
      return { 
        data: null, 
        error: error.message || "Erro ao buscar evento", 
        success: false 
      }
    }
  }

  /**
   * Create a new event (with business rules)
   */
  static async createEvent(eventData: {
    name: string
    description: string
    category: string
    event_type: "public" | "private"
    banner_url?: string
    start_date: string
    end_date: string
    location_type: "online" | "in_person"
    location_address?: string
    location_url?: string
    max_participants?: number
    is_paid: boolean
    ticket_price?: number
  }): Promise<ApiResponse<Event>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Get user details to check premium status
      const { data: userData, error: userError } = await this.supabase
        .from("users")
        .select("premium_type, is_verified")
        .eq("id", user.id)
        .single()

      if (userError || !userData) throw new Error("Erro ao buscar dados do usuário")

      // Business rules validation
      if (userData.premium_type === "free") {
        throw new Error("Usuários FREE não podem criar eventos. Faça upgrade para um plano premium!")
      }

      // Check monthly limit for GOLD unverified users
      if (userData.premium_type === "gold" && !userData.is_verified) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await this.supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfMonth.toISOString())

        if (count && count >= 3) {
          throw new Error("Você atingiu o limite de 3 eventos por mês. Verifique sua conta para criar eventos ilimitados!")
        }
      }

      // Validate paid events (Diamond+ only)
      if (eventData.is_paid && !["diamond", "couple"].includes(userData.premium_type)) {
        throw new Error("Apenas usuários Diamond ou Couple podem criar eventos pagos")
      }

      // Create the event
      const { data: event, error: eventError } = await this.supabase
        .from("events")
        .insert({
          ...eventData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Create group chat for the event
      const { data: conversation, error: chatError } = await this.supabase
        .from("conversations")
        .insert({
          name: `Chat - ${eventData.name}`,
          is_group: true,
          group_type: "event",
          created_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (conversation && !chatError) {
        // Update event with group chat ID
        await this.supabase
          .from("events")
          .update({ group_chat_id: conversation.id })
          .eq("id", event.id)

        // Add creator as participant in the chat
        await this.supabase
          .from("conversation_participants")
          .insert({
            conversation_id: conversation.id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          })
      }

      // Add creator as first participant
      await this.supabase
        .from("event_participants")
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: "confirmed",
          joined_at: new Date().toISOString()
        })

      return { data: event, error: null, success: true }
    } catch (error: any) {
      console.error("Error creating event:", error)
      return { 
        data: null, 
        error: error.message || "Erro ao criar evento", 
        success: false 
      }
    }
  }

  /**
   * Join an event
   */
  static async joinEvent(eventId: string): Promise<ApiResponse<EventParticipant>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Get user premium status
      const { data: userData } = await this.supabase
        .from("users")
        .select("premium_type")
        .eq("id", user.id)
        .single()

      if (!userData || userData.premium_type === "free") {
        throw new Error("Usuários FREE não podem participar de eventos. Faça upgrade para um plano premium!")
      }

      // Check if event exists and has space
      const { data: event } = await this.supabase
        .from("events")
        .select("*, participants:event_participants(count)")
        .eq("id", eventId)
        .single()

      if (!event) throw new Error("Evento não encontrado")

      const currentParticipants = event.participants?.[0]?.count || 0
      if (event.max_participants && currentParticipants >= event.max_participants) {
        throw new Error("Evento lotado")
      }

      // Check if already participating
      const { data: existing } = await this.supabase
        .from("event_participants")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .single()

      if (existing) {
        if (existing.status === "confirmed") {
          throw new Error("Você já está participando deste evento")
        }
        
        // Update status if was cancelled
        const { data: updated } = await this.supabase
          .from("event_participants")
          .update({ status: "confirmed", joined_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select()
          .single()

        return { data: updated, error: null, success: true }
      }

      // Join event
      const { data: participation, error } = await this.supabase
        .from("event_participants")
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: "confirmed",
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add to event group chat if exists
      if (event.group_chat_id) {
        await this.supabase
          .from("conversation_participants")
          .insert({
            conversation_id: event.group_chat_id,
            user_id: user.id,
            joined_at: new Date().toISOString()
          })
      }

      return { data: participation, error: null, success: true }
    } catch (error: any) {
      console.error("Error joining event:", error)
      return { 
        data: null, 
        error: error.message || "Erro ao participar do evento", 
        success: false 
      }
    }
  }

  /**
   * Leave an event
   */
  static async leaveEvent(eventId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Update participation status
      const { error } = await this.supabase
        .from("event_participants")
        .update({ status: "cancelled" })
        .eq("event_id", eventId)
        .eq("user_id", user.id)

      if (error) throw error

      // Remove from group chat if exists
      const { data: event } = await this.supabase
        .from("events")
        .select("group_chat_id")
        .eq("id", eventId)
        .single()

      if (event?.group_chat_id) {
        await this.supabase
          .from("conversation_participants")
          .delete()
          .eq("conversation_id", event.group_chat_id)
          .eq("user_id", user.id)
      }

      return { data: true, error: null, success: true }
    } catch (error: any) {
      console.error("Error leaving event:", error)
      return { 
        data: false, 
        error: error.message || "Erro ao sair do evento", 
        success: false 
      }
    }
  }

  /**
   * Update an event (only owner can update)
   */
  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<ApiResponse<Event>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Check ownership
      const { data: event } = await this.supabase
        .from("events")
        .select("user_id")
        .eq("id", eventId)
        .single()

      if (!event || event.user_id !== user.id) {
        throw new Error("Você não tem permissão para editar este evento")
      }

      const { data: updated, error } = await this.supabase
        .from("events")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId)
        .select()
        .single()

      if (error) throw error

      return { data: updated, error: null, success: true }
    } catch (error: any) {
      console.error("Error updating event:", error)
      return { 
        data: null, 
        error: error.message || "Erro ao atualizar evento", 
        success: false 
      }
    }
  }

  /**
   * Delete an event (only owner can delete)
   */
  static async deleteEvent(eventId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      // Check ownership
      const { data: event } = await this.supabase
        .from("events")
        .select("user_id, group_chat_id")
        .eq("id", eventId)
        .single()

      if (!event || event.user_id !== user.id) {
        throw new Error("Você não tem permissão para excluir este evento")
      }

      // Delete group chat if exists
      if (event.group_chat_id) {
        await this.supabase
          .from("conversations")
          .delete()
          .eq("id", event.group_chat_id)
      }

      // Delete event (participants will be cascade deleted)
      const { error } = await this.supabase
        .from("events")
        .delete()
        .eq("id", eventId)

      if (error) throw error

      return { data: true, error: null, success: true }
    } catch (error: any) {
      console.error("Error deleting event:", error)
      return { 
        data: false, 
        error: error.message || "Erro ao excluir evento", 
        success: false 
      }
    }
  }

  /**
   * Get user's monthly event count (for GOLD validation)
   */
  static async getUserMonthlyEventCount(userId: string): Promise<number> {
    try {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await this.supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfMonth.toISOString())

      return count || 0
    } catch (error) {
      console.error("Error getting monthly event count:", error)
      return 0
    }
  }
}