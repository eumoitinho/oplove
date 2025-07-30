import { createClient } from '@/app/lib/supabase-browser'
import type { 
  BusinessProfile, 
  CreateBusinessRequest, 
  UpdateBusinessRequest,
  CreditPackage,
  CreditTransaction,
  PurchaseCreditsRequest,
  AdCampaign,
  CreateCampaignRequest,
  BusinessAd,
  CreateAdRequest,
  BusinessDashboard,
  ContentCreatorDashboard,
  VenueDashboard
} from '@/types/business.types'

class BusinessService {
  private supabase = createClient()

  /**
   * Create a new business profile
   */
  async createBusiness(data: CreateBusinessRequest): Promise<{ data: BusinessProfile | null; error: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get user's ID from users table
      const { data: userData } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!userData) throw new Error('User not found')

      // Create business profile
      const { data: business, error } = await this.supabase
        .from('businesses')
        .insert({
          owner_id: userData.id,
          ...data,
          // Default settings
          settings: {
            notifications: true,
            auto_reply: false,
            show_in_search: true,
            allow_reviews: true
          },
          features: {
            can_sell_content: data.business_type === 'content_creator',
            can_create_events: ['venue', 'event_organizer'].includes(data.business_type),
            can_advertise: true,
            can_have_store: ['brand', 'content_creator'].includes(data.business_type),
            max_products: 0,
            max_events_per_month: 10,
            commission_rate: 0.20
          },
          stats: {
            total_followers: 0,
            total_views: 0,
            average_rating: 0,
            total_reviews: 0,
            total_sales: 0
          }
        })
        .select()
        .single()

      if (error) throw error

      // Update user's account type
      await this.supabase
        .from('users')
        .update({
          account_type: 'business',
          business_id: business.id
        })
        .eq('id', userData.id)

