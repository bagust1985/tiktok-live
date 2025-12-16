import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tier_level = parseInt(formData.get("tier_level") as string);
    const amount = parseFloat(formData.get("amount") as string);
    const proof_image = formData.get("proof_image") as File;
    const notes = formData.get("notes") as string | null;

    // Mock validation
    if (!tier_level || !amount || !proof_image) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak lengkap",
        },
        { status: 400 }
      );
    }

    // Mock transaction creation
    const transaction = {
      id: Date.now().toString(),
      user_id: "1",
      type: "DEPOSIT",
      amount,
      status: "PENDING" as const,
      proof_image_url: "/uploads/proof.jpg", // Mock URL
      notes: notes || undefined,
      created_at: new Date(),
    };

    return NextResponse.json({
      success: true,
      message: "Deposit berhasil diajukan, menunggu verifikasi admin",
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

