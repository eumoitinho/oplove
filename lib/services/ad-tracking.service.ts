import { createClient } from '@/app/lib/supabase-browser'

interface AdInteraction {
  campaign_id: string
  ad_id?: string
  interaction_type: 'impression' | 'click' | 'conversion'
  user_id?: string
  placement?: string
  device_type?: string
  user_location?: { lat: number; lng: number }
  distance_from_business?: number
  credits_to_spend: number
}

interface AdSpendResult {
  credits_spent: number
  remaining_balance: number
  success: boolean
  error?: string
}

class AdTrackingService {
  private supabase = createClient()
  private pendingImpressions = new Set<string>()
  private trackedInteractions = new Set<string>()

  /**
   * Track an ad impression
   */
  async trackImpression(
    campaignId: string, 
    adId?: string, 
    userId?: string,
    options: {
      placement?: string
      device_type?: string
      user_location?: { lat: number; lng: number }
      distance_from_business?: number
    } = {}
  ): Promise<AdSpendResult> {
    const impressionKey = `${campaignId}-${adId || 'campaign'}-impression`
    
    // Prevent duplicate impressions
    if (this.pendingImpressions.has(impressionKey)) {
      return { credits_spent: 0, remaining_balance: 0, success: false, error: 'Duplicate impression' }
    }

    this.pendingImpressions.add(impressionKey)

    try {
      const result = await this.spendCredits({
        campaign_id: campaignId,
        ad_id: adId,
        interaction_type: 'impression',
        user_id: userId,
        placement: options.placement || 'feed',
        device_type: options.device_type || this.getDeviceType(),
        user_location: options.user_location,
        distance_from_business: options.distance_from_business,
        credits_to_spend: this.getImpressionCost()
      })

      // Track the impression locally to prevent duplicates
      this.trackedInteractions.add(impressionKey)
      
      return result
    } finally {
      this.pendingImpressions.delete(impressionKey)
    }
  }

  /**
   * Track an ad click
   */
  async trackClick(
    campaignId: string, 
    adId?: string, 
    userId?: string,
    options: {
      placement?: string
      device_type?: string
      user_location?: { lat: number; lng: number }
      distance_from_business?: number
    } = {}
  ): Promise<AdSpendResult> {
    const clickKey = `${campaignId}-${adId || 'campaign'}-click-${userId || 'anonymous'}`
    
    // Prevent duplicate clicks from same user
    if (this.trackedInteractions.has(clickKey)) {
      return { credits_spent: 0, remaining_balance: 0, success: false, error: 'Duplicate click' }
    }

    try {
      const result = await this.spendCredits({
        campaign_id: campaignId,
        ad_id: adId,
        interaction_type: 'click',
        user_id: userId,
        placement: options.placement || 'feed',
        device_type: options.device_type || this.getDeviceType(),
        user_location: options.user_location,
        distance_from_business: options.distance_from_business,
        credits_to_spend: this.getClickCost()
      })

      this.trackedInteractions.add(clickKey)
      return result
    } catch (error) {
      console.error('Error tracking click:', error)
      return { credits_spent: 0, remaining_balance: 0, success: false, error: 'Failed to track click' }
    }
  }

  /**
   * Track a conversion (signup, purchase, etc.)
   */
  async trackConversion(
    campaignId: string, 
    adId?: string, 
    userId?: string,
    options: {
      conversion_type?: string
      conversion_value?: number
      placement?: string
      device_type?: string
    } = {}
  ): Promise<AdSpendResult> {
    try {
      return await this.spendCredits({
        campaign_id: campaignId,
        ad_id: adId,
        interaction_type: 'conversion',
        user_id: userId,
        placement: options.placement || 'feed',
        device_type: options.device_type || this.getDeviceType(),
        credits_to_spend: this.getConversionCost()
      })
    } catch (error) {
      console.error('Error tracking conversion:', error)
      return { credits_spent: 0, remaining_balance: 0, success: false, error: 'Failed to track conversion' }
    }
  }

  /**
   * Spend credits for ad interaction
   */
  private async spendCredits(interaction: AdInteraction): Promise<AdSpendResult> {
    try {
      const response = await fetch('/api/v1/business/ads/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interaction)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to spend credits')
      }

      return {
        credits_spent: result.data.credits_spent,
        remaining_balance: result.data.remaining_balance,
        success: true
      }
    } catch (error) {
      console.error('Error spending credits:', error)
      return {
        credits_spent: 0,
        remaining_balance: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get active ad campaigns for display
   */
  async getActiveCampaigns(options: {
    user_age?: number
    user_gender?: string
    user_location?: string
    user_interests?: string[]
    user_is_verified?: boolean
    user_is_premium?: boolean
    placement?: string
    limit?: number
  } = {}): Promise<{ data: any[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('ad_campaigns')
        .select(`
          *,
          business:businesses(
            id,
            business_name,
            logo_url,
            description
          ),
          ads:business_ads(*)
        `)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString())
        .gt('total_budget', supabase.sql`spent_credits * 10`) // Still has budget
        .limit(options.limit || 10)

      if (error) throw error

      // Filter based on targeting criteria
      let filteredCampaigns = data || []

      if (options.user_age) {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const targeting = campaign.targeting || {}
          const demographics = targeting.demographics || {}
          return options.user_age! >= (demographics.age_min || 18) && 
                 options.user_age! <= (demographics.age_max || 65)
        })
      }

      if (options.user_gender) {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const targeting = campaign.targeting || {}
          const demographics = targeting.demographics || {}
          const targetGenders = demographics.genders || []
          return targetGenders.length === 0 || targetGenders.includes(options.user_gender!)
        })
      }

      if (options.user_interests?.length) {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const targeting = campaign.targeting || {}
          const targetInterests = targeting.interests || []
          if (targetInterests.length === 0) return true
          return targetInterests.some((interest: string) => 
            options.user_interests!.includes(interest)
          )
        })
      }

      if (options.user_is_verified !== undefined) {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const targeting = campaign.targeting || {}
          const behaviors = targeting.behaviors || {}
          return !behaviors.verified_only || options.user_is_verified === true
        })
      }

      if (options.user_is_premium !== undefined) {
        filteredCampaigns = filteredCampaigns.filter(campaign => {
          const targeting = campaign.targeting || {}
          const behaviors = targeting.behaviors || {}
          return !behaviors.premium_users_only || options.user_is_premium === true
        })
      }

      return { data: filteredCampaigns }
    } catch (error) {
      console.error('Error getting active campaigns:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'server'
    
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
      return 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet'
    } else {
      return 'desktop'
    }
  }

  /**
   * Get impression cost in credits
   */
  private getImpressionCost(): number {
    return 1 // 1 credit per impression
  }

  /**
   * Get click cost in credits
   */
  private getClickCost(): number {
    return 5 // 5 credits per click
  }

  /**
   * Get conversion cost in credits
   */
  private getConversionCost(): number {
    return 20 // 20 credits per conversion
  }

  /**
   * Clear tracking cache (for testing)
   */
  clearTrackingCache(): void {
    this.pendingImpressions.clear()
    this.trackedInteractions.clear()
  }
}

export const adTrackingService = new AdTrackingService()