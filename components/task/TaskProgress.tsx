"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const progress = (current / max) * 100;
  const totalReward = current * rewardPerTask;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Task Hari Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              {current} / {max} Task
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm font-medium">Reward Hari Ini:</span>
          <span className="text-lg font-bold text-primary">
            Rp {totalReward.toLocaleString("id-ID")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Reward akan masuk ke saldo locked dan dapat ditarik setelah 30 hari
        </p>
      </CardContent>
    </Card>
  );
}

