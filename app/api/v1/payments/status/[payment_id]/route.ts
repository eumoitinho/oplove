import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { abacatepayService } from '@/lib/services/abacatepay.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { payment_id: string } }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const paymentId = params.payment_id

    // First check our database
    const { data: transaction } = await supabase
      .from('credit_transactions')
      .select('payment_status, payment_reference, metadata')
      .eq('payment_reference', paymentId)
      .single()

    if (transaction && transaction.payment_status !== 'pending') {
      // Payment already processed
      return NextResponse.json({
        status: transaction.payment_status,
        paid_at: transaction.metadata?.paid_at
      })
    }

    // Check with payment provider
    const paymentStatus = await abacatepayService.getPaymentStatus(paymentId)

    if (!paymentStatus.success) {
      return NextResponse.json(
        { error: 'Failed to get payment status' },
        { status: 400 }
      )
    }

    // Map provider status to our status
    let status = 'pending'
    if (paymentStatus.data.status === 'paid') {
      status = 'paid'
    } else if (paymentStatus.data.status === 'expired') {
      status = 'expired'
    } else if (paymentStatus.data.status === 'canceled') {
      status = 'canceled'
    }

    return NextResponse.json({
      status,
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