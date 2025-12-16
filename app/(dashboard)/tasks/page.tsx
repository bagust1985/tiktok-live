"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useWalletStore } from "@/store/walletStore";
import { getTaskStatus, getWalletBalance, getTaskConfigs } from "@/lib/api";
import TaskButton from "@/components/task/TaskButton";
import TaskProgress from "@/components/task/TaskProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MEMBERSHIP_TIERS } from "@/lib/constants";

export default function TasksPage() {
  const { taskLog, setTaskLog, canClaim, setLastClaimTime } = useTaskStore();
  const { wallet, setWallet } = useWalletStore();
  const [nextClaimAvailable, setNextClaimAvailable] = useState<Date | undefined>();
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true);
  const [taskConfigs, setTaskConfigs] = useState<any[]>([]);

  useEffect(() => {
    // Load task status
    getTaskStatus().then((response) => {
      if (response.success) {
        setTaskLog(response.data);
        setHasEnoughBalance(response.data.hasEnoughBalance !== false);
        if (response.data.last_claim) {
          const lastClaim = new Date(response.data.last_claim);
          const nextClaim = new Date(lastClaim.getTime() + 10000); // 10 seconds rate limit
          setNextClaimAvailable(nextClaim);
          setLastClaimTime(lastClaim);
        }
      }
    });

    // Load wallet to get tier level for reward calculation
    getWalletBalance().then((response) => {
      if (response.success) {
        setWallet(response.data);
      }
    });

    // Load task configs
    getTaskConfigs().then((response) => {
      if (response.success) {
        setTaskConfigs(response.data || []);
      }
    });
  }, [setTaskLog, setWallet, setLastClaimTime]);

  // Get user tier - default to Level 3 for now
  const userTier = wallet?.balance_deposit
    ? MEMBERSHIP_TIERS.find((t) => t.deposit === wallet.balance_deposit) || MEMBERSHIP_TIERS[2]
    : MEMBERSHIP_TIERS[2]; // Default Level 3

  const currentCount = taskLog?.counter || 0;
  const maxCount = 20;
  const rewardPerTask = userTier.rewardPerTask;

  // Check if can claim (rate limit check + balance check)
  const checkCanClaim = (taskNum: number) => {
    if (taskNum <= currentCount) return false; // Already completed
    if (currentCount >= maxCount) return false; // Daily limit reached
    if (!hasEnoughBalance) return false; // Balance not enough
    if (!canClaim()) return false; // Rate limit active
    if (nextClaimAvailable && new Date() < nextClaimAvailable) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kerjakan Task</h1>
        <p className="text-muted-foreground">
          Selesaikan 20 task per hari untuk mendapatkan reward
        </p>
      </div>

      {/* Task Progress */}
      <TaskProgress
        current={currentCount}
        max={maxCount}
        rewardPerTask={rewardPerTask}
      />

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Task</CardTitle>
          <CardDescription>
            Cara mengerjakan task dengan benar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!hasEnoughBalance && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mb-2">
              <p className="font-medium text-destructive">
                ⚠ Deposit tidak mencukupi untuk tier Anda. Lakukan deposit sesuai tier untuk mengerjakan task.
              </p>
            </div>
          )}
          <p>• Klik tombol task untuk membuka aplikasi TikTok</p>
          <p>• Tonton video yang ditampilkan selama minimal 15 detik</p>
          <p>• Kembali ke halaman ini, task akan otomatis terklaim</p>
          <p>• Maksimal 20 task per hari</p>
          <p>• Minimal 10 detik jeda antar task</p>
          <p className="pt-2 font-medium text-primary">
            Reward per task: Rp {rewardPerTask.toLocaleString("id-ID")}
          </p>
        </CardContent>
      </Card>

      {/* Task Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Daftar Task</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: maxCount }, (_, i) => i + 1).map((taskNum) => {
            const taskConfig = taskConfigs.find((tc) => tc.sequence === taskNum);
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
          })}
        </div>
      </div>
    </div>
  );
}

