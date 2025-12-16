import { Elysia, t } from "elysia";

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

        // Hash password with Bun
        const hashedPassword = await Bun.password.hash(password, {
          algorithm: "argon2id",
        });

        // Find sponsor if referral_code provided
        let sponsorId: string | null = null;
        if (referral_code) {
          const sponsor = await db.user.findUnique({
            where: { id: referral_code },
          });
          if (sponsor) {
            sponsorId = sponsor.id;
          }
        }

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

        const { password: _, ...userWithoutPassword } = user;

        // Generate JWT token (auto-login after register)
        const token = await jwt.sign({
          userId: user.id,
          username: user.username,
          is_admin: user.is_admin,
        });

        return {
          success: true,
          message: "Registrasi berhasil",
          user: userWithoutPassword,
          token,
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
        referral_code: t.Optional(t.String()),
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
  );

