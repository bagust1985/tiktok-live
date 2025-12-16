import { NextResponse } from "next/server";

// Mock task status
export async function GET() {
  const mockTaskLog = {
    id: "1",
    user_id: "1",
    date: new Date(),
    counter: 5,
    last_claim: new Date(Date.now() - 15000),
  };

  return NextResponse.json({
    success: true,
    data: mockTaskLog,
  });
}

