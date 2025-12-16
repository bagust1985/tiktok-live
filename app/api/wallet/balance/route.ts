import { NextResponse } from "next/server";

// Mock wallet data
export async function GET() {
  const mockWallet = {
    id: "1",
    user_id: "1",
    balance_deposit: 500000, // Locked
    balance_reward_task: 6250, // Locked (5 tasks * 1250)
    balance_matching_lock: 0, // Locked
    balance_available: 50000, // Available (sponsor + pairing bonus)
    unlock_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    updated_at: new Date(),
  };

  return NextResponse.json({
    success: true,
    data: mockWallet,
  });
}

