import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAbacatePayService } from '@/lib/services/abacatepay.service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { package_id, payment_method, payment_data } = body

    // Get user's business
    const { data: userData } = await supabase
      .from('users')
      .select('id, business_id')
      .eq('id', user.id)
      .single()

    if (!userData?.business_id) {
      return NextResponse.json(
        { error: 'No business profile found' },
        { status: 400 }
      )
    }

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', userData.business_id)
      .single()

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Get package details
    const { data: creditPackage } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', package_id)
      .eq('is_active', true)
      .single()

    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      )
    }

    // Create payment based on method
    let paymentResult
    if (payment_method === 'pix') {
      // Create PIX payment with AbacatePay
      paymentResult = await getAbacatePayService().createPixPayment({
        amount: creditPackage.price,
        description: `Créditos OpenLove - ${creditPackage.name}`,
        customer: {
          name: payment_data.payer_name || business.business_name,
          email: business.contact.email,
          document: payment_data.payer_cpf || business.cnpj,
          phone: business.contact.phone
        },
        metadata: {
          business_id: business.id,
          package_id: creditPackage.id,
          credits: creditPackage.credits + creditPackage.bonus_credits,
          type: 'credit_purchase'
        }
      })

      if (!paymentResult.success) {
        return NextResponse.json(
          { error: paymentResult.error || 'Payment creation failed' },
          { status: 400 }
        )
      }
    } else {
      // Credit card payment would be handled by Stripe
      return NextResponse.json(
        { error: 'Credit card payment not implemented yet' },
        { status: 501 }
      )
    }

    // Record transaction (pending confirmation)
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        business_id: business.id,
        type: 'purchase',
        amount: creditPackage.credits + creditPackage.bonus_credits,
        balance_before: business.credit_balance,
        balance_after: business.credit_balance, // Will be updated by webhook
        description: `Compra de pacote ${creditPackage.name}`,
        package_id: creditPackage.id,
        payment_method: payment_method,
        payment_amount: creditPackage.price,
        payment_status: 'pending',
        payment_reference: paymentResult.data.id,
        metadata: {
          payment_provider: payment_method === 'pix' ? 'abacatepay' : 'stripe',
          payment_id: paymentResult.data.id
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Return payment data for frontend
    return NextResponse.json({
      transaction,
      payment: {
        id: paymentResult.data.id,
        status: paymentResult.data.status,
        qr_code: paymentResult.data.qr_code,
        qr_code_text: paymentResult.data.qr_code_text,
        expires_at: paymentResult.data.expires_at
      }
    })
  } catch (error) {
    console.error('Error in credit purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check payment status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID required' },
        { status: 400 }
      )
    }

    // Check payment status with provider
    const paymentStatus = await getAbacatePayService().getPaymentStatus(paymentId)

    if (!paymentStatus.success) {
      return NextResponse.json(
        { error: 'Failed to get payment status' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: paymentStatus.data.status,
      paid_at: paymentStatus.data.paid_at
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}