import { NextResponse } from "next/server";

// Mock task data - in real app, this would check database
const mockTaskLog = {
  id: "1",
  user_id: "1",
  date: new Date(),
  counter: 5,
  last_claim: new Date(Date.now() - 15000), // 15 seconds ago
};

export async function POST(request: Request) {
  try {
    // Mock validation
    const now = new Date();
    const lastClaim = mockTaskLog.last_claim
      ? new Date(mockTaskLog.last_claim)
      : null;

    // Check rate limit
    if (lastClaim) {
      const diff = (now.getTime() - lastClaim.getTime()) / 1000;
      if (diff < 10) {
        return NextResponse.json(
          {
            success: false,
            message: `Tunggu ${Math.ceil(10 - diff)} detik lagi`,
          },
          { status: 429 }
        );
      }
    }

    // Check task limit
    if (mockTaskLog.counter >= 20) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda sudah mencapai batas task harian (20 task)",
        },
        { status: 400 }
      );
    }

    // Mock success - increment counter
    mockTaskLog.counter += 1;
    mockTaskLog.last_claim = now;

    // Mock reward (Level 3: Rp 1.250)
    const reward = 1250;

    return NextResponse.json({
      success: true,
      message: "Task berhasil diklaim!",
      data: {
        counter: mockTaskLog.counter,
        reward,
        nextClaimAvailable: new Date(now.getTime() + 10000),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan",
      },
      { status: 500 }
    );
  }
}

