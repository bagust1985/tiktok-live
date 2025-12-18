import { Elysia, t } from "elysia";
import { sendOTPEmail } from "../services/email";
import { generateOTP, getOTPExpiryDate, isOTPExpired, isAttemptsExceeded, isValidOTPFormat } from "../services/otp";

export default new Elysia()
  .post(
    "/register",
    async ({ body, db, jwt, set }) => {
      try {
        const { username, email, password, referral_code } = body;

        // Validate input
        if (!username || !email || !password) {
          set.status = 400;
          return {
            success: false,
            message: "Username, email, dan password wajib diisi",
          };
        }

        if (!referral_code) {
          set.status = 400;
          return {
            success: false,
            message: "Kode referral wajib diisi",
          };
        }

        if (password.length < 6) {
          set.status = 400;
          return {
            success: false,
            message: "Password minimal 6 karakter",
          };
        }

        // Check if user already exists
        const existingUser = await db.user.findFirst({
          where: {
            OR: [{ username }, { email }],
          },
        });

        if (existingUser) {
          set.status = 400;
          return {
            success: false,
            message: "Username atau email sudah terdaftar",
          };
        }

        // Validate referral_code exists in database and is active
        const sponsor = await db.user.findUnique({
          where: { id: referral_code },
        });

        if (!sponsor) {
          set.status = 400;
          return {
            success: false,
            message: "Kode referral tidak valid atau tidak terdaftar",
          };
        }

        // Check if sponsor is active (only active users can have referral codes)
        if (!sponsor.is_active) {
          set.status = 400;
          return {
            success: false,
            message: "Kode referral tidak aktif. User sponsor belum melakukan deposit",
          };
        }

        // Hash password with Bun
        const hashedPassword = await Bun.password.hash(password, {
          algorithm: "argon2id",
        });

        // Use sponsor ID (referral_code is valid and active)
        const sponsorId = sponsor.id;

        // Create user
        const user = await db.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            tier_level: 0, // Free tier
            is_active: false, // Need deposit to activate
            sponsor_id: sponsorId,
            tos_agreed_at: new Date(), // Record ToS agreement timestamp
          },
        });

        // Create wallet for user
        await db.wallet.create({
          data: {
            user_id: user.id,
          },
        });

        // Create initial task log for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await db.taskLog.create({
          data: {
            user_id: user.id,
            date: today,
            counter: 0,
          },
        });

        // Generate OTP for email verification
        const otpCode = generateOTP();
        const expiresAt = getOTPExpiryDate();

        // Create email verification record
        await db.emailVerification.create({
          data: {
            user_id: user.id,
            otp_code: otpCode,
            expires_at: expiresAt,
            attempts: 0,
            verified: false,
          },
        });

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otpCode, username);
        if (!emailResult.success) {
          console.error("Failed to send OTP email:", emailResult.error);
          // Still return success but log the error
          // User can request resend if email fails
        }

        const { password: _, ...userWithoutPassword } = user;

        return {
          success: true,
          message: "Registrasi berhasil. Silakan cek email Anda untuk kode OTP verifikasi.",
          user: userWithoutPassword,
          requiresVerification: true,
        };
      } catch (error: any) {
        console.error("Register error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan saat registrasi",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
        referral_code: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, db, jwt, set }) => {
      try {
        const { username, password } = body;

        if (!username || !password) {
          set.status = 400;
          return {
            success: false,
            message: "Username dan password wajib diisi",
          };
        }

        // Find user
        const user = await db.user.findFirst({
          where: {
            OR: [{ username }, { email: username }],
          },
        });

        if (!user) {
          set.status = 401;
          return {
            success: false,
            message: "Username atau password salah",
          };
        }

        // Verify password
        const isValid = await Bun.password.verify(password, user.password);

        if (!isValid) {
          set.status = 401;
          return {
            success: false,
            message: "Username atau password salah",
          };
        }

        // Check if email is verified
        if (!user.email_verified) {
          set.status = 403;
          return {
            success: false,
            message: "Email belum terverifikasi. Silakan cek email Anda untuk kode OTP atau request kode baru.",
            requiresVerification: true,
          };
        }

        // Generate JWT token
        const token = await jwt.sign({
          userId: user.id,
          username: user.username,
          is_admin: user.is_admin,
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
          success: true,
          message: "Login berhasil",
          user: userWithoutPassword,
          token,
        };
      } catch (error: any) {
        console.error("Login error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan saat login",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  // Verify email with OTP
  .post(
    "/verify-email",
    async ({ body, db, jwt, set }) => {
      try {
        const { email, otp_code } = body;

        if (!email || !otp_code) {
          set.status = 400;
          return {
            success: false,
            message: "Email dan kode OTP wajib diisi",
          };
        }

        // Validate OTP format
        if (!isValidOTPFormat(otp_code)) {
          set.status = 400;
          return {
            success: false,
            message: "Format OTP tidak valid. OTP harus 6 digit angka",
          };
        }

        // Find user
        const user = await db.user.findUnique({
          where: { email },
          include: { emailVerification: true },
        });

        if (!user) {
          set.status = 404;
          return {
            success: false,
            message: "User tidak ditemukan",
          };
        }

        // Check if already verified
        if (user.email_verified) {
          set.status = 400;
          return {
            success: false,
            message: "Email sudah terverifikasi",
          };
        }

        // Check if email verification record exists
        if (!user.emailVerification) {
          set.status = 400;
          return {
            success: false,
            message: "Kode OTP tidak ditemukan. Silakan request kode OTP baru",
          };
        }

        const emailVerification = user.emailVerification;

        // Check if already verified
        if (emailVerification.verified) {
          set.status = 400;
          return {
            success: false,
            message: "Email sudah terverifikasi",
          };
        }

        // Check if OTP expired
        if (isOTPExpired(emailVerification.expires_at)) {
          set.status = 400;
          return {
            success: false,
            message: "Kode OTP sudah kedaluwarsa. Silakan request kode OTP baru",
          };
        }

        // Check if attempts exceeded
        if (isAttemptsExceeded(emailVerification.attempts)) {
          set.status = 400;
          return {
            success: false,
            message: "Batas percobaan verifikasi telah habis. Silakan request kode OTP baru",
          };
        }

        // Verify OTP code
        if (emailVerification.otp_code !== otp_code) {
          // Increment attempts
          await db.emailVerification.update({
            where: { user_id: user.id },
            data: { attempts: emailVerification.attempts + 1 },
          });

          set.status = 400;
          return {
            success: false,
            message: "Kode OTP salah",
          };
        }

        // OTP is correct - verify email
        await db.user.update({
          where: { id: user.id },
          data: {
            email_verified: true,
            email_verified_at: new Date(),
          },
        });

        await db.emailVerification.update({
          where: { user_id: user.id },
          data: {
            verified: true,
          },
        });

        // Generate JWT token for auto-login
        const token = await jwt.sign({
          userId: user.id,
          username: user.username,
          is_admin: user.is_admin,
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
          success: true,
          message: "Email berhasil diverifikasi",
          user: { ...userWithoutPassword, email_verified: true },
          token,
        };
      } catch (error: any) {
        console.error("Verify email error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan saat verifikasi email",
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        otp_code: t.String(),
      }),
    }
  )
  // Resend OTP
  .post(
    "/resend-otp",
    async ({ body, db, set }) => {
      try {
        const { email } = body;

        if (!email) {
          set.status = 400;
          return {
            success: false,
            message: "Email wajib diisi",
          };
        }

        // Find user
        const user = await db.user.findUnique({
          where: { email },
          include: { emailVerification: true },
        });

        if (!user) {
          set.status = 404;
          return {
            success: false,
            message: "User tidak ditemukan",
          };
        }

        // Check if already verified
        if (user.email_verified) {
          set.status = 400;
          return {
            success: false,
            message: "Email sudah terverifikasi",
          };
        }

        // Generate new OTP
        const otpCode = generateOTP();
        const expiresAt = getOTPExpiryDate();

        // Update or create email verification record
        if (user.emailVerification) {
          await db.emailVerification.update({
            where: { user_id: user.id },
            data: {
              otp_code: otpCode,
              expires_at: expiresAt,
              attempts: 0, // Reset attempts
              verified: false,
            },
          });
        } else {
          await db.emailVerification.create({
            data: {
              user_id: user.id,
              otp_code: otpCode,
              expires_at: expiresAt,
              attempts: 0,
              verified: false,
            },
          });
        }

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otpCode, user.username);
        if (!emailResult.success) {
          console.error("Failed to send OTP email:", emailResult.error);
          set.status = 500;
          return {
            success: false,
            message: "Gagal mengirim email. Silakan coba lagi",
          };
        }

        return {
          success: true,
          message: "Kode OTP baru telah dikirim ke email Anda",
        };
      } catch (error: any) {
        console.error("Resend OTP error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan saat mengirim OTP",
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
      }),
    }
  );

