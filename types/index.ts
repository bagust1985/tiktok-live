/**
 * Additional Types
 */
export interface NetworkStats {
  totalDownlines: number;
  leftCount: number;
  rightCount: number;
  totalDepositFromNetwork: number;
  sponsorBonusToday: number;
  sponsorBonusThisMonth: number;
  pairingBonusToday: number;
  pairingBonusThisMonth: number;
  matchingBonusToday: number;
  matchingBonusThisMonth: number;
  matchingBonusByLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
}

// Import all types
export * from './user';
export * from './wallet';
export * from './task';

