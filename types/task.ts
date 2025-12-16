/**
 * Task Types
 */
export interface TaskLog {
  id: string;
  user_id: string;
  date: Date;
  counter: number; // Progress: 0-20
  last_claim: Date | null; // Timestamp claim terakhir (Rate Limit)
}

export interface TaskStatus {
  currentCount: number;
  maxCount: number;
  canClaim: boolean;
  nextClaimAvailable?: Date; // Jika masih dalam rate limit
  dailyResetTime: Date; // Waktu reset harian (00:00)
}

