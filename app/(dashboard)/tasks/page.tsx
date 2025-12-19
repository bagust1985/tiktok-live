"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useWalletStore } from "@/store/walletStore";
import { getTaskStatus, getWalletBalance, getTaskConfigs } from "@/lib/api";
import TaskButton from "@/components/task/TaskButton";
import TaskProgress from "@/components/task/TaskProgress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MEMBERSHIP_TIERS } from "@/lib/constants";

export default function TasksPage() {
  const { taskLog, setTaskLog, canClaim, setLastClaimTime } = useTaskStore();
  const { wallet, setWallet } = useWalletStore();

  const [nextClaimAvailable, setNextClaimAvailable] = useState<Date>();
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);
  const [taskConfigs, setTaskConfigs] = useState<any[]>([]);

  useEffect(() => {
    getTaskStatus().then((res) => {
      if (res.success) {
        setTaskLog(res.data);
        setHasEnoughBalance(res.data.hasEnoughBalance !== false);

        if (res.data.last_claim) {
          const lastClaim = new Date(res.data.last_claim);
          setLastClaimTime(lastClaim);
          setNextClaimAvailable(
            new Date(lastClaim.getTime() + 10_000)
          );
        }
      }
    });

    getWalletBalance().then((res) => {
      if (res.success) setWallet(res.data);
    });

    getTaskConfigs().then((res) => {
      if (res.success) setTaskConfigs(res.data || []);
    });
  }, [setTaskLog, setWallet, setLastClaimTime]);

  const userTier =
    wallet?.balance_deposit
      ? MEMBERSHIP_TIERS.find(
          (t) => t.deposit === wallet.balance_deposit
        ) || MEMBERSHIP_TIERS[2]
      : MEMBERSHIP_TIERS[2];

  const currentCount = taskLog?.counter || 0;
  const maxCount = 20;
  const rewardPerTask = userTier.rewardPerTask;

  const checkCanClaim = (taskNum: number) => {
    if (taskNum <= currentCount) return false;
    if (currentCount >= maxCount) return false;
    if (!hasEnoughBalance) return false;
    if (!canClaim()) return false;
    if (nextClaimAvailable && new Date() < nextClaimAvailable) return false;
    return true;
  };

  return (
    <div className="relative space-y-8 px-4 py-6 md:px-6 lg:px-8">
      {/* Neon background */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-0 -right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Kerjakan Task
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Selesaikan 20 task per hari untuk mendapatkan reward
        </p>
      </div>

      {/* PROGRESS */}
      <div className="relative z-10">
        <TaskProgress
          current={currentCount}
          max={maxCount}
          rewardPerTask={rewardPerTask}
        />
      </div>

      {/* INFO CARD */}
      <Card className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">
            Informasi Task
          </CardTitle>
          <CardDescription className="text-gray-400">
            Cara mengerjakan task dengan benar
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-gray-300">
          {!hasEnoughBalance && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              ⚠ Deposit tidak mencukupi untuk tier Anda.  
              Lakukan deposit sesuai tier untuk mengerjakan task.
            </div>
          )}

          <ul className="space-y-1 list-disc list-inside">
            <li>Klik tombol task untuk membuka aplikasi TikTok</li>
            <li>Tonton video minimal 15 detik</li>
            <li>Kembali ke halaman ini, task otomatis terklaim</li>
            <li>Maksimal 20 task per hari</li>
            <li>Minimal 10 detik jeda antar task</li>
          </ul>

          <p className="pt-2 font-semibold text-cyan-400">
            Reward per task: Rp{" "}
            {rewardPerTask.toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>

      {/* TASK LIST */}
      <div className="relative z-10 space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-white">
          Daftar Task
        </h2>

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-1
            md:grid-cols-1
            lg:grid-cols-2
            gap-3
          "
        >
          {Array.from({ length: maxCount }, (_, i) => i + 1).map(
            (taskNum) => {
              const taskConfig = taskConfigs.find(
                (tc) => tc.sequence === taskNum
              );

              return (
                <TaskButton
                  key={taskNum}
                  taskNumber={taskNum}
                  currentCount={currentCount}
                  maxCount={maxCount}
                  canClaim={checkCanClaim(taskNum)}
                  hasEnoughBalance={hasEnoughBalance}
                  nextClaimAvailable={nextClaimAvailable}
                  taskConfig={taskConfig}
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
