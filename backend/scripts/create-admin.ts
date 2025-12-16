/**
 * Script to create admin user
 * Run with: bun run backend/scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createAdmin() {
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const email = args[1] || "admin@tiktoklive.com";
  const password = args[2] || "admin123";

  console.log("Creating admin user...");
  console.log(`Username: ${username}`);
  console.log(`Email: ${email}`);

  try {
    // Check if admin already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existing) {
      // Update to admin
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          is_admin: true,
          is_active: true,
          tier_level: 3, // Level 1 for admin
        },
      });
      console.log("✅ Admin user updated!");
    } else {
      // Create new admin
      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "argon2id",
      });

      const admin = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          is_admin: true,
          is_active: true,
          tier_level: 3, // Level 1 for admin
        },
      });

      // Create wallet
      await prisma.wallet.create({
        data: {
          user_id: admin.id,
        },
      });

      console.log("✅ Admin user created!");
    }

    console.log("\nLogin credentials:");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (error: any) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

