"use client";

import React from "react"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelfieCamera } from "./selfie-camera";
import { PROVIDER_INFO, type Provider } from "@/lib/types";
import {
  CreditCard,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CheckoutModalProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  onClose: () => void;
}

type Step = "details" | "camera" | "pending" | "approved" | "rejected" | "error";

export function CheckoutModal({ product, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [accountId, setAccountId] = useState("");
  const [provider, setProvider] = useState<Provider>("baridimob");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [antiPhishingCode, setAntiPhishingCode] = useState<string | null>(null);

  // Real-time subscription for transaction status
  useEffect(() => {
    if (!transactionId || step !== "pending") return;

    const supabase = createClient();
    
    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `id=eq.${transactionId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          if (newStatus === "approved") {
            setStep("approved");
          } else if (newStatus === "rejected") {
            setStep("rejected");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId, step]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim()) {
      setError("Please enter your account ID");
      return;
    }
    setError(null);
    setStep("camera");
  };

  const handleSelfieCapture = async (imageDataUrl: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          provider,
          amount: product.price,
          merchantName: `TechStore - ${product.name}`,
          selfieImage: imageDataUrl,
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server error: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      setTransactionId(data.transactionId);
      setAntiPhishingCode(data.antiPhishingCode);
      setStep("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case "approved":
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Approved!</h3>
            <p className="text-muted-foreground mb-6">
              The account owner has verified and approved this transaction.
            </p>
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">Order Total</p>
              <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
            </div>
            <Button onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        );

      case "rejected":
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Payment Rejected</h3>
            <p className="text-muted-foreground mb-6">
              The account owner has rejected this transaction. If you believe this is an error, please contact the account owner.
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        );

      case "pending":
        return (
          <div className="text-center py-6">
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold mb-2">Awaiting Verification</h3>
            <p className="text-muted-foreground mb-6">
              A verification email has been sent to the account owner with your selfie and anti-phishing code.
            </p>
            
            <div className="bg-muted p-4 rounded-lg mb-4 text-left">
              <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
              <p className="font-mono text-sm break-all">{transactionId}</p>
            </div>

            {antiPhishingCode && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-primary">Anti-Phishing Code</p>
                </div>
                <p className="font-mono text-2xl font-bold text-primary">{antiPhishingCode}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  The owner will see this code in the verification email
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span>Waiting for owner response...</span>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-xl font-bold mb-2">Payment Failed</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => setStep("details")} className="w-full">
              Try Again
            </Button>
          </div>
        );

      case "camera":
        return (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("details")}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">Identity Verification</h3>
              <p className="text-sm text-muted-foreground">
                Take a clear selfie to verify your identity
              </p>
            </div>
            {isSubmitting ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                <p className="text-sm text-muted-foreground">Processing payment...</p>
              </div>
            ) : (
              <SelfieCamera
                onCapture={handleSelfieCapture}
                onCancel={() => setStep("details")}
              />
            )}
          </div>
        );

      default:
        return (
          <div>
            {/* Product Summary */}
            <div className="flex gap-4 p-4 bg-muted rounded-lg mb-6">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Payment Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => setProvider(v as Provider)}
                >
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
                  onChange={(e) => setAccountId(e.target.value.trim())}
                  placeholder={provider === "baridimob" ? "BARI-12345" : provider === "redotpay" ? "RDPAY-67890" : "ECCP-11111"}
                />
                <p className="text-xs text-muted-foreground">
                  Test: <code className="bg-muted px-1 rounded">{provider === "baridimob" ? "BARI-12345" : provider === "redotpay" ? "RDPAY-67890" : "ECCP-11111"}</code>
                </p>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full gap-2">
                <Lock className="w-4 h-4" />
                Continue to Verification
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                <Shield className="w-3 h-3" />
                <span>Protected by SecurePay anti-phishing system</span>
              </div>
            </form>
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            SecurePay Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your purchase securely
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
