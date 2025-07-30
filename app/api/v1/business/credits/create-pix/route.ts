import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { abacatepayService } from '@/lib/services/abacatepay.service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, description, payer_cpf, payer_name, metadata } = body

    // Validate required fields
    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Amount and description are required' },
        { status: 400 }
      )
    }

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, business_id')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get business data if this is for a business
    let businessData = null
    if (userData.business_id && metadata?.package_id) {
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', userData.business_id)
        .single()
      
      businessData = business
    }

    // Create PIX payment with AbacatePay
    const paymentResult = await abacatepayService.createPixPayment({
      amount,
      description,
      customer: {
        name: payer_name || userData.name || 'Cliente OpenLove',
        email: user.email || 'cliente@openlove.com.br',
        document: payer_cpf || '00000000000',
        phone: businessData?.contact?.phone || ''
      },
      metadata: {
        ...metadata,
        user_id: userData.id,
        created_by: user.id
      }
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment creation failed' },
        { status: 400 }
      )
    }

    return NextResponse.json(paymentResult.data)
  } catch (error) {
    console.error('Error creating PIX payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}