import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

export default new Elysia()
  .use(authMiddleware)
  .get("/profile", async ({ userId, db, set }) => {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          wallet: true,
        },
      });

      if (!user) {
        set.status = 404;
        return {
          success: false,
          message: "User tidak ditemukan",
        };
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: userWithoutPassword,
      };
    } catch (error: any) {
      console.error("Get profile error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan",
      };
    }
  })
  // Update profile info
  .put(
    "/profile",
    async ({ userId, db, body, set }) => {
      try {
        const { full_name, phone } = body as { full_name?: string; phone?: string };

        const updatedUser = await db.user.update({
          where: { id: userId },
          data: {
            ...(full_name !== undefined && { full_name }),
            ...(phone !== undefined && { phone }),
          },
        });

        const { password: _, ...userWithoutPassword } = updatedUser;

        return {
          success: true,
          message: "Profile berhasil diupdate",
          data: userWithoutPassword,
        };
      } catch (error: any) {
        console.error("Update profile error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan",
        };
      }
    },
    {
      body: t.Object({
        full_name: t.Optional(t.String()),
        phone: t.Optional(t.String()),
      }),
    }
  )
  // Change password
  .put(
    "/change-password",
    async ({ userId, db, body, set }) => {
      try {
        const { oldPassword, newPassword } = body as { oldPassword: string; newPassword: string };

        // Get user
        const user = await db.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          set.status = 404;
          return {
            success: false,
            message: "User tidak ditemukan",
          };
        }

        // Verify old password
        const isValid = await Bun.password.verify(oldPassword, user.password);

        if (!isValid) {
          set.status = 400;
          return {
            success: false,
            message: "Password lama tidak sesuai",
          };
        }

        // Validate new password
        if (!newPassword || newPassword.length < 6) {
          set.status = 400;
          return {
            success: false,
            message: "Password baru minimal 6 karakter",
          };
        }

        // Hash new password
        const hashedPassword = await Bun.password.hash(newPassword, {
          algorithm: "argon2id",
        });

        // Update password
        await db.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        return {
          success: true,
          message: "Password berhasil diubah",
        };
      } catch (error: any) {
        console.error("Change password error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan",
        };
      }
    },
    {
      body: t.Object({
        oldPassword: t.String(),
        newPassword: t.String(),
      }),
    }
  )
  // Upload avatar
  .post("/avatar", async ({ userId, db, request, set }) => {
    try {
      // Handle FormData manually
      const formData = await request.formData();
      const file = formData.get("avatar") as File;

      if (!file) {
        set.status = 400;
        return {
          success: false,
          message: "File tidak ditemukan",
        };
      }

      // Validate file type
      if (!file.type || !file.type.startsWith("image/")) {
        set.status = 400;
        return {
          success: false,
          message: "File harus berupa gambar (jpg, png, jpeg)",
        };
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        set.status = 400;
        return {
          success: false,
          message: "Ukuran file maksimal 2MB",
        };
      }

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), "public", "uploads", "avatars");
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `avatar-${userId}-${timestamp}.${extension}`;
      const filePath = join(uploadsDir, fileName);

      // Convert File to ArrayBuffer then save using Bun.write
      const arrayBuffer = await file.arrayBuffer();
      await Bun.write(filePath, arrayBuffer);

      // Update database
      const fileUrl = `/uploads/avatars/${fileName}`;
      await db.user.update({
        where: { id: userId },
        data: { avatar_url: fileUrl },
      });

      return {
        success: true,
        message: "Foto profil berhasil diupdate",
        data: {
          url: fileUrl,
        },
      };
    } catch (error: any) {
      console.error("Upload avatar error:", error);
      set.status = 500;
      return {
        success: false,
        message: "Terjadi kesalahan saat upload foto",
      };
    }
  })
  // Update PIN
  .put(
    "/pin",
    async ({ userId, db, body, set }) => {
      try {
        const { pin, confirmPin } = body as { pin: string; confirmPin: string };

        // Validate PIN format (6 digits)
        if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
          set.status = 400;
          return {
            success: false,
            message: "PIN harus berupa 6 digit angka",
          };
        }

        // Validate PIN match
        if (pin !== confirmPin) {
          set.status = 400;
          return {
            success: false,
            message: "PIN dan konfirmasi PIN tidak sama",
          };
        }

        // Update PIN (store as plain text for now, can hash later if needed)
        await db.user.update({
          where: { id: userId },
          data: { pin },
        });

        return {
          success: true,
          message: "PIN berhasil diupdate",
        };
      } catch (error: any) {
        console.error("Update PIN error:", error);
        set.status = 500;
        return {
          success: false,
          message: "Terjadi kesalahan",
        };
      }
    },
    {
      body: t.Object({
        pin: t.String(),
        confirmPin: t.String(),
      }),
    }
  );

