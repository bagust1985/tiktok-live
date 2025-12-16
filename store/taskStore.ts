"use client";

import { create } from "zustand";
import type { TaskLog } from "@/types";

interface TaskState {
  taskLog: TaskLog | null;
  lastClaimTime: Date | null;
  setTaskLog: (taskLog: TaskLog) => void;
  incrementCounter: () => void;
  resetDaily: () => void;
  setLastClaimTime: (time: Date) => void;
  canClaim: () => boolean;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  taskLog: null,
  lastClaimTime: null,
  setTaskLog: (taskLog) => set({ taskLog }),
  incrementCounter: () => {
    const current = get().taskLog;
    if (current && current.counter < 20) {
      set({
        taskLog: {
          ...current,
          counter: current.counter + 1,
          last_claim: new Date(),
        },
      });
    }
  },
  resetDaily: () => {
    const current = get().taskLog;
    if (current) {
      set({
        taskLog: {
          ...current,
          counter: 0,
          date: new Date(),
          last_claim: null,
        },
      });
    }
  },
  setLastClaimTime: (time) => set({ lastClaimTime: time }),
  canClaim: () => {
    const { taskLog, lastClaimTime } = get();
    if (!taskLog) return false;
    if (taskLog.counter >= 20) return false;
    if (!lastClaimTime) return true;
    
    const now = new Date();
    const diff = (now.getTime() - lastClaimTime.getTime()) / 1000;
    return diff >= 10; // 10 seconds rate limit
  },
}));

