/**
 * Wallet & Transaction Types
 */
export type TransactionType = 
  | 'DEPOSIT' 
  | 'WD_AVAILABLE' 
  | 'WD_LOCKED' 
  | 'BONUS_SPONSOR' 
  | 'BONUS_PAIRING' 
  | 'BONUS_MATCHING' 
  | 'REWARD_TASK';

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'REJECTED';

export interface Wallet {
  id: string;
  user_id: string;
  
  // Locked Balances (cair setelah 30 hari)
  balance_deposit: number; // Modal awal
  balance_reward_task: number; // Gaji harian dari task
  balance_matching_lock: number; // Bonus matching dari downline
  
  unlock_date: Date | null; // Tanggal jatuh tempo (H+30)
  
  // Available Balance (cair kapan saja)
  balance_available: number; // Bonus sponsor & pairing
  
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  proof_image_url?: string; // Untuk deposit: bukti transfer
  bank_account?: string; // Untuk withdraw: rekening tujuan
  bank_name?: string;
  account_name?: string;
  notes?: string;
  rejected_reason?: string; // Jika status REJECTED
  created_at: Date;
}

