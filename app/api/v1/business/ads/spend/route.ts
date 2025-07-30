import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getAuthenticatedUser } from "@/lib/auth/auth-utils"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, ad_id, interaction_type, user_id, credits_to_spend } = body

    if (!campaign_id || !interaction_type || !credits_to_spend) {
      return NextResponse.json({
        error: "Missing required fields",
        success: false
      }, { status: 400 })
    }

    const supabase = createServerClient()
    const authUser = await getAuthenticatedUser(req)

    if (!authUser) {
      return NextResponse.json({
        error: "Unauthorized",
        success: false
      }, { status: 401 })
    }

    // Get user's business
    const { data: userData } = await supabase
      .from('users')
      .select('business_id')
      .eq('id', authUser.id)
      .single()

    if (!userData?.business_id) {
      return NextResponse.json({
        error: "Business not found",
        success: false
      }, { status: 404 })
    }

    // Start transaction
    const { data: business } = await supabase
      .from('businesses')
      .select('credit_balance')
      .eq('id', userData.business_id)
      .single()

    if (!business || business.credit_balance < credits_to_spend) {
      return NextResponse.json({
        error: "Insufficient credits",
        success: false
      }, { status: 400 })
    }

    // Update business credit balance
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        credit_balance: business.credit_balance - credits_to_spend,
        total_credits_spent: supabase.sql`total_credits_spent + ${credits_to_spend}`
      })
      .eq('id', userData.business_id)

    if (updateError) throw updateError

    // Update campaign spent credits
    const { error: campaignError } = await supabase
      .from('ad_campaigns')
      .update({
        spent_credits: supabase.sql`spent_credits + ${credits_to_spend}`
      })
      .eq('id', campaign_id)

    if (campaignError) throw campaignError

    // Update ad spent credits if ad_id provided
    if (ad_id) {
      await supabase
        .from('business_ads')
        .update({
          credits_spent: supabase.sql`credits_spent + ${credits_to_spend}`
        })
        .eq('id', ad_id)
    }

    // Create credit transaction record
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        business_id: userData.business_id,
        type: 'spend',
        amount: -credits_to_spend,
        balance_before: business.credit_balance,
        balance_after: business.credit_balance - credits_to_spend,
        description: `Ad spend - ${interaction_type}`,
        reference_type: 'ad_campaign',
        reference_id: campaign_id,
        metadata: {
          campaign_id,
          ad_id,
          interaction_type,
          target_user_id: user_id
        }
      })

    if (transactionError) throw transactionError

    // Record ad interaction
    const { error: interactionError } = await supabase
      .from('ad_interactions')
      .insert({
        campaign_id,
        ad_id,
        user_id,
        interaction_type,
        placement: body.placement || 'feed',
        device_type: body.device_type || 'web',
        user_location: body.user_location,
        distance_from_business: body.distance_from_business,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      })

    if (interactionError) console.error('Error recording interaction:', interactionError)

    // Update campaign metrics
    await updateCampaignMetrics(supabase, campaign_id, interaction_type, credits_to_spend)

    return NextResponse.json({
      data: {
        credits_spent: credits_to_spend,
        remaining_balance: business.credit_balance - credits_to_spend
      },
      success: true
    })

  } catch (error) {
    console.error("Ad spend error:", error)
    return NextResponse.json({
      error: "Failed to process ad spend",
      success: false
    }, { status: 500 })
  }
}

async function updateCampaignMetrics(supabase: any, campaignId: string, interactionType: string, creditsSpent: number) {
  try {
    // Get current metrics
    const { data: campaign } = await supabase
      .from('ad_campaigns')
      .select('metrics')
      .eq('id', campaignId)
      .single()

    if (!campaign) return

    const metrics = campaign.metrics || {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      spent: 0,
      ctr: 0,
      cpc: 0,
      roi: 0
    }

    // Update based on interaction type
    switch (interactionType) {
      case 'impression':
        metrics.impressions += 1
        break
      case 'click':
        metrics.clicks += 1
        break
      case 'conversion':
        metrics.conversions += 1
        break
    }

    // Update spent
    metrics.spent += creditsSpent * 10 // Convert to cents

    // Recalculate derived metrics
    metrics.ctr = metrics.impressions > 0 ? metrics.clicks / metrics.impressions : 0
    metrics.cpc = metrics.clicks > 0 ? metrics.spent / metrics.clicks : 0

    // Update campaign
    await supabase
      .from('ad_campaigns')
      .update({ metrics })
      .eq('id', campaignId)

  } catch (error) {
    console.error('Error updating campaign metrics:', error)
  }
}