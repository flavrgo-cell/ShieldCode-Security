"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { Transaction } from "@/lib/types";

function PendingContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchTransaction = async () => {
    if (!transactionId) {
      setError("No transaction ID provided");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError) {
      setError("Transaction not found");
    } else {
      setTransaction(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransaction();

    if (!transactionId) return;

    // Set up real-time subscription for this transaction
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
          setTransaction(payload.new as Transaction);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Transaction Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || "The transaction you're looking for doesn't exist."}</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (transaction.status) {
      case "pending":
        return {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          badge: (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              <Clock className="w-3 h-3 mr-1" />
              Pending Verification
            </Badge>
          ),
          title: "Awaiting Your Approval",
          description: "We've sent a verification email to the account owner. Please check your email and approve or reject this transaction.",
          bgColor: "bg-amber-500/5",
        };
      case "approved":
        return {
          icon: <CheckCircle className="w-16 h-16 text-emerald-500" />,
          badge: (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Approved
            </Badge>
          ),
          title: "Transaction Approved",
          description: "Great news! The account owner has verified and approved this transaction. You may proceed with the payment.",
          bgColor: "bg-emerald-500/5",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          badge: (
            <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
              <XCircle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          ),
          title: "Transaction Rejected",
          description: "The account owner has rejected this transaction. If you believe this is an error, please contact support.",
          bgColor: "bg-red-500/5",
        };
      case "expired":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-muted-foreground" />,
          badge: (
            <Badge variant="secondary">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          ),
          title: "Verification Expired",
          description: "This transaction has expired. Please start a new transaction to proceed with your payment.",
          bgColor: "bg-muted/50",
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-muted-foreground" />,
          badge: <Badge variant="outline">{transaction.status}</Badge>,
          title: "Unknown Status",
          description: "Unable to determine transaction status.",
          bgColor: "bg-muted/50",
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">SecurePay Gateway</h1>
            <p className="text-xs text-muted-foreground">Transaction Status</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Status Banner */}
          <div className={`${statusDisplay.bgColor} p-8 text-center border-b`}>
            <div className="flex justify-center mb-4">
              {statusDisplay.icon}
            </div>
            <div className="mb-3">{statusDisplay.badge}</div>
            <h2 className="text-2xl font-bold mb-2">{statusDisplay.title}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {statusDisplay.description}
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Transaction Details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(transaction.amount), transaction.currency)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Merchant</p>
                  <p className="text-lg font-semibold">{transaction.merchant_name}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Account ID</p>
                <p className="font-mono font-medium">{transaction.account_id}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-xs">{transaction.id}</p>
              </div>
            </div>

            {transaction.status === "pending" && (
              <>
                <Separator />
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Verification Email Sent</p>
                      <p className="text-sm text-muted-foreground">
                        A verification email has been sent to the registered account owner. 
                        This page will automatically update once they respond.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Listening for updates...</span>
                </div>
              </>
            )}

            <div className="flex justify-center pt-4">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Start New Transaction
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
