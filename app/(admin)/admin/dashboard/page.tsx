"use client";

import { useEffect, useCallback } from "react";
import { useAdminStore } from "@/store/adminStore";
import { getAdminStats } from "@/lib/api-admin";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Wallet, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { stats, setStats } = useAdminStore();
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    try {
      const response: any = await getAdminStats();
      if (response.success) {
        setStats(response.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat statistik",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  }, [setStats, toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview platform Tiktok Live&Like
        </p>
      </div>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.active} aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.newToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.newThisMonth} bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions.pendingDeposits}</div>
            <Link href="/admin/transactions?status=PENDING&type=DEPOSIT">
              <Button variant="link" className="p-0 h-auto text-xs">
                Review sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions.pendingWithdrawals}</div>
            <Link href="/admin/transactions?status=PENDING&type=WD_AVAILABLE">
              <Button variant="link" className="p-0 h-auto text-xs">
                Review sekarang
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Financial Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Deposits</CardTitle>
            <CardDescription>Semua deposit yang berhasil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(stats.transactions.totalDeposits)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Withdrawals</CardTitle>
            <CardDescription>Semua withdrawal yang berhasil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(stats.transactions.totalWithdrawals)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Locked Balance</CardTitle>
            <CardDescription>Saldo terkunci di platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR(stats.wallets.totalLocked)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Transactions Today</p>
              <p className="text-2xl font-bold">{stats.transactions.today}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transactions This Month</p>
              <p className="text-2xl font-bold">{stats.transactions.thisMonth}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/admin/transactions?status=PENDING">
          <Button>
            <CreditCard className="mr-2 h-4 w-4" />
            Review Pending Transactions
          </Button>
        </Link>
        <Link href="/admin/users">
          <Button variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
        </Link>
      </div>
    </div>
  );
}

