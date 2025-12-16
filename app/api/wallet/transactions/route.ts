import { NextResponse } from "next/server";

// Mock transactions
const mockTransactions = [
  {
    id: "1",
    user_id: "1",
    type: "DEPOSIT",
    amount: 500000,
    status: "SUCCESS",
    proof_image_url: "/uploads/proof1.jpg",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    user_id: "1",
    type: "REWARD_TASK",
    amount: 1250,
    status: "SUCCESS",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    user_id: "1",
    type: "BONUS_SPONSOR",
    amount: 50000,
    status: "SUCCESS",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    user_id: "1",
    type: "WD_AVAILABLE",
    amount: 25000,
    status: "PENDING",
    bank_name: "BCA",
    bank_account: "1234567890",
    account_name: "Test User",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let filtered = [...mockTransactions];

  if (type) {
    filtered = filtered.filter((t) => t.type === type);
  }

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

