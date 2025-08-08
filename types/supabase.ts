export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ad_campaigns: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          bid_strategy: string | null
          business_id: string | null
          created_at: string | null
          daily_budget: number | null
          description: string | null
          end_date: string
          id: string
          max_bid_amount: number | null
          metrics: Json | null
          name: string
          objective: Database["public"]["Enums"]["campaign_objective"]
          optimization_goal: string | null
          paused_at: string | null
          rejection_reasons: string[] | null
          schedule_days: number[] | null
          schedule_hours: number[] | null
          spent_credits: number | null
          start_date: string
          status: Database["public"]["Enums"]["ad_status"] | null
          targeting: Json
          total_budget: number
          updated_at: string | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          bid_strategy?: string | null
          business_id?: string | null
          created_at?: string | null
          daily_budget?: number | null
          description?: string | null
          end_date: string
          id?: string
          max_bid_amount?: number | null
          metrics?: Json | null
          name: string
          objective: Database["public"]["Enums"]["campaign_objective"]
          optimization_goal?: string | null
          paused_at?: string | null
          rejection_reasons?: string[] | null
          schedule_days?: number[] | null
          schedule_hours?: number[] | null
          spent_credits?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["ad_status"] | null
          targeting?: Json
          total_budget: number
          updated_at?: string | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          bid_strategy?: string | null
          business_id?: string | null
          created_at?: string | null
          daily_budget?: number | null
          description?: string | null
          end_date?: string
          id?: string
          max_bid_amount?: number | null
          metrics?: Json | null
          name?: string
          objective?: Database["public"]["Enums"]["campaign_objective"]
          optimization_goal?: string | null
          paused_at?: string | null
          rejection_reasons?: string[] | null
          schedule_days?: number[] | null
          schedule_hours?: number[] | null
          spent_credits?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["ad_status"] | null
          targeting?: Json
          total_budget?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_impressions: {
        Row: {
          ad_id: string | null
          click_timestamp: string | null
          created_at: string | null
          id: string
          placement: string | null
          user_id: string | null
          was_clicked: boolean | null
        }
        Insert: {
          ad_id?: string | null
          click_timestamp?: string | null
          created_at?: string | null
          id?: string
          placement?: string | null
          user_id?: string | null
          was_clicked?: boolean | null
        }
        Update: {
          ad_id?: string | null
          click_timestamp?: string | null
          created_at?: string | null
          id?: string
          placement?: string | null
          user_id?: string | null
          was_clicked?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_interactions: {
        Row: {
          ad_id: string | null
          campaign_id: string | null
          click_position: Json | null
          conversion_type: string | null
          conversion_value: number | null
          created_at: string | null
          device_type: string | null
          distance_from_business: number | null
          id: string
          interaction_type: string
          ip_address: unknown | null
          placement: string
          referrer: string | null
          time_to_click: number | null
          user_agent: string | null
          user_id: string | null
          user_location: unknown | null
        }
        Insert: {
          ad_id?: string | null
          campaign_id?: string | null
          click_position?: Json | null
          conversion_type?: string | null
          conversion_value?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_from_business?: number | null
          id?: string
          interaction_type: string
          ip_address?: unknown | null
          placement: string
          referrer?: string | null
          time_to_click?: number | null
          user_agent?: string | null
          user_id?: string | null
          user_location?: unknown | null
        }
        Update: {
          ad_id?: string | null
          campaign_id?: string | null
          click_position?: Json | null
          conversion_type?: string | null
          conversion_value?: number | null
          created_at?: string | null
          device_type?: string | null
          distance_from_business?: number | null
          id?: string
          interaction_type?: string
          ip_address?: unknown | null
          placement?: string
          referrer?: string | null
          time_to_click?: number | null
          user_agent?: string | null
          user_id?: string | null
          user_location?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_interactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "business_ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_interactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_action_logs: {
        Row: {
          action: Database["public"]["Enums"]["admin_action_type"]
          action_description: string
          admin_id: string | null
          changes: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          notes: string | null
          reason: string | null
          request_id: string | null
          target_data: Json | null
          target_id: string | null
          target_type: string
          user_agent: string | null
          was_successful: boolean | null
        }
        Insert: {
          action: Database["public"]["Enums"]["admin_action_type"]
          action_description: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address: unknown
          notes?: string | null
          reason?: string | null
          request_id?: string | null
          target_data?: Json | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
          was_successful?: boolean | null
        }
        Update: {
          action?: Database["public"]["Enums"]["admin_action_type"]
          action_description?: string
          admin_id?: string | null
          changes?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          notes?: string | null
          reason?: string | null
          request_id?: string | null
          target_data?: Json | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
          was_successful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_action_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_metrics: {
        Row: {
          active_users: number | null
          ads_served: number | null
          api_errors: number | null
          api_requests: number | null
          average_response_time: number | null
          businesses_new: number | null
          businesses_total: number | null
          businesses_verified: number | null
          content_removed: number | null
          created_at: string | null
          dating_profiles_active: number | null
          id: string
          matches_created: number | null
          messages_sent: number | null
          metric_date: string
          metric_hour: number | null
          new_users: number | null
          posts_created: number | null
          posts_removed: number | null
          premium_users: number | null
          refunds_total: number | null
          reports_created: number | null
          reports_resolved: number | null
          revenue_content: number | null
          revenue_credits: number | null
          revenue_subscriptions: number | null
          revenue_total: number | null
          swipes_total: number | null
          total_users: number | null
          users_banned: number | null
          verified_users: number | null
        }
        Insert: {
          active_users?: number | null
          ads_served?: number | null
          api_errors?: number | null
          api_requests?: number | null
          average_response_time?: number | null
          businesses_new?: number | null
          businesses_total?: number | null
          businesses_verified?: number | null
          content_removed?: number | null
          created_at?: string | null
          dating_profiles_active?: number | null
          id?: string
          matches_created?: number | null
          messages_sent?: number | null
          metric_date: string
          metric_hour?: number | null
          new_users?: number | null
          posts_created?: number | null
          posts_removed?: number | null
          premium_users?: number | null
          refunds_total?: number | null
          reports_created?: number | null
          reports_resolved?: number | null
          revenue_content?: number | null
          revenue_credits?: number | null
          revenue_subscriptions?: number | null
          revenue_total?: number | null
          swipes_total?: number | null
          total_users?: number | null
          users_banned?: number | null
          verified_users?: number | null
        }
        Update: {
          active_users?: number | null
          ads_served?: number | null
          api_errors?: number | null
          api_requests?: number | null
          average_response_time?: number | null
          businesses_new?: number | null
          businesses_total?: number | null
          businesses_verified?: number | null
          content_removed?: number | null
          created_at?: string | null
          dating_profiles_active?: number | null
          id?: string
          matches_created?: number | null
          messages_sent?: number | null
          metric_date?: string
          metric_hour?: number | null
          new_users?: number | null
          posts_created?: number | null
          posts_removed?: number | null
          premium_users?: number | null
          refunds_total?: number | null
          reports_created?: number | null
          reports_resolved?: number | null
          revenue_content?: number | null
          revenue_credits?: number | null
          revenue_subscriptions?: number | null
          revenue_total?: number | null
          swipes_total?: number | null
          total_users?: number | null
          users_banned?: number | null
          verified_users?: number | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          access_level: number
          actions_count: number | null
          created_at: string | null
          deactivated_at: string | null
          deactivation_reason: string | null
          departments: Database["public"]["Enums"]["admin_department"][]
          employee_id: string | null
          full_name: string
          id: string
          is_active: boolean | null
          is_department_head: boolean | null
          last_ip: unknown | null
          last_login: string | null
          login_count: number | null
          must_change_password: boolean | null
          password_changed_at: string | null
          permissions: Json
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_level: number
          actions_count?: number | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          departments: Database["public"]["Enums"]["admin_department"][]
          employee_id?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          is_department_head?: boolean | null
          last_ip?: unknown | null
          last_login?: string | null
          login_count?: number | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          permissions?: Json
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: number
          actions_count?: number | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivation_reason?: string | null
          departments?: Database["public"]["Enums"]["admin_department"][]
          employee_id?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_department_head?: boolean | null
          last_ip?: unknown | null
          last_login?: string | null
          login_count?: number | null
          must_change_password?: boolean | null
          password_changed_at?: string | null
          permissions?: Json
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          advertiser_id: string | null
          budget: number | null
          clicks: number | null
          content: string | null
          cost_per_click: number | null
          cost_per_impression: number | null
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          ends_at: string | null
          id: string
          impressions: number | null
          media_url: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["ad_status"] | null
          target_age_max: number | null
          target_age_min: number | null
          target_interests: string[] | null
          target_locations: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          budget?: number | null
          clicks?: number | null
          content?: string | null
          cost_per_click?: number | null
          cost_per_impression?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          impressions?: number | null
          media_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"] | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_interests?: string[] | null
          target_locations?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          budget?: number | null
          clicks?: number | null
          content?: string | null
          cost_per_click?: number | null
          cost_per_impression?: number | null
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          ends_at?: string | null
          id?: string
          impressions?: number | null
          media_url?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["ad_status"] | null
          target_age_max?: number | null
          target_age_min?: number | null
          target_interests?: string[] | null
          target_locations?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_users: {
        Row: {
          blocked_at: string | null
          blocked_id: string | null
          blocker_id: string | null
          created_at: string | null
          id: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      business_ads: {
        Row: {
          business_id: string | null
          campaign_id: string | null
          clicks: number | null
          content: Json
          conversions: number | null
          created_at: string | null
          credits_spent: number | null
          first_served_at: string | null
          format: Database["public"]["Enums"]["ad_format"]
          id: string
          impressions: number | null
          last_served_at: string | null
          metrics_by_day: Json | null
          metrics_by_hour: Json | null
          metrics_by_placement: Json | null
          placement_priority: number | null
          quality_score: number | null
          status: Database["public"]["Enums"]["ad_status"] | null
          unique_clicks: number | null
          unique_impressions: number | null
          updated_at: string | null
          variations: Json | null
          winning_variation: number | null
        }
        Insert: {
          business_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          content: Json
          conversions?: number | null
          created_at?: string | null
          credits_spent?: number | null
          first_served_at?: string | null
          format: Database["public"]["Enums"]["ad_format"]
          id?: string
          impressions?: number | null
          last_served_at?: string | null
          metrics_by_day?: Json | null
          metrics_by_hour?: Json | null
          metrics_by_placement?: Json | null
          placement_priority?: number | null
          quality_score?: number | null
          status?: Database["public"]["Enums"]["ad_status"] | null
          unique_clicks?: number | null
          unique_impressions?: number | null
          updated_at?: string | null
          variations?: Json | null
          winning_variation?: number | null
        }
        Update: {
          business_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          content?: Json
          conversions?: number | null
          created_at?: string | null
          credits_spent?: number | null
          first_served_at?: string | null
          format?: Database["public"]["Enums"]["ad_format"]
          id?: string
          impressions?: number | null
          last_served_at?: string | null
          metrics_by_day?: Json | null
          metrics_by_hour?: Json | null
          metrics_by_placement?: Json | null
          placement_priority?: number | null
          quality_score?: number | null
          status?: Database["public"]["Enums"]["ad_status"] | null
          unique_clicks?: number | null
          unique_impressions?: number | null
          updated_at?: string | null
          variations?: Json | null
          winning_variation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_ads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_ads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      business_team: {
        Row: {
          business_id: string | null
          department: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          permissions: Json | null
          removed_at: string | null
          role: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          removed_at?: string | null
          role: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json | null
          removed_at?: string | null
          role?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_team_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: Json | null
          business_hours: Json | null
          business_name: string
          business_type: Database["public"]["Enums"]["business_type"]
          category: string | null
          cnpj: string | null
          contact: Json
          coordinates: unknown | null
          cover_image_url: string | null
          created_at: string | null
          credit_balance: number | null
          description: string | null
          features: Json | null
          gallery_urls: string[] | null
          id: string
          is_verified: boolean | null
          last_active_at: string | null
          legal_name: string | null
          logo_url: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          owner_id: string | null
          service_area_radius: number | null
          settings: Json | null
          short_description: string | null
          slug: string | null
          social_links: Json | null
          stats: Json | null
          status: string | null
          subcategories: string[] | null
          suspension_reason: string | null
          tags: string[] | null
          total_credits_purchased: number | null
          total_credits_spent: number | null
          total_revenue: number | null
          updated_at: string | null
          verification_documents: string[] | null
          verification_level: number | null
          verified_at: string | null
        }
        Insert: {
          address?: Json | null
          business_hours?: Json | null
          business_name: string
          business_type: Database["public"]["Enums"]["business_type"]
          category?: string | null
          cnpj?: string | null
          contact: Json
          coordinates?: unknown | null
          cover_image_url?: string | null
          created_at?: string | null
          credit_balance?: number | null
          description?: string | null
          features?: Json | null
          gallery_urls?: string[] | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          legal_name?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          owner_id?: string | null
          service_area_radius?: number | null
          settings?: Json | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          stats?: Json | null
          status?: string | null
          subcategories?: string[] | null
          suspension_reason?: string | null
          tags?: string[] | null
          total_credits_purchased?: number | null
          total_credits_spent?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verification_documents?: string[] | null
          verification_level?: number | null
          verified_at?: string | null
        }
        Update: {
          address?: Json | null
          business_hours?: Json | null
          business_name?: string
          business_type?: Database["public"]["Enums"]["business_type"]
          category?: string | null
          cnpj?: string | null
          contact?: Json
          coordinates?: unknown | null
          cover_image_url?: string | null
          created_at?: string | null
          credit_balance?: number | null
          description?: string | null
          features?: Json | null
          gallery_urls?: string[] | null
          id?: string
          is_verified?: boolean | null
          last_active_at?: string | null
          legal_name?: string | null
          logo_url?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          owner_id?: string | null
          service_area_radius?: number | null
          settings?: Json | null
          short_description?: string | null
          slug?: string | null
          social_links?: Json | null
          stats?: Json | null
          status?: string | null
          subcategories?: string[] | null
          suspension_reason?: string | null
          tags?: string[] | null
          total_credits_purchased?: number | null
          total_credits_spent?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verification_documents?: string[] | null
          verification_level?: number | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          call_type: Database["public"]["Enums"]["call_type"]
          caller_id: string | null
          conversation_id: string | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          participants: string[] | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
        }
        Insert: {
          call_type: Database["public"]["Enums"]["call_type"]
          caller_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          participants?: string[] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
        }
        Update: {
          call_type?: Database["public"]["Enums"]["call_type"]
          caller_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          participants?: string[] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          is_hidden: boolean | null
          is_reported: boolean | null
          media_urls: string[] | null
          parent_id: string | null
          post_id: string | null
          stats: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          is_reported?: boolean | null
          media_urls?: string[] | null
          parent_id?: string | null
          post_id?: string | null
          stats?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          is_hidden?: boolean | null
          is_reported?: boolean | null
          media_urls?: string[] | null
          parent_id?: string | null
          post_id?: string | null
          stats?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          avatar_url: string | null
          category: string | null
          city: string | null
          cover_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          id: string
          is_private: boolean | null
          is_verified: boolean | null
          location: string | null
          member_count: number | null
          name: string
          post_count: number | null
          requires_approval: boolean | null
          tags: string[] | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          member_count?: number | null
          name: string
          post_count?: number | null
          requires_approval?: boolean | null
          tags?: string[] | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          member_count?: number | null
          name?: string
          post_count?: number | null
          requires_approval?: boolean | null
          tags?: string[] | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          can_comment: boolean | null
          can_invite: boolean | null
          can_post: boolean | null
          community_id: string | null
          id: string
          joined_at: string | null
          left_at: string | null
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          can_comment?: boolean | null
          can_invite?: boolean | null
          can_post?: boolean | null
          community_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          can_comment?: boolean | null
          can_invite?: boolean | null
          can_post?: boolean | null
          community_id?: string | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_purchases: {
        Row: {
          access_expires_at: string | null
          amount_paid: number
          buyer_id: string | null
          content_id: string | null
          created_at: string | null
          creator_revenue: number
          currency: string | null
          discount_applied: number | null
          download_count: number | null
          id: string
          last_accessed: string | null
          max_downloads: number | null
          original_price: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          platform_fee: number
          platform_fee_percentage: number
          refund_reason: string | null
          refunded_at: string | null
          status: string | null
        }
        Insert: {
          access_expires_at?: string | null
          amount_paid: number
          buyer_id?: string | null
          content_id?: string | null
          created_at?: string | null
          creator_revenue: number
          currency?: string | null
          discount_applied?: number | null
          download_count?: number | null
          id?: string
          last_accessed?: string | null
          max_downloads?: number | null
          original_price: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          platform_fee: number
          platform_fee_percentage: number
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string | null
        }
        Update: {
          access_expires_at?: string | null
          amount_paid?: number
          buyer_id?: string | null
          content_id?: string | null
          created_at?: string | null
          creator_revenue?: number
          currency?: string | null
          discount_applied?: number | null
          download_count?: number | null
          id?: string
          last_accessed?: string | null
          max_downloads?: number | null
          original_price?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          platform_fee?: number
          platform_fee_percentage?: number
          refund_reason?: string | null
          refunded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_purchases_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "paid_content"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          buyer_id: string | null
          comment: string | null
          content_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_hidden: boolean | null
          is_verified_purchase: boolean | null
          purchase_id: string | null
          rating: number
          unhelpful_count: number | null
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          comment?: string | null
          content_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_hidden?: boolean | null
          is_verified_purchase?: boolean | null
          purchase_id?: string | null
          rating: number
          unhelpful_count?: number | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          comment?: string | null
          content_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_hidden?: boolean | null
          is_verified_purchase?: boolean | null
          purchase_id?: string | null
          rating?: number
          unhelpful_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "paid_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "content_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string | null
          id: string
          is_admin: boolean | null
          is_muted: boolean | null
          is_pinned: boolean | null
          joined_at: string | null
          last_read_at: string | null
          last_read_message_id: string | null
          left_at: string | null
          notifications_enabled: boolean | null
          role: string | null
          status: string | null
          unread_count: number | null
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          left_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          status?: string | null
          unread_count?: number | null
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          left_at?: string | null
          notifications_enabled?: boolean | null
          role?: string | null
          status?: string | null
          unread_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_last_read_message_id_fkey"
            columns: ["last_read_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          group_type: string | null
          id: string
          initiated_by: string | null
          initiated_by_premium: boolean | null
          is_active: boolean | null
          is_archived: boolean | null
          last_message_at: string | null
          last_message_id: string | null
          last_message_preview: string | null
          max_participants: number | null
          message_count: number | null
          name: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          initiated_by?: string | null
          initiated_by_premium?: boolean | null
          is_active?: boolean | null
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          max_participants?: number | null
          message_count?: number | null
          name?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          initiated_by?: string | null
          initiated_by_premium?: boolean | null
          is_active?: boolean | null
          is_archived?: boolean | null
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          max_participants?: number | null
          message_count?: number | null
          name?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_album_photos: {
        Row: {
          album_id: string
          caption: string | null
          couple_id: string
          file_size: number | null
          file_type: string | null
          height: number | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          photo_url: string
          taken_at: string | null
          thumbnail_url: string | null
          uploaded_at: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          album_id: string
          caption?: string | null
          couple_id: string
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photo_url: string
          taken_at?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by: string
          width?: number | null
        }
        Update: {
          album_id?: string
          caption?: string | null
          couple_id?: string
          file_size?: number | null
          file_type?: string | null
          height?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          photo_url?: string
          taken_at?: string | null
          thumbnail_url?: string | null
          uploaded_at?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "couple_shared_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_album_photos_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_album_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_diary_entries: {
        Row: {
          author_id: string
          content: string
          couple_id: string
          created_at: string | null
          date: string
          id: string
          is_private: boolean | null
          mood: string | null
          photos: string[] | null
          title: string
          updated_at: string | null
          visible_to: string | null
        }
        Insert: {
          author_id: string
          content: string
          couple_id: string
          created_at?: string | null
          date: string
          id?: string
          is_private?: boolean | null
          mood?: string | null
          photos?: string[] | null
          title: string
          updated_at?: string | null
          visible_to?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          couple_id?: string
          created_at?: string | null
          date?: string
          id?: string
          is_private?: boolean | null
          mood?: string | null
          photos?: string[] | null
          title?: string
          updated_at?: string | null
          visible_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_diary_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_diary_entries_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_game_sessions: {
        Row: {
          completed_at: string | null
          couple_id: string
          current_round: number | null
          game_data: Json | null
          game_id: string
          id: string
          last_activity_at: string | null
          score_user1: number | null
          score_user2: number | null
          started_at: string | null
          status: string | null
          total_rounds: number | null
        }
        Insert: {
          completed_at?: string | null
          couple_id: string
          current_round?: number | null
          game_data?: Json | null
          game_id: string
          id?: string
          last_activity_at?: string | null
          score_user1?: number | null
          score_user2?: number | null
          started_at?: string | null
          status?: string | null
          total_rounds?: number | null
        }
        Update: {
          completed_at?: string | null
          couple_id?: string
          current_round?: number | null
          game_data?: Json | null
          game_id?: string
          id?: string
          last_activity_at?: string | null
          score_user1?: number | null
          score_user2?: number | null
          started_at?: string | null
          status?: string | null
          total_rounds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_game_sessions_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "couple_games"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_games: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          max_duration_minutes: number | null
          min_duration_minutes: number | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          max_duration_minutes?: number | null
          min_duration_minutes?: number | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          max_duration_minutes?: number | null
          min_duration_minutes?: number | null
          name?: string
        }
        Relationships: []
      }
      couple_invitations: {
        Row: {
          created_at: string | null
          expires_at: string
          from_user_id: string
          id: string
          message: string
          status: string | null
          to_email: string | null
          to_phone: string | null
          to_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          from_user_id: string
          id?: string
          message: string
          status?: string | null
          to_email?: string | null
          to_phone?: string | null
          to_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          from_user_id?: string
          id?: string
          message?: string
          status?: string | null
          to_email?: string | null
          to_phone?: string | null
          to_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_invitations_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_invitations_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_payments: {
        Row: {
          amount: number
          cancelled_at: string | null
          couple_id: string
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payer_user_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id: string | null
          status: string | null
          subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          cancelled_at?: string | null
          couple_id: string
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payer_user_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id?: string | null
          status?: string | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          couple_id?: string
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payer_user_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id?: string | null
          status?: string | null
          subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_payments_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_payments_payer_user_id_fkey"
            columns: ["payer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_settings: {
        Row: {
          allow_partner_posting: boolean | null
          auto_tag_partner: boolean | null
          couple_id: string
          created_at: string | null
          id: string
          notifications: Json | null
          privacy: Json | null
          shared_calendar: boolean | null
          shared_profile: boolean | null
          shared_stats: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_partner_posting?: boolean | null
          auto_tag_partner?: boolean | null
          couple_id: string
          created_at?: string | null
          id?: string
          notifications?: Json | null
          privacy?: Json | null
          shared_calendar?: boolean | null
          shared_profile?: boolean | null
          shared_stats?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_partner_posting?: boolean | null
          auto_tag_partner?: boolean | null
          couple_id?: string
          created_at?: string | null
          id?: string
          notifications?: Json | null
          privacy?: Json | null
          shared_calendar?: boolean | null
          shared_profile?: boolean | null
          shared_stats?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_settings_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: true
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_shared_albums: {
        Row: {
          couple_id: string
          cover_image_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          couple_id: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          couple_id?: string
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_shared_albums_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_shared_albums_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_users: {
        Row: {
          couple_id: string
          id: string
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          couple_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          couple_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_users_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          anniversary_date: string | null
          bio: string | null
          couple_avatar_url: string | null
          couple_cover_url: string | null
          couple_name: string | null
          created_at: string | null
          id: string
          shared_album_id: string | null
          shared_diary_id: string | null
          shared_playlist_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          anniversary_date?: string | null
          bio?: string | null
          couple_avatar_url?: string | null
          couple_cover_url?: string | null
          couple_name?: string | null
          created_at?: string | null
          id?: string
          shared_album_id?: string | null
          shared_diary_id?: string | null
          shared_playlist_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          anniversary_date?: string | null
          bio?: string | null
          couple_avatar_url?: string | null
          couple_cover_url?: string | null
          couple_name?: string | null
          created_at?: string | null
          id?: string
          shared_album_id?: string | null
          shared_diary_id?: string | null
          shared_playlist_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_subscriptions: {
        Row: {
          benefits: Json | null
          billing_period: Database["public"]["Enums"]["billing_period"]
          business_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          creator_id: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          price: number
          status: Database["public"]["Enums"]["subscription_status"] | null
          subscriber_id: string | null
          tier: string
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          billing_period: Database["public"]["Enums"]["billing_period"]
          business_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          price: number
          status?: Database["public"]["Enums"]["subscription_status"] | null
          subscriber_id?: string | null
          tier: string
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          billing_period?: Database["public"]["Enums"]["billing_period"]
          business_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          price?: number
          status?: Database["public"]["Enums"]["subscription_status"] | null
          subscriber_id?: string | null
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_subscriptions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_costs: {
        Row: {
          action_type: string
          category: string
          created_at: string | null
          credit_cost: number
          description: string | null
          id: string
          is_active: boolean | null
          max_purchase: number | null
          min_purchase: number | null
          name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          action_type: string
          category: string
          created_at?: string | null
          credit_cost: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_purchase?: number | null
          min_purchase?: number | null
          name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          category?: string
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_purchase?: number | null
          min_purchase?: number | null
          name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          bonus_credits: number | null
          created_at: string | null
          credits: number
          description: string | null
          display_order: number | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_promotional: boolean | null
          name: string
          price: number
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          bonus_credits?: number | null
          created_at?: string | null
          credits: number
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_promotional?: boolean | null
          name: string
          price: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          bonus_credits?: number | null
          created_at?: string | null
          credits?: number
          description?: string | null
          display_order?: number | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_promotional?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          business_id: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          package_id: string | null
          payment_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          payment_status: string | null
          reference_id: string | null
          reference_type: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          business_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          package_id?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          business_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          package_id?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          payment_status?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_message_counts: {
        Row: {
          count: number | null
          created_at: string | null
          date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string | null
          date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          created_at?: string | null
          date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_message_counts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_matches: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_interaction: string | null
          match_type: string | null
          status: Database["public"]["Enums"]["match_status"] | null
          total_messages: number | null
          unmatch_reason: string | null
          unmatched_at: string | null
          unmatched_by: string | null
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_interaction?: string | null
          match_type?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          total_messages?: number | null
          unmatch_reason?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_interaction?: string | null
          match_type?: string | null
          status?: Database["public"]["Enums"]["match_status"] | null
          total_messages?: number | null
          unmatch_reason?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_matches_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "dating_matches_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_matches_unmatched_by_fkey"
            columns: ["unmatched_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_profiles: {
        Row: {
          bio: string | null
          boost_active: boolean | null
          boost_expires_at: string | null
          created_at: string | null
          current_location: unknown | null
          current_location_name: string | null
          daily_likes_limit: number | null
          daily_likes_used: number | null
          daily_rewinds_limit: number | null
          daily_rewinds_used: number | null
          daily_super_likes_limit: number | null
          daily_super_likes_used: number | null
          id: string
          is_active: boolean | null
          last_active: string | null
          last_limit_reset: string | null
          passport_location: unknown | null
          passport_location_name: string | null
          photo_verified: boolean | null
          photo_verified_at: string | null
          photos: Json | null
          preferences: Json
          prompts: Json | null
          settings: Json | null
          stats: Json | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Insert: {
          bio?: string | null
          boost_active?: boolean | null
          boost_expires_at?: string | null
          created_at?: string | null
          current_location?: unknown | null
          current_location_name?: string | null
          daily_likes_limit?: number | null
          daily_likes_used?: number | null
          daily_rewinds_limit?: number | null
          daily_rewinds_used?: number | null
          daily_super_likes_limit?: number | null
          daily_super_likes_used?: number | null
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          last_limit_reset?: string | null
          passport_location?: unknown | null
          passport_location_name?: string | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          photos?: Json | null
          preferences?: Json
          prompts?: Json | null
          settings?: Json | null
          stats?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Update: {
          bio?: string | null
          boost_active?: boolean | null
          boost_expires_at?: string | null
          created_at?: string | null
          current_location?: unknown | null
          current_location_name?: string | null
          daily_likes_limit?: number | null
          daily_likes_used?: number | null
          daily_rewinds_limit?: number | null
          daily_rewinds_used?: number | null
          daily_super_likes_limit?: number | null
          daily_super_likes_used?: number | null
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          last_limit_reset?: string | null
          passport_location?: unknown | null
          passport_location_name?: string | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          photos?: Json | null
          preferences?: Json
          prompts?: Json | null
          settings?: Json | null
          stats?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_swipes: {
        Row: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at: string | null
          distance_km: number | null
          id: string
          is_match: boolean | null
          match_id: string | null
          matched_at: string | null
          metadata: Json | null
          shown_at: string | null
          swiped_at: string | null
          swiped_id: string | null
          swiper_id: string | null
          swiper_location: unknown | null
          time_to_swipe: number | null
        }
        Insert: {
          action: Database["public"]["Enums"]["swipe_action"]
          created_at?: string | null
          distance_km?: number | null
          id?: string
          is_match?: boolean | null
          match_id?: string | null
          matched_at?: string | null
          metadata?: Json | null
          shown_at?: string | null
          swiped_at?: string | null
          swiped_id?: string | null
          swiper_id?: string | null
          swiper_location?: unknown | null
          time_to_swipe?: number | null
        }
        Update: {
          action?: Database["public"]["Enums"]["swipe_action"]
          created_at?: string | null
          distance_km?: number | null
          id?: string
          is_match?: boolean | null
          match_id?: string | null
          matched_at?: string | null
          metadata?: Json | null
          shown_at?: string | null
          swiped_at?: string | null
          swiped_id?: string | null
          swiper_id?: string | null
          swiper_location?: unknown | null
          time_to_swipe?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_swipes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "dating_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_swipes_swiped_id_fkey"
            columns: ["swiped_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_swipes_swiper_id_fkey"
            columns: ["swiper_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      dating_top_picks: {
        Row: {
          created_at: string | null
          id: string
          is_swiped: boolean | null
          is_viewed: boolean | null
          pick_user_id: string | null
          reasons: string[] | null
          score: number
          swipe_action: Database["public"]["Enums"]["swipe_action"] | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_swiped?: boolean | null
          is_viewed?: boolean | null
          pick_user_id?: string | null
          reasons?: string[] | null
          score: number
          swipe_action?: Database["public"]["Enums"]["swipe_action"] | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_swiped?: boolean | null
          is_viewed?: boolean | null
          pick_user_id?: string | null
          reasons?: string[] | null
          score?: number
          swipe_action?: Database["public"]["Enums"]["swipe_action"] | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dating_top_picks_pick_user_id_fkey"
            columns: ["pick_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dating_top_picks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          event_id: string | null
          guest_count: number | null
          guest_names: string[] | null
          id: string
          joined_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          guest_count?: number | null
          guest_names?: string[] | null
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          guest_count?: number | null
          guest_names?: string[] | null
          id?: string
          joined_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          allows_guests: boolean | null
          category: string | null
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          currency: string | null
          current_participants: number | null
          description: string | null
          end_date: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_online: boolean | null
          is_paid: boolean | null
          latitude: number | null
          location_address: string | null
          location_name: string | null
          longitude: number | null
          max_age: number | null
          max_participants: number | null
          min_age: number | null
          online_link: string | null
          price: number | null
          requires_approval: boolean | null
          start_date: string
          stats: Json | null
          tags: string[] | null
          timezone: string | null
          title: string
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          allows_guests?: boolean | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_age?: number | null
          max_participants?: number | null
          min_age?: number | null
          online_link?: string | null
          price?: number | null
          requires_approval?: boolean | null
          start_date: string
          stats?: Json | null
          tags?: string[] | null
          timezone?: string | null
          title: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          allows_guests?: boolean | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_online?: boolean | null
          is_paid?: boolean | null
          latitude?: number | null
          location_address?: string | null
          location_name?: string | null
          longitude?: number | null
          max_age?: number | null
          max_participants?: number | null
          min_age?: number | null
          online_link?: string | null
          price?: number | null
          requires_approval?: boolean | null
          start_date?: string
          stats?: Json | null
          tags?: string[] | null
          timezone?: string | null
          title?: string
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          expenses: Json | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_final: boolean | null
          metrics: Json | null
          period_end: string
          period_start: string
          report_type: string
          revenue: Json
        }
        Insert: {
          expenses?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_final?: boolean | null
          metrics?: Json | null
          period_end: string
          period_start: string
          report_type: string
          revenue?: Json
        }
        Update: {
          expenses?: Json | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_final?: boolean | null
          metrics?: Json | null
          period_end?: string
          period_start?: string
          report_type?: string
          revenue?: Json
        }
        Relationships: [
          {
            foreignKeyName: "financial_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          friend_id: string | null
          id: string
          status: Database["public"]["Enums"]["friend_status"] | null
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friend_status"] | null
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          friend_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["friend_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string | null
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string | null
          id: string
          message_id: string | null
          reaction: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string | null
          reaction?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string | null
          deleted_at: string | null
          delivered_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          media_duration: number | null
          media_size: number | null
          media_type: string | null
          media_urls: string[] | null
          read_count: number | null
          reply_to: string | null
          reply_to_id: string | null
          sender_id: string | null
          type: Database["public"]["Enums"]["message_type"] | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          media_duration?: number | null
          media_size?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          read_count?: number | null
          reply_to?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          delivered_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          media_duration?: number | null
          media_size?: number | null
          media_type?: string | null
          media_urls?: string[] | null
          read_count?: number | null
          reply_to?: string | null
          reply_to_id?: string | null
          sender_id?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          message: string | null
          read_at: string | null
          recipient_id: string | null
          related_data: Json | null
          sender_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          content?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          recipient_id?: string | null
          related_data?: Json | null
          sender_id?: string | null
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          content?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          icon?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read_at?: string | null
          recipient_id?: string | null
          related_data?: Json | null
          sender_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      paid_content: {
        Row: {
          available_until: string | null
          business_id: string | null
          category: Database["public"]["Enums"]["content_category"]
          content_type: Database["public"]["Enums"]["paid_content_type"]
          content_urls: string[]
          created_at: string | null
          creator_id: string | null
          currency: string | null
          description: string | null
          dimensions: Json | null
          discount_percentage: number | null
          discount_valid_until: string | null
          duration: number | null
          file_sizes: number[] | null
          id: string
          is_adult: boolean | null
          is_exclusive: boolean | null
          item_count: number | null
          likes_count: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          original_price: number | null
          preview_type: string | null
          preview_urls: string[]
          price: number
          promo_code: string | null
          published_at: string | null
          rating_average: number | null
          rating_count: number | null
          rejection_reason: string | null
          sales_count: number | null
          settings: Json | null
          slug: string | null
          status: Database["public"]["Enums"]["content_status"] | null
          stock_limit: number | null
          stock_sold: number | null
          subcategory: string | null
          tags: string[] | null
          title: string
          total_revenue: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          available_until?: string | null
          business_id?: string | null
          category: Database["public"]["Enums"]["content_category"]
          content_type: Database["public"]["Enums"]["paid_content_type"]
          content_urls: string[]
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          discount_valid_until?: string | null
          duration?: number | null
          file_sizes?: number[] | null
          id?: string
          is_adult?: boolean | null
          is_exclusive?: boolean | null
          item_count?: number | null
          likes_count?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          original_price?: number | null
          preview_type?: string | null
          preview_urls: string[]
          price: number
          promo_code?: string | null
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          rejection_reason?: string | null
          sales_count?: number | null
          settings?: Json | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          stock_limit?: number | null
          stock_sold?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          total_revenue?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          available_until?: string | null
          business_id?: string | null
          category?: Database["public"]["Enums"]["content_category"]
          content_type?: Database["public"]["Enums"]["paid_content_type"]
          content_urls?: string[]
          created_at?: string | null
          creator_id?: string | null
          currency?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percentage?: number | null
          discount_valid_until?: string | null
          duration?: number | null
          file_sizes?: number[] | null
          id?: string
          is_adult?: boolean | null
          is_exclusive?: boolean | null
          item_count?: number | null
          likes_count?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          original_price?: number | null
          preview_type?: string | null
          preview_urls?: string[]
          price?: number
          promo_code?: string | null
          published_at?: string | null
          rating_average?: number | null
          rating_count?: number | null
          rejection_reason?: string | null
          sales_count?: number | null
          settings?: Json | null
          slug?: string | null
          status?: Database["public"]["Enums"]["content_status"] | null
          stock_limit?: number | null
          stock_sold?: number | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          total_revenue?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "paid_content_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paid_content_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id: string | null
          status: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          status: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_payment_id?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_ids: number[]
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_ids: number[]
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          option_ids?: number[]
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allows_multiple: boolean | null
          created_at: string | null
          creator_id: string | null
          expires_at: string | null
          id: string
          max_options: number | null
          options: Json
          question: string
        }
        Insert: {
          allows_multiple?: boolean | null
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          id?: string
          max_options?: number | null
          options: Json
          question: string
        }
        Update: {
          allows_multiple?: boolean | null
          created_at?: string | null
          creator_id?: string | null
          expires_at?: string | null
          id?: string
          max_options?: number | null
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string | null
          duration: number | null
          file_size: number | null
          id: string
          post_id: string
          thumbnail_url: string | null
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          post_id: string
          thumbnail_url?: string | null
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          post_id?: string
          thumbnail_url?: string | null
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          reaction_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          reaction_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          reaction_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_saves: {
        Row: {
          collection_id: string | null
          created_at: string | null
          id: string
          post_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string | null
          id?: string
          post_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_saves_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "saved_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_saves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_shares: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          post_id: string
          share_type: string
          shared_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          post_id: string
          share_type?: string
          shared_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          post_id?: string
          share_type?: string
          shared_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "post_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          angry_count: number | null
          audio_duration: number | null
          comments_count: number | null
          content: string | null
          couple_id: string | null
          created_at: string | null
          event_id: string | null
          hashtags: string[] | null
          id: string
          is_event: boolean | null
          is_hidden: boolean | null
          is_premium_content: boolean | null
          is_reported: boolean | null
          latitude: number | null
          laugh_count: number | null
          like_count: number | null
          likes_count: number | null
          location: string | null
          longitude: number | null
          love_count: number | null
          media_thumbnails: string[] | null
          media_types: string[] | null
          media_urls: string[] | null
          mentions: string[] | null
          poll_expires_at: string | null
          poll_id: string | null
          poll_options: string[] | null
          poll_question: string | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          price: number | null
          report_count: number | null
          sad_count: number | null
          saves_count: number | null
          shares_count: number | null
          stats: Json | null
          story_expires_at: string | null
          updated_at: string | null
          user_id: string | null
          visibility: Database["public"]["Enums"]["visibility_type"] | null
          wow_count: number | null
        }
        Insert: {
          angry_count?: number | null
          audio_duration?: number | null
          comments_count?: number | null
          content?: string | null
          couple_id?: string | null
          created_at?: string | null
          event_id?: string | null
          hashtags?: string[] | null
          id?: string
          is_event?: boolean | null
          is_hidden?: boolean | null
          is_premium_content?: boolean | null
          is_reported?: boolean | null
          latitude?: number | null
          laugh_count?: number | null
          like_count?: number | null
          likes_count?: number | null
          location?: string | null
          longitude?: number | null
          love_count?: number | null
          media_thumbnails?: string[] | null
          media_types?: string[] | null
          media_urls?: string[] | null
          mentions?: string[] | null
          poll_expires_at?: string | null
          poll_id?: string | null
          poll_options?: string[] | null
          poll_question?: string | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          price?: number | null
          report_count?: number | null
          sad_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          stats?: Json | null
          story_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          wow_count?: number | null
        }
        Update: {
          angry_count?: number | null
          audio_duration?: number | null
          comments_count?: number | null
          content?: string | null
          couple_id?: string | null
          created_at?: string | null
          event_id?: string | null
          hashtags?: string[] | null
          id?: string
          is_event?: boolean | null
          is_hidden?: boolean | null
          is_premium_content?: boolean | null
          is_reported?: boolean | null
          latitude?: number | null
          laugh_count?: number | null
          like_count?: number | null
          likes_count?: number | null
          location?: string | null
          longitude?: number | null
          love_count?: number | null
          media_thumbnails?: string[] | null
          media_types?: string[] | null
          media_urls?: string[] | null
          mentions?: string[] | null
          poll_expires_at?: string | null
          poll_id?: string | null
          poll_options?: string[] | null
          poll_question?: string | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          price?: number | null
          report_count?: number | null
          sad_count?: number | null
          saves_count?: number | null
          shares_count?: number | null
          stats?: Json | null
          story_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
          wow_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["poll_id"]
          },
          {
            foreignKeyName: "posts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_seals: {
        Row: {
          available_until: string | null
          category: string | null
          color_hex: string | null
          created_at: string | null
          credit_cost: number
          description: string | null
          display_order: number | null
          icon_url: string
          id: string
          is_available: boolean | null
          name: string
          rarity: string | null
          times_gifted: number | null
        }
        Insert: {
          available_until?: string | null
          category?: string | null
          color_hex?: string | null
          created_at?: string | null
          credit_cost: number
          description?: string | null
          display_order?: number | null
          icon_url: string
          id?: string
          is_available?: boolean | null
          name: string
          rarity?: string | null
          times_gifted?: number | null
        }
        Update: {
          available_until?: string | null
          category?: string | null
          color_hex?: string | null
          created_at?: string | null
          credit_cost?: number
          description?: string | null
          display_order?: number | null
          icon_url?: string
          id?: string
          is_available?: boolean | null
          name?: string
          rarity?: string | null
          times_gifted?: number | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          anonymous: boolean | null
          created_at: string | null
          id: string
          view_source: string | null
          viewed_id: string | null
          viewer_id: string | null
        }
        Insert: {
          anonymous?: boolean | null
          created_at?: string | null
          id?: string
          view_source?: string | null
          viewed_id?: string | null
          viewer_id?: string | null
        }
        Update: {
          anonymous?: boolean | null
          created_at?: string | null
          id?: string
          view_source?: string | null
          viewed_id?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_id_fkey"
            columns: ["viewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          posts_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          posts_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          collection_id: string | null
          created_at: string | null
          folder_name: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          collection_id?: string | null
          created_at?: string | null
          folder_name?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          collection_id?: string | null
          created_at?: string | null
          folder_name?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "saved_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["post_id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          boost_credits_spent: number | null
          boost_expires_at: string | null
          boost_impressions: number | null
          caption: string | null
          created_at: string | null
          deleted_at: string | null
          duration: number | null
          expires_at: string | null
          file_size: number | null
          height: number | null
          highlight_color: string | null
          id: string
          is_boosted: boolean | null
          is_highlighted: boolean | null
          is_public: boolean | null
          media_type: string
          media_url: string
          reaction_count: number | null
          reply_count: number | null
          status: Database["public"]["Enums"]["story_status"] | null
          thumbnail_url: string | null
          unique_view_count: number | null
          user_id: string | null
          view_count: number | null
          width: number | null
        }
        Insert: {
          boost_credits_spent?: number | null
          boost_expires_at?: string | null
          boost_impressions?: number | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_size?: number | null
          height?: number | null
          highlight_color?: string | null
          id?: string
          is_boosted?: boolean | null
          is_highlighted?: boolean | null
          is_public?: boolean | null
          media_type: string
          media_url: string
          reaction_count?: number | null
          reply_count?: number | null
          status?: Database["public"]["Enums"]["story_status"] | null
          thumbnail_url?: string | null
          unique_view_count?: number | null
          user_id?: string | null
          view_count?: number | null
          width?: number | null
        }
        Update: {
          boost_credits_spent?: number | null
          boost_expires_at?: string | null
          boost_impressions?: number | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration?: number | null
          expires_at?: string | null
          file_size?: number | null
          height?: number | null
          highlight_color?: string | null
          id?: string
          is_boosted?: boolean | null
          is_highlighted?: boolean | null
          is_public?: boolean | null
          media_type?: string
          media_url?: string
          reaction_count?: number | null
          reply_count?: number | null
          status?: Database["public"]["Enums"]["story_status"] | null
          thumbnail_url?: string | null
          unique_view_count?: number | null
          user_id?: string | null
          view_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_boosts: {
        Row: {
          boost_duration_hours: number
          clicks_gained: number | null
          created_at: string | null
          credits_spent: number
          expires_at: string
          id: string
          impressions_gained: number | null
          is_active: boolean | null
          priority_score: number | null
          profile_visits_gained: number | null
          story_id: string | null
          user_id: string | null
        }
        Insert: {
          boost_duration_hours?: number
          clicks_gained?: number | null
          created_at?: string | null
          credits_spent: number
          expires_at: string
          id?: string
          impressions_gained?: number | null
          is_active?: boolean | null
          priority_score?: number | null
          profile_visits_gained?: number | null
          story_id?: string | null
          user_id?: string | null
        }
        Update: {
          boost_duration_hours?: number
          clicks_gained?: number | null
          created_at?: string | null
          credits_spent?: number
          expires_at?: string
          id?: string
          impressions_gained?: number | null
          is_active?: boolean | null
          priority_score?: number | null
          profile_visits_gained?: number | null
          story_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_boosts_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_daily_limits: {
        Row: {
          created_at: string | null
          daily_limit: number
          id: string
          last_reset_date: string | null
          stories_posted_today: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          daily_limit: number
          id?: string
          last_reset_date?: string | null
          stories_posted_today?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          daily_limit?: number
          id?: string
          last_reset_date?: string | null
          stories_posted_today?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_daily_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_replies: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          media_type: string | null
          media_url: string | null
          message: string
          read_at: string | null
          sender_id: string | null
          story_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message: string
          read_at?: string | null
          sender_id?: string | null
          story_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          media_type?: string | null
          media_url?: string | null
          message?: string
          read_at?: string | null
          sender_id?: string | null
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_replies_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_replies_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          completion_rate: number | null
          device_type: string | null
          id: string
          ip_address: unknown | null
          reacted_at: string | null
          reaction: Database["public"]["Enums"]["story_reaction"] | null
          story_id: string | null
          view_duration: number | null
          viewed_at: string | null
          viewer_id: string | null
          viewer_type: Database["public"]["Enums"]["story_viewer_type"] | null
        }
        Insert: {
          completion_rate?: number | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          reacted_at?: string | null
          reaction?: Database["public"]["Enums"]["story_reaction"] | null
          story_id?: string | null
          view_duration?: number | null
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_type?: Database["public"]["Enums"]["story_viewer_type"] | null
        }
        Update: {
          completion_rate?: number | null
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          reacted_at?: string | null
          reaction?: Database["public"]["Enums"]["story_reaction"] | null
          story_id?: string | null
          view_duration?: number | null
          viewed_at?: string | null
          viewer_id?: string | null
          viewer_type?: Database["public"]["Enums"]["story_viewer_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period"]
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          discount_percentage: number | null
          final_amount: number
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          plan_type: Database["public"]["Enums"]["premium_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_period: Database["public"]["Enums"]["billing_period"]
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_percentage?: number | null
          final_amount: number
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          plan_type: Database["public"]["Enums"]["premium_type"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_period?: Database["public"]["Enums"]["billing_period"]
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          discount_percentage?: number | null
          final_amount?: number
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          plan_type?: Database["public"]["Enums"]["premium_type"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trending_boosts: {
        Row: {
          boost_type: string
          created_at: string | null
          credits_spent: number
          duration_hours: number
          expires_at: string
          id: string
          impressions_gained: number | null
          interactions_gained: number | null
          is_active: boolean | null
          priority_score: number | null
          user_id: string | null
        }
        Insert: {
          boost_type: string
          created_at?: string | null
          credits_spent: number
          duration_hours: number
          expires_at: string
          id?: string
          impressions_gained?: number | null
          interactions_gained?: number | null
          is_active?: boolean | null
          priority_score?: number | null
          user_id?: string | null
        }
        Update: {
          boost_type?: string
          created_at?: string | null
          credits_spent?: number
          duration_hours?: number
          expires_at?: string
          id?: string
          impressions_gained?: number | null
          interactions_gained?: number | null
          is_active?: boolean | null
          priority_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_boosts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          conversation_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_summaries"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string | null
          description: string
          id: string
          other_user_id: string | null
          payment_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_reference: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          description: string
          id?: string
          other_user_id?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          description?: string
          id?: string
          other_user_id?: string | null
          payment_amount?: number | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_reference?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_credit_transactions_other_user_id_fkey"
            columns: ["other_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string | null
          credit_balance: number | null
          id: string
          total_gifted: number | null
          total_purchased: number | null
          total_received: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_balance?: number | null
          id?: string
          total_gifted?: number | null
          total_purchased?: number | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_balance?: number | null
          id?: string
          total_gifted?: number | null
          total_purchased?: number | null
          total_received?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile_seals: {
        Row: {
          created_at: string | null
          display_order: number | null
          expires_at: string | null
          gifter_id: string | null
          id: string
          is_displayed: boolean | null
          message: string | null
          recipient_id: string | null
          seal_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          gifter_id?: string | null
          id?: string
          is_displayed?: boolean | null
          message?: string | null
          recipient_id?: string | null
          seal_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          expires_at?: string | null
          gifter_id?: string | null
          id?: string
          is_displayed?: boolean | null
          message?: string | null
          recipient_id?: string | null
          seal_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_seals_gifter_id_fkey"
            columns: ["gifter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_seals_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_seals_seal_id_fkey"
            columns: ["seal_id"]
            isOneToOne: false
            referencedRelation: "profile_seals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_seals_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          birth_date: string
          cpf: string
          created_at: string | null
          document_back_url: string | null
          document_front_url: string
          document_number: string
          document_type: string
          face_scan_data: Json | null
          full_name: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          selfie_url: string
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
          verification_score: number | null
        }
        Insert: {
          birth_date: string
          cpf: string
          created_at?: string | null
          document_back_url?: string | null
          document_front_url: string
          document_number: string
          document_type: string
          face_scan_data?: Json | null
          full_name: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url: string
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
          verification_score?: number | null
        }
        Update: {
          birth_date?: string
          cpf?: string
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string
          document_number?: string
          document_type?: string
          face_scan_data?: Json | null
          full_name?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          selfie_url?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verification_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          abacatepay_customer_id: string | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          admin_id: string | null
          auth_id: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          business_id: string | null
          city: string | null
          country: string | null
          couple_id: string | null
          cover_url: string | null
          created_at: string | null
          daily_message_limit: number | null
          daily_messages_sent: number | null
          email: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          interests: string[] | null
          is_active: boolean | null
          is_in_couple: boolean | null
          is_verified: boolean | null
          last_active_at: string | null
          latitude: number | null
          longitude: number | null
          looking_for: string[] | null
          monthly_events_created: number | null
          monthly_photo_limit: number | null
          monthly_photos_uploaded: number | null
          monthly_video_limit: number | null
          monthly_videos_uploaded: number | null
          name: string | null
          notification_settings: Json | null
          premium_expires_at: string | null
          premium_status: Database["public"]["Enums"]["premium_status"] | null
          premium_type: Database["public"]["Enums"]["premium_type"] | null
          privacy_settings: Json | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          relationship_goals: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          stats: Json | null
          status: Database["public"]["Enums"]["user_status"] | null
          stripe_customer_id: string | null
          uf: string | null
          updated_at: string | null
          username: string
          verified_at: string | null
          website: string | null
        }
        Insert: {
          abacatepay_customer_id?: string | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          admin_id?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          couple_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          daily_message_limit?: number | null
          daily_messages_sent?: number | null
          email: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_in_couple?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          monthly_events_created?: number | null
          monthly_photo_limit?: number | null
          monthly_photos_uploaded?: number | null
          monthly_video_limit?: number | null
          monthly_videos_uploaded?: number | null
          name?: string | null
          notification_settings?: Json | null
          premium_expires_at?: string | null
          premium_status?: Database["public"]["Enums"]["premium_status"] | null
          premium_type?: Database["public"]["Enums"]["premium_type"] | null
          privacy_settings?: Json | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          relationship_goals?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          stripe_customer_id?: string | null
          uf?: string | null
          updated_at?: string | null
          username: string
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          abacatepay_customer_id?: string | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          admin_id?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          business_id?: string | null
          city?: string | null
          country?: string | null
          couple_id?: string | null
          cover_url?: string | null
          created_at?: string | null
          daily_message_limit?: number | null
          daily_messages_sent?: number | null
          email?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          interests?: string[] | null
          is_active?: boolean | null
          is_in_couple?: boolean | null
          is_verified?: boolean | null
          last_active_at?: string | null
          latitude?: number | null
          longitude?: number | null
          looking_for?: string[] | null
          monthly_events_created?: number | null
          monthly_photo_limit?: number | null
          monthly_photos_uploaded?: number | null
          monthly_video_limit?: number | null
          monthly_videos_uploaded?: number | null
          name?: string | null
          notification_settings?: Json | null
          premium_expires_at?: string | null
          premium_status?: Database["public"]["Enums"]["premium_status"] | null
          premium_type?: Database["public"]["Enums"]["premium_type"] | null
          privacy_settings?: Json | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          relationship_goals?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["user_status"] | null
          stripe_customer_id?: string | null
          uf?: string | null
          updated_at?: string | null
          username?: string
          verified_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_business"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          document_back_url: string | null
          document_front_url: string | null
          document_type: string | null
          id: string
          notes: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string | null
          user_id: string | null
          verification_code: string | null
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_type?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          document_back_url?: string | null
          document_front_url?: string | null
          document_type?: string | null
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          user_id?: string | null
          verification_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      conversation_summaries: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          group_type: string | null
          last_message_at: string | null
          message_count: number | null
          name: string | null
          participant_count: number | null
          type: string | null
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string | null
          poll_id: string | null
          text: string | null
          votes_count: number | null
        }
        Relationships: []
      }
      post_polls: {
        Row: {
          allows_multiple: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          max_options: number | null
          options: Json | null
          post_id: string | null
          question: string | null
          total_votes: number | null
          user_votes: number[] | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_at: string | null
          blocked_id: string | null
          blocker_id: string | null
          created_at: string | null
          id: string | null
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string | null
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          blocked_id?: string | null
          blocker_id?: string | null
          created_at?: string | null
          id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      are_users_friends: {
        Args: { user1_id: string; user2_id: string }
        Returns: boolean
      }
      calculate_content_commission: {
        Args: {
          p_creator_id: string
          p_amount: number
          p_content_type: Database["public"]["Enums"]["paid_content_type"]
        }
        Returns: {
          platform_fee: number
          creator_revenue: number
        }[]
      }
      can_upload_media: {
        Args: { user_id: string; media_type: string }
        Returns: boolean
      }
      check_messaging_index_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          index_name: string
          index_scans: number
          tuples_read: number
          tuples_fetched: number
          usage_ratio: number
        }[]
      }
      check_user_can_upload: {
        Args: { p_user_id: string; p_media_type: string }
        Returns: boolean
      }
      cleanup_expired_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_read_receipts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_orphaned_message_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          orphaned_reads_deleted: number
          orphaned_participants_deleted: number
          empty_conversations_deleted: number
        }[]
      }
      create_conversation_for_match: {
        Args: { match_id: string }
        Returns: string
      }
      create_notification: {
        Args: {
          p_recipient_id: string
          p_sender_id: string
          p_type: string
          p_title: string
          p_content: string
          p_entity_id?: string
          p_entity_type?: string
          p_metadata?: Json
        }
        Returns: {
          action_url: string | null
          content: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          icon: string | null
          id: string
          is_read: boolean | null
          message: string | null
          read_at: string | null
          recipient_id: string | null
          related_data: Json | null
          sender_id: string | null
          title: string
          type: string
        }
      }
      decrement_collection_posts: {
        Args: { collection_id: string }
        Returns: undefined
      }
      decrement_post_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      decrement_post_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      decrement_post_saves: {
        Args: { post_id: string }
        Returns: undefined
      }
      decrement_post_shares: {
        Args: { post_id: string }
        Returns: undefined
      }
      get_average_messages_per_conversation: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg: number
        }[]
      }
      get_average_participants_per_conversation: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg: number
        }[]
      }
      get_conversation_metadata: {
        Args: { p_conversation_id: string }
        Returns: {
          participant_count: number
          message_count: number
          last_message_at: string
          created_at: string
        }[]
      }
      get_direct_conversation: {
        Args: { user1_id: string; user2_id: string }
        Returns: {
          conversation_id: string
          conversation_type: Database["public"]["Enums"]["conversation_type"]
          created_at: string
          updated_at: string
          initiated_by: string
          initiated_by_premium: boolean
        }[]
      }
      get_friendship_status: {
        Args: { user1_id: string; user2_id: string }
        Returns: string
      }
      get_last_message: {
        Args: { p_conversation_id: string }
        Returns: {
          id: string
          content: string
          sender_id: string
          created_at: string
          message_type: Database["public"]["Enums"]["message_type"]
        }[]
      }
      get_message_delivery_stats: {
        Args: { p_period?: unknown }
        Returns: {
          total_sent: number
          total_delivered: number
          total_read: number
          delivery_rate: number
          read_rate: number
          avg_time_to_read: unknown
        }[]
      }
      get_messaging_stats: {
        Args: { p_period?: unknown }
        Returns: {
          total_messages: number
          total_conversations: number
          active_users: number
          messages_in_period: number
          new_conversations_in_period: number
          average_response_time: unknown
        }[]
      }
      get_poll_with_stats: {
        Args: { poll_id_param: string }
        Returns: {
          id: string
          question: string
          options: Json
          total_votes: number
          expires_at: string
          multiple_choice: boolean
          user_has_voted: boolean
          user_votes: number[]
        }[]
      }
      get_posts_with_interactions: {
        Args: {
          p_user_id?: string
          p_limit?: number
          p_offset?: number
          p_following_only?: boolean
        }
        Returns: {
          id: string
          user_id: string
          content: string
          visibility: string
          location: string
          media_urls: string[]
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
          shares_count: number
          saves_count: number
          is_liked: boolean
          is_saved: boolean
          user_data: Json
          recent_likes: Json
          recent_comments: Json
        }[]
      }
      get_slow_message_queries: {
        Args: Record<PropertyKey, never>
        Returns: {
          query: string
          calls: number
          mean_time: number
          total_time: number
        }[]
      }
      get_unread_count: {
        Args: { p_user_id: string; p_conversation_id: string }
        Returns: number
      }
      get_user_conversations: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          conversation_id: string
          conversation_type: Database["public"]["Enums"]["conversation_type"]
          conversation_name: string
          last_message_id: string
          last_message_content: string
          last_message_at: string
          last_message_sender: string
          unread_count: number
          participant_count: number
          created_at: string
          updated_at: string
        }[]
      }
      get_user_friends: {
        Args: { target_user_id: string }
        Returns: {
          friend_id: string
          username: string
          name: string
          avatar_url: string
          is_verified: boolean
          premium_type: string
          accepted_at: string
        }[]
      }
      get_user_message_activity: {
        Args: { p_user_id: string; p_period?: unknown }
        Returns: {
          messages_sent: number
          messages_received: number
          conversations_active: number
          avg_messages_per_day: number
          most_active_hour: number
          response_time_avg: unknown
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      immutable_date_extract: {
        Args: { "": string }
        Returns: string
      }
      increment_collection_posts: {
        Args: { collection_id: string }
        Returns: undefined
      }
      increment_post_comments: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_post_likes: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_post_saves: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_post_shares: {
        Args: { post_id: string }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      reset_daily_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      safe_array_length: {
        Args: { arr: unknown }
        Returns: number
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      set_typing_indicator: {
        Args: {
          p_conversation_id: string
          p_user_id: string
          p_is_typing: boolean
        }
        Returns: undefined
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_post_reaction_counts: {
        Args: { p_post_id: string }
        Returns: undefined
      }
      validate_message_permission: {
        Args: { p_user_id: string; p_conversation_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_type: "personal" | "business"
      ad_format: "timeline" | "sidebar" | "story" | "popup" | "native"
      ad_status:
        | "pending"
        | "active"
        | "paused"
        | "completed"
        | "rejected"
        | "draft"
      admin_action_type:
        | "view"
        | "create"
        | "update"
        | "delete"
        | "ban"
        | "unban"
        | "verify"
        | "reject"
        | "refund"
      admin_department:
        | "financial"
        | "moderation"
        | "support"
        | "marketing"
        | "technical"
        | "management"
      billing_period:
        | "monthly"
        | "quarterly"
        | "semiannual"
        | "annual"
        | "trial"
      business_type:
        | "venue"
        | "content_creator"
        | "service_provider"
        | "event_organizer"
        | "brand"
        | "influencer"
      call_status: "ringing" | "connected" | "ended" | "missed" | "declined"
      call_type: "voice" | "video"
      campaign_objective:
        | "awareness"
        | "traffic"
        | "conversion"
        | "engagement"
        | "app_installs"
      content_category:
        | "artistic"
        | "sensual"
        | "fitness"
        | "lifestyle"
        | "educational"
        | "entertainment"
      content_status: "draft" | "active" | "paused" | "archived" | "removed"
      conversation_type: "private" | "group" | "direct"
      credit_transaction_type: "purchase" | "spend" | "refund" | "bonus"
      event_type: "social" | "cultural" | "sports" | "educational" | "online"
      friend_status: "pending" | "accepted" | "blocked" | "declined"
      gender_type:
        | "couple"
        | "couple_female"
        | "couple_male"
        | "male"
        | "male_trans"
        | "female"
        | "female_trans"
        | "travesti"
        | "crossdressing"
      match_status: "active" | "expired" | "unmatched"
      media_type: "image" | "video" | "audio"
      message_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "file"
        | "location"
        | "contact"
        | "system"
      paid_content_type: "photo" | "video" | "album" | "live"
      payment_method: "credit_card" | "pix"
      payment_provider: "stripe" | "abacatepay"
      post_type: "regular" | "story" | "event"
      premium_status: "active" | "inactive" | "cancelled" | "pending" | "trial"
      premium_type: "free" | "gold" | "diamond" | "couple"
      profile_type: "single" | "couple" | "trans" | "other"
      story_reaction: "like" | "love" | "fire" | "wow" | "sad" | "angry"
      story_status: "active" | "expired" | "deleted"
      story_viewer_type: "regular" | "anonymous"
      subscription_status:
        | "active"
        | "cancelled"
        | "expired"
        | "trial"
        | "pending"
      swipe_action: "like" | "super_like" | "pass"
      transaction_type: "purchase" | "spend" | "refund" | "bonus" | "commission"
      user_role: "user" | "moderator" | "admin"
      user_status:
        | "active"
        | "suspended"
        | "banned"
        | "deactivated"
        | "pending_verification"
      verification_status: "pending" | "approved" | "rejected" | "expired"
      visibility_type: "public" | "friends" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_type: ["personal", "business"],
      ad_format: ["timeline", "sidebar", "story", "popup", "native"],
      ad_status: [
        "pending",
        "active",
        "paused",
        "completed",
        "rejected",
        "draft",
      ],
      admin_action_type: [
        "view",
        "create",
        "update",
        "delete",
        "ban",
        "unban",
        "verify",
        "reject",
        "refund",
      ],
      admin_department: [
        "financial",
        "moderation",
        "support",
        "marketing",
        "technical",
        "management",
      ],
      billing_period: ["monthly", "quarterly", "semiannual", "annual", "trial"],
      business_type: [
        "venue",
        "content_creator",
        "service_provider",
        "event_organizer",
        "brand",
        "influencer",
      ],
      call_status: ["ringing", "connected", "ended", "missed", "declined"],
      call_type: ["voice", "video"],
      campaign_objective: [
        "awareness",
        "traffic",
        "conversion",
        "engagement",
        "app_installs",
      ],
      content_category: [
        "artistic",
        "sensual",
        "fitness",
        "lifestyle",
        "educational",
        "entertainment",
      ],
      content_status: ["draft", "active", "paused", "archived", "removed"],
      conversation_type: ["private", "group", "direct"],
      credit_transaction_type: ["purchase", "spend", "refund", "bonus"],
      event_type: ["social", "cultural", "sports", "educational", "online"],
      friend_status: ["pending", "accepted", "blocked", "declined"],
      gender_type: [
        "couple",
        "couple_female",
        "couple_male",
        "male",
        "male_trans",
        "female",
        "female_trans",
        "travesti",
        "crossdressing",
      ],
      match_status: ["active", "expired", "unmatched"],
      media_type: ["image", "video", "audio"],
      message_type: [
        "text",
        "image",
        "video",
        "audio",
        "file",
        "location",
        "contact",
        "system",
      ],
      paid_content_type: ["photo", "video", "album", "live"],
      payment_method: ["credit_card", "pix"],
      payment_provider: ["stripe", "abacatepay"],
      post_type: ["regular", "story", "event"],
      premium_status: ["active", "inactive", "cancelled", "pending", "trial"],
      premium_type: ["free", "gold", "diamond", "couple"],
      profile_type: ["single", "couple", "trans", "other"],
      story_reaction: ["like", "love", "fire", "wow", "sad", "angry"],
      story_status: ["active", "expired", "deleted"],
      story_viewer_type: ["regular", "anonymous"],
      subscription_status: [
        "active",
        "cancelled",
        "expired",
        "trial",
        "pending",
      ],
      swipe_action: ["like", "super_like", "pass"],
      transaction_type: ["purchase", "spend", "refund", "bonus", "commission"],
      user_role: ["user", "moderator", "admin"],
      user_status: [
        "active",
        "suspended",
        "banned",
        "deactivated",
        "pending_verification",
      ],
      verification_status: ["pending", "approved", "rejected", "expired"],
      visibility_type: ["public", "friends", "private"],
    },
  },
} as const
