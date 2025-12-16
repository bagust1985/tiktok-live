import { NextResponse } from "next/server";

// Mock network stats
export async function GET() {
  const mockStats = {
    totalDownlines: 15,
    leftCount: 8,
    rightCount: 7,
    totalDepositFromNetwork: 7500000,
    sponsorBonusToday: 50000,
    sponsorBonusThisMonth: 500000,
    pairingBonusToday: 25000,
    pairingBonusThisMonth: 300000,
    matchingBonusToday: 15000,
    matchingBonusThisMonth: 200000,
    matchingBonusByLevel: {
      level1: 10000,
      level2: 3000,
      level3: 2000,
    },
  };

  return NextResponse.json({
    success: true,
    data: mockStats,
  });
}

