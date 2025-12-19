import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendOTPEmail(
  email: string,
  otpCode: string,
  username: string
): Promise<{ success: boolean; error?: any }> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verifikasi Email - TiktokAsia',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Verifikasi Email Anda</h2>
            <p>Halo <strong>${username}</strong>,</p>
            <p>Terima kasih telah mendaftar di TiktokAsia. Untuk menyelesaikan pendaftaran, silakan masukkan kode OTP berikut:</p>
            <div style="background-color: #fff; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #ddd; border-radius: 10px;">
              <h1 style="color: #0066cc; font-size: 48px; letter-spacing: 10px; margin: 0; font-weight: bold;">${otpCode}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">Kode OTP ini berlaku selama <strong>15 menit</strong>.</p>
            <p style="color: #666; font-size: 14px;">Jika Anda tidak mendaftar di TiktokAsia, abaikan email ini.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">Terima kasih,<br>Tim TiktokAsia</p>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

