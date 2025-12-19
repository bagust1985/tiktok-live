"use client";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TaskProgressProps {
  current: number;
  max: number;
  rewardPerTask: number;
}

export default function TaskProgress({
  current,
  max,
  rewardPerTask,
}: TaskProgressProps) {
  const progress = Math.min((current / max) * 100, 100);
  const totalReward = current * rewardPerTask;

  return (
    <Card
      className="
        relative overflow-hidden
        bg-white/5
        border border-white/10
        backdrop-blur-xl
      "
    >
      {/* Neon glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-3xl rounded-full" />

      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base md:text-lg">
          Progress Task Hari Ini
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Progress info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-300">
              {current} / {max} Task
            </span>
            <span className="text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <Progress
              value={progress}
              className="h-2 bg-white/10"
            />
            {/* Glow overlay */}
            <div
              className="
                pointer-events-none
                absolute inset-0
                rounded-full
                shadow-[0_0_12px_rgba(34,211,238,0.6)]
              "
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reward */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <span className="text-sm text-gray-300">
            Reward Hari Ini
          </span>
          <span className="text-lg md:text-xl font-bold text-cyan-400">
            Rp {totalReward.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-400 leading-relaxed">
          Reward akan masuk ke <span className="text-white">saldo locked</span>{" "}
          dan dapat ditarik setelah <span className="text-white">30 hari</span>.
        </p>
      </CardContent>

      {/* Bottom neon line */}
      <div
        className="
          absolute bottom-0 left-0 right-0 h-[1px]
          bg-gradient-to-r
          from-transparent
          via-cyan-400/70
          to-transparent
        "
      />
    </Card>
  );
}
