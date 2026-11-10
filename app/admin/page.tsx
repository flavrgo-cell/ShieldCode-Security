"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import type { Transaction } from "@/lib/types";
import { TransactionDetailModal } from "@/components/transaction-detail-modal";

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  const supabase = createClient();

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: Transaction[]) => {
    const stats = {
      total: data.length,
      pending: data.filter((t) => t.status === "pending").length,
      approved: data.filter((t) => t.status === "approved").length,
      rejected: data.filter((t) => t.status === "rejected").length,
      totalAmount: data.reduce((sum, t) => sum + Number(t.amount), 0),
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setTransactions((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (activeTab !== "all") {
      filtered = filtered.filter((t) => t.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.account_id.toLowerCase().includes(query) ||
          t.merchant_name.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
    calculateStats(transactions);
  }, [transactions, activeTab, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
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
      month: "short",
      day: "numeric",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">SecurePay Admin</h1>
                <p className="text-sm text-muted-foreground">Transaction Monitoring</p>
              </div>
            </div>
            <Button variant="outline" onClick={fetchTransactions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-semibold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-semibold">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-semibold">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="text-2xl font-semibold">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Monitor and review all payment verification requests</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Transaction
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Account
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-sm">{transaction.merchant_name}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {transaction.id.slice(0, 8)}...
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-mono">{transaction.account_id}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold">
                                {formatCurrency(Number(transaction.amount), transaction.currency)}
                              </p>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                            <td className="py-3 px-4">
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.created_at)}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}