      return { data: business, error: null }
    } catch (error) {
      console.error('Error creating business:', error)
      return { data: null, error }
    }
  }

  /**
   * Get business profile by ID
   */
  async getBusiness(businessId: string): Promise<{ data: BusinessProfile | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get current user's business profile
   */
  async getMyBusiness(): Promise<{ data: BusinessProfile | null; error: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userData } = await this.supabase
        .from('users')
        .select('business_id')
        .eq('id', user.id)
        .single()

      if (!userData?.business_id) {
        return { data: null, error: 'No business profile found' }
      }

      return this.getBusiness(userData.business_id)
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Update business profile
   */
  async updateBusiness(businessId: string, data: UpdateBusinessRequest): Promise<{ data: BusinessProfile | null; error: any }> {
    try {
      const { data: business, error } = await this.supabase
        .from('businesses')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)
        .select()
        .single()

      if (error) throw error
      return { data: business, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get available credit packages
   */
  async getCreditPackages(): Promise<{ data: CreditPackage[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Purchase credits
   */
  async purchaseCredits(request: PurchaseCreditsRequest): Promise<{ data: any; error: any }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get business
      const { data: business, error: businessError } = await this.getMyBusiness()
      if (businessError || !business) throw new Error('Business not found')

      // Get package details
      const { data: creditPackage } = await this.supabase
        .from('credit_packages')
        .select('*')
        .eq('id', request.package_id)
        .single()

      if (!creditPackage) throw new Error('Package not found')

      // Create payment based on method
      let paymentResult
      if (request.payment_method === 'pix') {
        paymentResult = await this.createPixPayment(creditPackage, request.payment_data)
      } else {
        paymentResult = await this.createCardPayment(creditPackage, request.payment_data)
      }

      if (paymentResult.error) throw paymentResult.error

      // Record transaction (will be confirmed by webhook)
      const { data: transaction } = await this.supabase
        .from('credit_transactions')
        .insert({
          business_id: business.id,
          type: 'purchase',
          amount: creditPackage.credits + creditPackage.bonus_credits,
          balance_before: business.credit_balance,
          balance_after: business.credit_balance, // Will be updated by webhook
          description: `Compra de pacote ${creditPackage.name}`,
          package_id: creditPackage.id,
          payment_method: request.payment_method,
          payment_amount: creditPackage.price,
          payment_status: 'pending',
          payment_reference: paymentResult.data.id
        })
        .select()
        .single()

      return { 
        data: {
          transaction,
          payment: paymentResult.data
        }, 
        error: null 
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Create PIX payment
   */
  private async createPixPayment(creditPackage: CreditPackage, paymentData: any) {
    try {
      const response = await fetch('/api/v1/business/credits/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: creditPackage.price,
          description: `Créditos OpenLove - ${creditPackage.name}`,
          payer_cpf: paymentData?.payer_cpf,
          payer_name: paymentData?.payer_name,
          metadata: {
            package_id: creditPackage.id,
            credits: creditPackage.credits + creditPackage.bonus_credits,
            type: 'credit_purchase'
          }
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      return { data: result, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Create card payment (Stripe)
   */
  private async createCardPayment(creditPackage: CreditPackage, paymentData: any) {
    try {
      // Implementation for Stripe payment
      // This would integrate with your Stripe setup
      return { data: null, error: 'Card payment not implemented yet' }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get credit transactions
   */
  async getCreditTransactions(businessId: string, limit = 50): Promise<{ data: CreditTransaction[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Create ad campaign
   */
  async createAdCampaign(businessId: string, data: CreateCampaignRequest): Promise<{ data: AdCampaign | null; error: any }> {
    try {
      const { data: business, error: businessError } = await this.getMyBusiness()
      if (businessError || !business) throw new Error('Business not found')

      // Check if business has enough credits
      if (business.credit_balance < data.total_budget) {
        throw new Error('Insufficient credits')
      }

      const { data: campaign, error } = await this.supabase
        .from('ad_campaigns')
        .insert({
          business_id: business.id,
          ...data,
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spent: 0,
            ctr: 0,
            cpc: 0,
            roi: 0
          }
        })
        .select()
        .single()

      if (error) throw error
      return { data: campaign, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get campaigns
   */
  async getCampaigns(businessId: string): Promise<{ data: AdCampaign[]; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('ad_campaigns')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error }
    }
  }

  /**
   * Create ad
   */
  async createAd(data: CreateAdRequest): Promise<{ data: BusinessAd | null; error: any }> {
    try {
      const { data: business, error: businessError } = await this.getMyBusiness()
      if (businessError || !business) throw new Error('Business not found')

      const { data: ad, error } = await this.supabase
        .from('business_ads')
        .insert({
          business_id: business.id,
          ...data,
          impressions: 0,
          unique_impressions: 0,
          clicks: 0,
          unique_clicks: 0,
          conversions: 0,
          credits_spent: 0
        })
        .select()
        .single()

      if (error) throw error
      return { data: ad, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get business dashboard data
   */
  async getDashboard(businessId: string): Promise<{ data: BusinessDashboard | null; error: any }> {
    try {
      const [business, transactions, campaigns] = await Promise.all([
        this.getBusiness(businessId),
        this.getCreditTransactions(businessId, 10),
        this.getCampaigns(businessId)
      ])

      if (business.error) throw business.error

      // Calculate overview metrics
      const activeCampaigns = campaigns.data.filter(c => c.status === 'active')
      const totalImpressions = activeCampaigns.reduce((sum, c) => sum + c.metrics.impressions, 0)
      const totalClicks = activeCampaigns.reduce((sum, c) => sum + c.metrics.clicks, 0)
      const conversionRate = totalClicks > 0 ? (activeCampaigns.reduce((sum, c) => sum + c.metrics.conversions, 0) / totalClicks) * 100 : 0

      // Get top performing ads
      const { data: topAds } = await this.supabase
        .from('business_ads')
        .select('*')
        .eq('business_id', businessId)
        .order('clicks', { ascending: false })
        .limit(5)

      // Mock analytics data (would be calculated from real data)
      const analytics = {
        impressions_by_day: this.generateMockDailyData('impressions', 7),
        clicks_by_day: this.generateMockDailyData('clicks', 7),
        spend_by_day: this.generateMockDailyData('spend', 7),
        demographics: {
          age: {
            '18-24': 25,
            '25-34': 35,
            '35-44': 25,
            '45+': 15
          },
          gender: {
            'male': 45,
            'female': 50,
            'other': 5
          },
          location: {
            'São Paulo': 40,
            'Rio de Janeiro': 25,
            'Minas Gerais': 15,
            'Others': 20
          }
        }
      }

      const dashboard: BusinessDashboard = {
        overview: {
          credit_balance: business.data?.credit_balance || 0,
          total_spent: business.data?.total_credits_spent || 0,
          active_campaigns: activeCampaigns.length,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          conversion_rate: conversionRate
        },
        recent_transactions: transactions.data,
        active_campaigns: activeCampaigns,
        top_performing_ads: topAds || [],
        analytics
      }

      return { data: dashboard, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get content creator dashboard
   */
  async getContentCreatorDashboard(businessId: string): Promise<{ data: ContentCreatorDashboard | null; error: any }> {
    try {
      const baseDashboard = await this.getDashboard(businessId)
      if (baseDashboard.error) throw baseDashboard.error

      // Get content stats
      const { data: contentStats } = await this.supabase
        .from('paid_content')
        .select('sales_count, total_revenue, rating_average')
        .eq('business_id', businessId)

      const totalContent = contentStats?.length || 0
      const totalSales = contentStats?.reduce((sum, c) => sum + c.sales_count, 0) || 0
      const totalRevenue = contentStats?.reduce((sum, c) => sum + c.total_revenue, 0) || 0
      const avgRating = contentStats?.reduce((sum, c, _, arr) => sum + c.rating_average / arr.length, 0) || 0

      // Get top content
      const { data: topContent } = await this.supabase
        .from('paid_content')
        .select('id, title, sales_count, total_revenue, rating_average')
        .eq('business_id', businessId)
        .order('sales_count', { ascending: false })
        .limit(5)

      // Get subscriber stats (mock for now)
      const subscriberStats = {
        total_subscribers: 150,
        active_subscribers: 120,
        monthly_revenue: 3500,
        churn_rate: 5.2
      }

      const creatorDashboard: ContentCreatorDashboard = {
        ...baseDashboard.data!,
        content_stats: {
          total_content: totalContent,
          total_sales: totalSales,
          total_revenue: totalRevenue,
          average_rating: avgRating
        },
        top_content: topContent?.map(c => ({
          id: c.id,
          title: c.title,
          sales: c.sales_count,
          revenue: c.total_revenue,
          rating: c.rating_average
        })) || [],
        subscriber_stats: subscriberStats
      }

      return { data: creatorDashboard, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get venue dashboard
   */
  async getVenueDashboard(businessId: string): Promise<{ data: VenueDashboard | null; error: any }> {
    try {
      const baseDashboard = await this.getDashboard(businessId)
      if (baseDashboard.error) throw baseDashboard.error

      // Get event stats
      const { data: events } = await this.supabase
        .from('events')
        .select('*')
        .eq('business_id', businessId)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })

      const upcomingEvents = events || []
      const totalAttendees = upcomingEvents.reduce((sum, e) => sum + (e.attendees_count || 0), 0)
      const ticketSales = upcomingEvents.reduce((sum, e) => sum + (e.tickets_sold || 0), 0)
      const revenue = upcomingEvents.reduce((sum, e) => sum + (e.revenue || 0), 0)

      // Mock peak times data
      const peakTimes = [
        { day: 'Friday', hour: 22, visitors: 450 },
        { day: 'Saturday', hour: 23, visitors: 520 },
        { day: 'Friday', hour: 23, visitors: 480 },
        { day: 'Saturday', hour: 22, visitors: 470 },
        { day: 'Thursday', hour: 22, visitors: 320 }
      ]

      const venueDashboard: VenueDashboard = {
        ...baseDashboard.data!,
        event_stats: {
          upcoming_events: upcomingEvents.length,
          total_attendees: totalAttendees,
          ticket_sales: ticketSales,
          revenue: revenue
        },
        upcoming_events: upcomingEvents.slice(0, 5).map(e => ({
          id: e.id,
          name: e.name,
          date: e.start_date,
          attendees: e.attendees_count || 0,
          tickets_sold: e.tickets_sold || 0
        })),
        peak_times: peakTimes
      }

      return { data: venueDashboard, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Helper to generate mock daily data
   */
  private generateMockDailyData(type: string, days: number) {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      let value = 0
      switch (type) {
        case 'impressions':
          value = Math.floor(Math.random() * 5000) + 1000
          break
        case 'clicks':
          value = Math.floor(Math.random() * 500) + 100
          break
        case 'spend':
          value = Math.floor(Math.random() * 200) + 50
          break
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        [type === 'spend' ? 'amount' : 'count']: value
      })
    }
    
    return data
  }

  /**
   * Upload business media
   */
  async uploadMedia(businessId: string, file: File, type: 'logo' | 'cover' | 'gallery'): Promise<{ url: string | null; error: any }> {
    try {
      const { StorageService } = await import('./storage.service')
      
      const result = await StorageService.uploadFile({
        userId: businessId,
        file,
        type: 'business',
        isServer: false
      })

      if (result.error) {
        return { url: null, error: result.error }
      }

      const publicUrl = result.url

      // Update business profile with new media URL
      const updateData: any = {}
      if (type === 'logo') updateData.logo_url = publicUrl
      if (type === 'cover') updateData.cover_image_url = publicUrl
      
      if (type === 'gallery') {
        // Add to gallery array
        const { data: business } = await this.getBusiness(businessId)
        if (business) {
          updateData.gallery_urls = [...(business.gallery_urls || []), publicUrl]
        }
      }

      await this.updateBusiness(businessId, updateData)

      return { url: publicUrl, error: null }
    } catch (error) {
      return { url: null, error }
    }
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: 'active' | 'paused' | 'completed'): Promise<{ data: AdCampaign | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('ad_campaigns')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', campaignId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  /**
   * Get ad metrics
   */
  async getAdMetrics(businessId: string): Promise<{ data: any; error: any }> {
    try {
      const { data: campaigns } = await this.getCampaigns(businessId)
      
      // Calculate aggregate metrics
      const totalImpressions = campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0)
      const totalClicks = campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0)
      const totalSpent = campaigns.reduce((sum, c) => sum + c.spent_credits, 0)
      const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
      const totalConversions = campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0)

      const metrics = {
        impressions: totalImpressions,
        clicks: totalClicks,
        spent: totalSpent * 10, // Convert credits to cents for currency display
        ctr,
        conversions: totalConversions,
        campaigns_count: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length
      }

      return { data: metrics, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}

export const businessService = new BusinessService()