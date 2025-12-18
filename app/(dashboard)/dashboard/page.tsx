"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { getWalletBalance, getTaskStatus } from "@/lib/api";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, Lock, TrendingUp, CheckSquare } from "lucide-react";
import HelpCenter from "@/components/help/HelpCenter";

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, setWallet } = useWalletStore();
  const { taskLog, setTaskLog } = useTaskStore();
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialize auth from storage
    initFromStorage();

    // Load wallet balance
    getWalletBalance().then((response: any) => {
      if (response.success) {
        setWallet(response.data);
      }
    });

    // Load task status
    getTaskStatus().then((response: any) => {
      if (response.success) {
        setTaskLog(response.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setWallet, setTaskLog]);

  const totalLocked =
    (wallet?.balance_deposit || 0) +
    (wallet?.balance_reward_task || 0) +
    (wallet?.balance_matching_lock || 0);

  const taskProgress = taskLog ? (taskLog.counter / 20) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Lihat ringkasan akun Anda.
        </p>
      </div>

      {/* Wallet Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatIDR(wallet?.balance_available || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bisa ditarik kapan saja
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Balance</CardTitle>
            <Lock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatIDR(totalLocked)}
            </div>
            <p className="text-xs text-muted-foreground">
              Terkunci hingga {wallet?.unlock_date ? new Date(wallet.unlock_date).toLocaleDateString('id-ID') : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
            <CheckSquare className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskLog?.counter || 0} / 20
            </div>
            <p className="text-xs text-muted-foreground">
              Task hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Today</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatIDR((taskLog?.counter || 0) * 1250)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari task hari ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Help Center */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Akses cepat ke fitur utama
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="default">
              <Link href="/tasks">
                Mulai Kerjakan Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/deposit">
                Deposit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href="/withdraw">
                Withdraw
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Locked Balance Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Locked Balance Breakdown</CardTitle>
            <CardDescription>
              Detail saldo yang terkunci
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="border-t pt-4 flex justify-between items-center font-bold">
              <span>Total Locked</span>
              <span>{formatIDR(totalLocked)}</span>
            </div>
            {wallet?.unlock_date && (
              <p className="text-sm text-muted-foreground">
                Unlock Date: {new Date(wallet.unlock_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Center */}
      <HelpCenter />
    </div>
  );
}

