import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/api'

function generateToken(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

async function sendEmailAsync(
  toEmail: string,
  ownerName: string,
  merchantName: string,
  accountId: string,
  amount: number,
  antiPhishingCode: string,
  approveUrl: string,
  rejectUrl: string,
  transactionId: string
) {
  try {
    // Log verification details for admin dashboard instead of sending email
    const supabase = createClient()
    console.log(`[v0] Verification email for ${toEmail}:
    Account Owner: ${ownerName}
    Anti-Phishing Code: ${antiPhishingCode}
    Approve: ${approveUrl}
    Reject: ${rejectUrl}`)
    
    await supabase.from('verification_logs').insert({
      transaction_id: transactionId,
      action: 'email_sent',
      metadata: { 
        to: toEmail,
        antiPhishingCode: antiPhishingCode,
        approveUrl: approveUrl,
        rejectUrl: rejectUrl
      }
    })
  } catch (error) {
    console.error('[v0] Failed to log verification:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, provider, amount, merchantName, selfieImage } = body

    if (!accountId || !provider || !amount || !merchantName || !selfieImage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing database credentials' },
        { status: 500 }
      )
    }
    
    const supabase = createClient()

    // Look up the payment account
    const { data: account, error: accountError } = await supabase
      .from('payment_accounts')
      .select('*')
      .eq('account_id', accountId)
      .eq('provider', provider)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found. Please check your account ID and provider.' },
        { status: 404 }
      )
    }

    // Generate verification token
    const verificationToken = generateToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store a reference URL (not the full base64) in the database
    const dbSelfieUrl = `data:selfie:${verificationToken}`
    
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        amount,
        currency: 'USD',
        merchant_name: merchantName,
        status: 'pending',
        selfie_url: dbSelfieUrl,
        verification_token: verificationToken,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (txError || !transaction) {
      return NextResponse.json(
        { error: `Failed to create transaction: ${txError?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Send verification email via Resend (in background, don't block response)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const approveUrl = `${baseUrl}/verify?token=${verificationToken}&action=approve`
    const rejectUrl = `${baseUrl}/verify?token=${verificationToken}&action=reject`

    // Email sending is fire-and-forget, don't block the transaction
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      sendEmailAsync(
        account.owner_email,
        account.owner_name,
        merchantName,
        accountId,
        amount,
        account.anti_phishing_code,
        approveUrl,
        rejectUrl,
        transaction.id
      ).catch((err) => {
        console.error('Background email error:', err)
      })
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      antiPhishingCode: account.anti_phishing_code,
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
