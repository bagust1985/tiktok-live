"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskResetTimerProps {
  onReset?: () => void;
}

export default function TaskResetTimer({ onReset }: TaskResetTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        // Already past midnight, calculate for next midnight
        const nextMidnight = new Date(now);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);
        const newDiff = nextMidnight.getTime() - now.getTime();

        const hours = Math.floor(newDiff / (1000 * 60 * 60));
        const minutes = Math.floor((newDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((newDiff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Calculate immediately
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      // If timer reaches zero, trigger reset callback
      if (remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
        if (onReset) {
          onReset();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onReset]);

  if (!timeRemaining) {
    return null;
  }

  const formatTime = (value: number) => value.toString().padStart(2, "0");

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center gap-3 py-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Reset Task Dalam</p>
          <p className="text-2xl font-bold font-mono">
            {formatTime(timeRemaining.hours)}:
            {formatTime(timeRemaining.minutes)}:
            {formatTime(timeRemaining.seconds)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Task akan reset pada pukul 00:00
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

