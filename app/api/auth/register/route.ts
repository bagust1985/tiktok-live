import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, email, password, referral_code } = await request.json();

    // Mock registration - always succeed
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      tier_level: 0, // Free tier
      is_active: false, // Need deposit to activate
      sponsor_id: referral_code || null,
      upline_binary_id: null,
      position: null,
      created_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "Registrasi berhasil",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat registrasi",
      },
      { status: 500 }
    );
  }
}

