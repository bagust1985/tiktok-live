/**
 * User/Member Types
 */
import type { Wallet } from './wallet';
import type { TaskLog } from './task';
import type { NetworkStats } from './index';

export type TierLevel = 0 | 1 | 2 | 3; // 0 = Free, 1-3 = Paid tiers
export type BinaryPosition = 'LEFT' | 'RIGHT' | null;

export interface User {
  id: string;
  username: string;
  email: string;
  tier_level: TierLevel;
  is_active: boolean;
  is_admin?: boolean;
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  sponsor_id: string | null;
  upline_binary_id: string | null;
  position: BinaryPosition;
  created_at: Date;
}

export interface UserProfile extends User {
  wallet?: Wallet;
  taskLog?: TaskLog;
  networkStats?: NetworkStats;
}

