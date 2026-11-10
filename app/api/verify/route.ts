import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch the transaction
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('verification_token', token)
    .single()

  if (error || !transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  // Check if expired
  if (new Date(transaction.expires_at) < new Date()) {
    // Update status to expired if still pending
    if (transaction.status === 'pending') {
      await supabase
        .from('transactions')
        .update({ status: 'expired' })
        .eq('id', transaction.id)

      await supabase.from('verification_logs').insert({
        transaction_id: transaction.id,
        action: 'expired'
      })
    }
    return NextResponse.json({ status: 'expired' }, { status: 410 })
  }

  // Check if already processed
  if (transaction.status !== 'pending') {
    return NextResponse.json({
      status: transaction.status,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        merchant_name: transaction.merchant_name,
        account_id: transaction.account_id,
        status: transaction.status
      }
    }, { status: 200 })
  }

  // Fetch account for anti-phishing code
  const { data: account } = await supabase
    .from('payment_accounts')
    .select('anti_phishing_code, owner_name')
    .eq('account_id', transaction.account_id)
    .single()

  // Log email opened
  await supabase.from('verification_logs').insert({
    transaction_id: transaction.id,
    action: 'email_opened',
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    user_agent: request.headers.get('user-agent')
  })

  return NextResponse.json({
    transaction: {
      id: transaction.id,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      merchant_name: transaction.merchant_name,
      account_id: transaction.account_id,
      selfie_url: transaction.selfie_url,
      status: transaction.status,
      expires_at: transaction.expires_at,
      anti_phishing_code: account?.anti_phishing_code || 'N/A',
      owner_name: account?.owner_name || 'Account Owner'
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json()

    if (!token || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch the transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('verification_token', token)
      .single()

    if (error || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Check if already processed
    if (transaction.status !== 'pending') {
      return NextResponse.json({
        error: `Transaction already ${transaction.status}`
      }, { status: 400 })
    }

    // Check if expired
    if (new Date(transaction.expires_at) < new Date()) {
      await supabase
        .from('transactions')
        .update({ status: 'expired' })
        .eq('id', transaction.id)

      return NextResponse.json({ error: 'Transaction expired' }, { status: 410 })
    }

    // Update transaction status
    const now = new Date().toISOString()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const updateData: Record<string, string> = {
      status: newStatus,
      updated_at: now
    }

    if (action === 'approve') {
      updateData.approved_at = now
    } else {
      updateData.rejected_at = now
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
    }

    // Log the action
    await supabase.from('verification_logs').insert({
      transaction_id: transaction.id,
      action: action === 'approve' ? 'approved' : 'rejected',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      status: newStatus
    })

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
