/**
 * Script to create admin user
 * Run with: bun run create-admin [SUPER_ADMIN|ADMIN]
 * Default: SUPER_ADMIN
 */

import { PrismaClient } from "@prisma/client";

async function createAdmin() {
  const prisma = new PrismaClient();

  try {
    // Get role from command line argument (default: SUPER_ADMIN)
    const role = process.argv[2]?.toUpperCase() || "SUPER_ADMIN";
    
    if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
      console.log("❌ Invalid role! Use: SUPER_ADMIN or ADMIN");
      console.log("   Usage: bun run create-admin [SUPER_ADMIN|ADMIN]");
      return;
    }

    const username = role === "SUPER_ADMIN" ? "superadmin" : "admin";
    const email = role === "SUPER_ADMIN" ? "superadmin@tiktok.local" : "admin@tiktok.local";
    const password = "admin123"; // Default password

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingAdmin) {
      console.log("❌ Admin user already exists!");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.admin_role || "N/A"}`);
      return;
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password, {
      algorithm: "argon2id",
    });

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        tier_level: 0,
        is_active: true,
        is_admin: true,
        admin_role: role, // Set role
      },
    });

    // Create wallet for admin
    await prisma.wallet.create({
      data: {
        user_id: admin.id,
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
