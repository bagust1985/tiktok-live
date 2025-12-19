"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useWalletStore } from "@/store/walletStore";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { getWalletBalance, getTaskStatus } from "@/lib/api";
import { formatIDR } from "@/lib/format";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ArrowRight,
  Wallet,
  Lock,
  TrendingUp,
  CheckSquare,
} from "lucide-react";

import HelpCenter from "@/components/help/HelpCenter";

export default function DashboardPage() {
  const { wallet, setWallet } = useWalletStore();
  const { taskLog, setTaskLog } = useTaskStore();
  const { initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();

    getWalletBalance().then((res) => {
      if (res.success) setWallet(res.data);
    });

    getTaskStatus().then((res) => {
      if (res.success) setTaskLog(res.data);
    });
  }, [setWallet, setTaskLog]);

  const totalLocked =
    (wallet?.balance_deposit || 0) +
    (wallet?.balance_reward_task || 0) +
    (wallet?.balance_matching_lock || 0);

  const taskProgress = taskLog ? (taskLog.counter / 20) * 100 : 0;

  return (
    <div className="relative min-h-screen space-y-8 bg-black px-4 py-2 md:px-8 lg:px-10">
      {/* Neon blobs */}
      <div className="absolute -top-32 -left-32 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-[280px] h-[280px] md:w-[500px] md:h-[500px] bg-pink-500/20 blur-3xl rounded-full" />

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Selamat datang kembali 👋
        </p>
      </motion.div>

      {/* Summary */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Available Balance"
          value={formatIDR(wallet?.balance_available || 0)}
          icon={<Wallet className="h-4 w-4 text-cyan-400" />}
          color="text-cyan-400"
          desc="Bisa ditarik kapan saja"
        />

        <SummaryCard
          title="Locked Balance"
          value={formatIDR(totalLocked)}
          icon={<Lock className="h-4 w-4 text-pink-400" />}
          color="text-pink-400"
          desc={
            wallet?.unlock_date
              ? `Terkunci hingga ${new Date(
                  wallet.unlock_date
                ).toLocaleDateString("id-ID")}`
              : "Belum ada tanggal"
          }
        />

        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-gray-300">
              Task Hari Ini
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {taskLog?.counter || 0} / 20
            </div>
            <div className="h-2 mt-2 rounded bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-pink-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <SummaryCard
          title="Income Today"
          value={formatIDR((taskLog?.counter || 0) * 1250)}
          icon={<TrendingUp className="h-4 w-4 text-green-400" />}
          color="text-green-400"
          desc="Dari task hari ini"
        />
      </div>

      {/* Actions + breakdown */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Actions */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Akses cepat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ActionButton href="/tasks" label="Mulai Task" />
            <ActionButton href="/deposit" label="Deposit"   />
            <ActionButton href="/withdraw" label="Withdraw"  />
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card className="md:col-span-2 bg-white/5 border border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">
              Locked Balance Detail
            </CardTitle>
            <CardDescription className="text-gray-400">
              Rincian saldo terkunci
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            <Row label="Deposit Locked" value={wallet?.balance_deposit} />
            <Row label="Reward Task Locked" value={wallet?.balance_reward_task} />
            <Row label="Matching Bonus Locked" value={wallet?.balance_matching_lock} />

            <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-white">
              <span>Total Locked</span>
              <span>{formatIDR(totalLocked)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help */}
      <div className="relative z-10">
        <HelpCenter />
      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function SummaryCard({ title, value, icon, color, desc }: any) {
  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-gray-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-xl md:text-2xl font-bold ${color}`}>
          {value}
        </div>
        <p className="text-xs text-gray-400">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ActionButton({ href, label, outline }: any) {
  return (
    <Button
      asChild
      variant={outline ? "outline" : "default"}
      className={
        outline
          ? "w-full border-white/20 text-white"
          : "w-full bg-gradient-to-r from-cyan-400 to-pink-500 text-black"
      }
    >
      <Link href={href}>
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{formatIDR(value || 0)}</span>
    </div>
  );
}
