'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield } from 'lucide-react'

interface TransactionDetails {
  id: string
  amount: number
  currency: string
  merchant_name: string
  account_id: string
  selfie_url: string
  status: string
  expires_at: string
  anti_phishing_code: string
  owner_name: string
}

type VerifyStatus = 'loading' | 'confirm' | 'approved' | 'rejected' | 'expired' | 'error' | 'already_processed'

export function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const action = searchParams.get('action') as 'approve' | 'reject' | null

  const [status, setStatus] = useState<VerifyStatus>('loading')
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link')
      setStatus('error')
      return
    }

    fetchTransaction()
  }, [token])

  const fetchTransaction = async () => {
    try {
      const response = await fetch(`/api/verify?token=${token}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.status === 'expired') {
          setStatus('expired')
        } else if (data.status === 'approved' || data.status === 'rejected') {
          setStatus('already_processed')
          setTransaction(data.transaction)
        } else {
          setError(data.error || 'Failed to load transaction')
          setStatus('error')
        }
        return
      }

      setTransaction(data.transaction)
      
      if (action === 'approve' || action === 'reject') {
        setStatus('confirm')
      } else {
        setStatus('confirm')
      }
    } catch {
      setError('Failed to load transaction')
      setStatus('error')
    }
  }

  const handleVerify = async (verifyAction: 'approve' | 'reject') => {
    if (!token) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: verifyAction })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setStatus(verifyAction === 'approve' ? 'approved' : 'rejected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      setStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-muted-foreground">Loading transaction details...</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle>Verification Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === 'expired') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              This verification link has expired. For security, verification links are only valid for 15 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === 'already_processed') {
    const wasApproved = transaction?.status === 'approved'
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${wasApproved ? 'bg-green-100' : 'bg-red-100'}`}>
              {wasApproved ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle>Already {wasApproved ? 'Approved' : 'Rejected'}</CardTitle>
            <CardDescription>
              This transaction has already been {wasApproved ? 'approved' : 'rejected'}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === 'approved') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Payment Approved</CardTitle>
            <CardDescription>
              You have successfully approved this payment. The transaction will now be processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transaction && (
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">${transaction.amount.toFixed(2)} {transaction.currency}</p>
                <p className="text-sm text-muted-foreground">{transaction.merchant_name}</p>
              </div>
            )}
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (status === 'rejected') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Payment Rejected</CardTitle>
            <CardDescription>
              You have rejected this payment request. The transaction has been cancelled and the requester has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  // Confirm status - show transaction details
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Verify Payment</CardTitle>
          <CardDescription>
            Review the details below and confirm or reject this payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction && (
            <>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-3xl font-bold">${transaction.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{transaction.currency}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Merchant</span>
                  <span className="font-medium">{transaction.merchant_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-mono">{transaction.account_id}</span>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Your Anti-Phishing Code</p>
                <p className="font-mono text-xl font-bold text-green-700">{transaction.anti_phishing_code}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Verify this matches your registered code
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">Photo of requester:</p>
                <div className="flex justify-center">
                  <img
                    src={transaction.selfie_url || '/placeholder.svg'}
                    alt="Requester photo"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-muted"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                  onClick={() => handleVerify('reject')}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerify('approve')}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                If you did not initiate this payment or don&apos;t recognize the person in the photo, click Reject.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
