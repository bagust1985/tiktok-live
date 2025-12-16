/**
 * Membership Tier Definitions
 */
export interface MembershipTier {
  level: 1 | 2 | 3;
  name: string;
  deposit: number; // IDR
  rewardPerTask: number; // IDR
  maxTasks: number;
  dailyIncome: number; // IDR (rewardPerTask * maxTasks)
  totalIncome30Days: number; // IDR (dailyIncome * 30)
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    level: 3,
    name: "Level 3",
    deposit: 500000,
    rewardPerTask: 1250,
    maxTasks: 20,
    dailyIncome: 25000, // 1250 * 20
    totalIncome30Days: 750000, // 25000 * 30
  },
  {
    level: 2,
    name: "Level 2",
    deposit: 1000000,
    rewardPerTask: 2500,
    maxTasks: 20,
    dailyIncome: 50000, // 2500 * 20
    totalIncome30Days: 1500000, // 50000 * 30
  },
  {
    level: 1,
    name: "Level 1",
    deposit: 5000000,
    rewardPerTask: 12500,
    maxTasks: 20,
    dailyIncome: 250000, // 12500 * 20
    totalIncome30Days: 7500000, // 250000 * 30
  },
];

/**
 * System Constants
 */
export const MAX_TASKS_PER_DAY = 20;
export const TASK_DURATION_SECONDS = 15;
export const TASK_RATE_LIMIT_SECONDS = 10; // Minimum seconds between tasks
export const LOCK_PERIOD_DAYS = 30;

