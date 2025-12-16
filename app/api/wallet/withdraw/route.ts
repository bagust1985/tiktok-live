import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount, bank_name, bank_account, account_name } =
      await request.json();

    // Mock validation
    if (!amount || !bank_name || !bank_account || !account_name) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap",
        },
        { status: 400 }
      );
    }

    // Mock available balance check
    const availableBalance = 50000;
    if (amount > availableBalance) {
      return NextResponse.json(
        {
          success: false,
          message: "Saldo tidak mencukupi",
        },
        { status: 400 }
      );
    }

    // Mock transaction creation
    const transaction = {
      id: Date.now().toString(),
      user_id: "1",
      type: "WD_AVAILABLE",
      amount,
      status: "PENDING" as const,
      bank_name,
      bank_account,
      account_name,
      created_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: "Withdraw berhasil diajukan, menunggu proses admin",
      data: transaction,
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

