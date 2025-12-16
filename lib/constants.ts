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
  totalIncome90Days: number; // IDR (dailyIncome * 90)
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    level: 3,
    name: 'Level 3',
    deposit: 500000,
    rewardPerTask: 1250,
    maxTasks: 20,
    dailyIncome: 25000, // 1250 * 20
    totalIncome90Days: 2250000, // 25000 * 90
  },
  {
    level: 2,
    name: 'Level 2',
    deposit: 1000000,
    rewardPerTask: 2500,
    maxTasks: 20,
    dailyIncome: 50000, // 2500 * 20
    totalIncome90Days: 4500000, // 50000 * 90
  },
  {
    level: 1,
    name: 'Level 1',
    deposit: 5000000,
    rewardPerTask: 12500,
    maxTasks: 20,
    dailyIncome: 250000, // 12500 * 20
    totalIncome90Days: 22500000, // 250000 * 90
  },
];

/**
 * Admin Bank Accounts for Deposit
 */
export interface BankAccount {
  bank: string;
  account: string;
  name: string;
}

export const ADMIN_BANK_ACCOUNTS: BankAccount[] = [
  {
    bank: 'BCA',
    account: '1234567890',
    name: 'PT Tiktok Live&Like',
  },
  {
    bank: 'Mandiri',
    account: '9876543210',
    name: 'PT Tiktok Live&Like',
  },
];

/**
 * Common Bank List for Withdraw
 */
export const BANK_LIST = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'CIMB Niaga',
  'Bank Danamon',
  'Bank Permata',
  'Bank BCA Syariah',
  'Bank Mandiri Syariah',
  'Bank BRI Syariah',
  'Bank BNI Syariah',
  'Lainnya',
];

/**
 * System Constants
 */
export const MAX_TASKS_PER_DAY = 20;
export const TASK_DURATION_SECONDS = 15;
export const TASK_RATE_LIMIT_SECONDS = 10; // Minimum seconds between tasks
export const LOCK_PERIOD_DAYS = 90;

/**
 * Withdraw Constants
 */
export const MIN_WITHDRAW_AMOUNT = 50000; // Rp 50.000
export const WITHDRAW_ADMIN_FEE = 0; // No admin fee

