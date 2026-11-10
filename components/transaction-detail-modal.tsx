"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  CreditCard,
  Calendar,
  Globe,
  Monitor,
  Shield,
  ExternalLink,
} from "lucide-react";
import type { Transaction } from "@/lib/types";

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Verification
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify?token=${transaction.verification_token}`;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status and Amount */}
          <div className="flex items-center justify-between">
            {getStatusBadge(transaction.status)}
            <p className="text-2xl font-bold">
              {formatCurrency(Number(transaction.amount), transaction.currency)}
            </p>
          </div>

          <Separator />

          {/* Selfie Image */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Captured Selfie</h3>
            <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {transaction.selfie_url ? (
                <Image
                  src={transaction.selfie_url || "/placeholder.svg"}
                  alt="Verification selfie"
                  fill
                  className="object-cover"
                  onLoad={() => setImageLoading(false)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <CreditCard className="w-4 h-4" />
                  Account ID
                </div>
                <p className="font-mono font-medium">{transaction.account_id}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-4 h-4" />
                  Merchant
                </div>
                <p className="font-medium">{transaction.merchant_name}</p>
                {transaction.merchant_id && (
                  <p className="text-sm text-muted-foreground font-mono">{transaction.merchant_id}</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Created
                </div>
                <p className="text-sm">{formatDate(transaction.created_at)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  Expires
                </div>
                <p className="text-sm">{formatDate(transaction.expires_at)}</p>
              </div>

              {transaction.ip_address && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Globe className="w-4 h-4" />
                    IP Address
                  </div>
                  <p className="font-mono text-sm">{transaction.ip_address}</p>
                </div>
              )}

              {transaction.user_agent && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Monitor className="w-4 h-4" />
                    Device
                  </div>
                  <p className="text-sm text-muted-foreground truncate" title={transaction.user_agent}>
                    {transaction.user_agent.substring(0, 50)}...
                  </p>
                </div>
              )}

              {transaction.approved_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Approved At
                  </div>
                  <p className="text-sm">{formatDate(transaction.approved_at)}</p>
                </div>
              )}

              {transaction.rejected_at && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Rejected At
                  </div>
                  <p className="text-sm">{formatDate(transaction.rejected_at)}</p>
                </div>
              )}
            </div>
          </div>

          {transaction.status === "pending" && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Verification Link</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded font-mono truncate">
                    {verifyUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(verifyUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
