"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getWalletBalance, getTransactions } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import WalletCard from "@/components/wallet/WalletCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Transaction } from "@/types";

export default function WalletPage() {
  const { wallet, setWallet, transactions, setTransactions } = useWalletStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    getWalletBalance().then((response) => {
      if (response.success) {
        setWallet(response.data);
      }
    });

    getTransactions().then((response) => {
      if (response.success) {
        setTransactions(response.data);
      }
    });
  }, [setWallet, setTransactions]);

  const totalLocked =
    (wallet?.balance_deposit || 0) +
    (wallet?.balance_reward_task || 0) +
    (wallet?.balance_matching_lock || 0);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterStatus !== "all" && tx.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return <Badge variant="success">Success</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeLabel = (type: Transaction["type"]) => {
    const labels: Record<Transaction["type"], string> = {
      DEPOSIT: "Deposit",
      WD_AVAILABLE: "Withdraw Available",
      WD_LOCKED: "Withdraw Locked",
      BONUS_SPONSOR: "Bonus Sponsor",
      BONUS_PAIRING: "Bonus Pairing",
      BONUS_MATCHING: "Bonus Matching",
      REWARD_TASK: "Reward Task",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Kelola saldo dan lihat riwayat transaksi
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <WalletCard
          title="Available Balance"
          amount={wallet?.balance_available || 0}
          description="Bisa ditarik kapan saja"
          variant="available"
        />
        <WalletCard
          title="Locked Balance"
          amount={totalLocked}
          description={
            wallet?.unlock_date
              ? `Unlock: ${new Date(wallet.unlock_date).toLocaleDateString("id-ID")}`
              : "Terkunci selama 30 hari"
          }
          variant="locked"
        />
      </div>

      {/* Locked Balance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Locked Balance Breakdown</CardTitle>
          <CardDescription>Detail saldo yang terkunci</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Deposit Locked</span>
            <span className="font-medium">{formatIDR(wallet?.balance_deposit || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Reward Task Locked</span>
            <span className="font-medium">{formatIDR(wallet?.balance_reward_task || 0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Matching Bonus Locked</span>
            <span className="font-medium">{formatIDR(wallet?.balance_matching_lock || 0)}</span>
          </div>
          <div className="border-t pt-3 flex justify-between items-center font-bold">
            <span>Total Locked</span>
            <span>{formatIDR(totalLocked)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Riwayat semua transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                <SelectItem value="WD_AVAILABLE">Withdraw</SelectItem>
                <SelectItem value="REWARD_TASK">Reward Task</SelectItem>
                <SelectItem value="BONUS_SPONSOR">Bonus Sponsor</SelectItem>
                <SelectItem value="BONUS_PAIRING">Bonus Pairing</SelectItem>
                <SelectItem value="BONUS_MATCHING">Bonus Matching</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada transaksi
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{getTypeLabel(tx.type)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    {tx.bank_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.bank_name} - {tx.bank_account}
                      </p>
                    )}
                    {tx.rejected_reason && (
                      <p className="text-xs text-red-500 mt-1">
                        Alasan: {tx.rejected_reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{formatIDR(tx.amount)}</span>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

