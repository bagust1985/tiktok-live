"use client";

import { useEffect, useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { getWalletBalance, getTransactions } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import WalletCard from "@/components/wallet/WalletCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction } from "@/types";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { wallet, setWallet, transactions, setTransactions } =
    useWalletStore();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    getWalletBalance().then((res) => {
      if (res.success) setWallet(res.data);
    });

    getTransactions().then((res) => {
      if (res.success) setTransactions(res.data);
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
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* Neon background */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          Wallet
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola saldo dan lihat riwayat transaksi kamu
        </p>
      </div>

      {/* BALANCE */}
      <div className="relative z-10 grid gap-4 sm:grid-cols-2">
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
              ? `Unlock: ${new Date(wallet.unlock_date).toLocaleDateString(
                  "id-ID"
                )}`
              : "Terkunci selama 30 hari"
          }
          variant="locked"
        />
      </div>

      {/* LOCKED BREAKDOWN */}
      <Card className="relative z-10 bg-black/40 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-secondary">Locked Balance Breakdown</CardTitle>
          <CardDescription>Detail saldo yang terkunci</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {[
            ["Deposit Locked", wallet?.balance_deposit || 0],
            ["Reward Task Locked", wallet?.balance_reward_task || 0],
            ["Matching Bonus Locked", wallet?.balance_matching_lock || 0],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-secondary">{formatIDR(value)}</span>
            </div>
          ))}

          <div className="border-t pt-3 flex justify-between font-bold text-primary">
            <span>Total Locked</span>
            <span>{formatIDR(totalLocked)}</span>
          </div>
        </CardContent>
      </Card>

      {/* TRANSACTION HISTORY */}
      <Card className="relative z-10 bg-black/40 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-secondary">Transaction History</CardTitle>
          <CardDescription>Riwayat semua transaksi</CardDescription>
        </CardHeader>

        <CardContent>
          {/* FILTER */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Type" />
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                🚫 Belum ada transaksi
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="
                    flex flex-col sm:flex-row sm:items-center sm:justify-between
                    gap-3 p-4 rounded-xl
                    border border-white/10
                    bg-black/40 backdrop-blur
                    hover:border-cyan-400/40 transition
                  "
                >
                  <div className="flex-1">
                    <p className="font-medium">{getTypeLabel(tx.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString("id-ID")}
                    </p>

                    {tx.bank_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.bank_name} - {tx.bank_account}
                      </p>
                    )}

                    {tx.rejected_reason && (
                      <p className="text-xs text-red-400 mt-1">
                        Alasan: {tx.rejected_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span
                      className={cn(
                        "font-bold",
                        tx.amount > 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      )}
                    >
                      {formatIDR(tx.amount)}
                    </span>
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
