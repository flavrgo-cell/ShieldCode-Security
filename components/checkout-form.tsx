'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SelfieCamera } from './selfie-camera'
import { PROVIDER_INFO, type Provider } from '@/lib/types'
import { CreditCard, Shield, Clock, AlertTriangle } from 'lucide-react'

interface CheckoutFormProps {
  merchantName?: string
  defaultAmount?: number
}

type Step = 'details' | 'camera' | 'pending' | 'error'

export function CheckoutForm({ merchantName = 'Demo Merchant', defaultAmount = 99.99 }: CheckoutFormProps) {
  const [step, setStep] = useState<Step>('details')
  const [accountId, setAccountId] = useState('')
  const [provider, setProvider] = useState<Provider>('baridimob')
  const [amount, setAmount] = useState(defaultAmount.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [antiPhishingCode, setAntiPhishingCode] = useState<string | null>(null)

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId.trim()) {
      setError('Please enter your account ID')
      return
    }
    setError(null)
    setStep('camera')
  }

  const handleSelfieCapture = async (imageDataUrl: string) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          provider,
          amount: parseFloat(amount),
          merchantName,
          selfieImage: imageDataUrl
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment')
      }

      setTransactionId(data.transactionId)
      setAntiPhishingCode(data.antiPhishingCode)
      setStep('pending')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setStep('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'pending') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Verification Pending</CardTitle>
          <CardDescription>
            A verification email has been sent to the account owner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-mono text-sm break-all">{transactionId}</p>
          </div>
          
          {antiPhishingCode && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-primary">Anti-Phishing Code</p>
              </div>
              <p className="font-mono text-lg font-bold text-primary">{antiPhishingCode}</p>
              <p className="text-xs text-muted-foreground mt-2">
                The account owner will see this code in their verification email. 
                If they don&apos;t recognize it, they should reject the transaction.
              </p>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>The account owner has 15 minutes to approve or reject this transaction.</p>
            <p className="mt-2">Please keep this page open for real-time updates.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (step === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Payment Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setStep('details')} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (step === 'camera') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Selfie Verification</CardTitle>
          <CardDescription>
            Take a selfie to verify your identity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitting ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Processing payment...</p>
            </div>
          ) : (
            <SelfieCamera
              onCapture={handleSelfieCapture}
              onCancel={() => setStep('details')}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">SecurePay Checkout</CardTitle>
            <CardDescription>{merchantName}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Payment Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                      {info.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {PROVIDER_INFO[provider].description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Enter your account ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full">
            Continue to Verification
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
            <Shield className="w-3 h-3" />
            <span>Protected by SecurePay anti-phishing system</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
