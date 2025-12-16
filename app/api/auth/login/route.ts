import { NextResponse } from "next/server";

// Mock user data
const mockUser = {
  id: "1",
  username: "testuser",
  email: "test@example.com",
  password: "123456", // In real app, this should be hashed
  tier_level: 3,
  is_active: true,
  sponsor_id: null,
  upline_binary_id: null,
  position: null,
  created_at: new Date(),
};

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Mock authentication
    if (username === mockUser.username && password === mockUser.password) {
      const { password: _, ...userWithoutPassword } = mockUser;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Username atau password salah",
      },
      { status: 401 }
    );
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

