-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "EmailVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "pin" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "phone" TEXT,
    "tos_agreed_at" DATETIME,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" DATETIME,
    "tier_level" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "admin_role" TEXT,
    "sponsor_id" TEXT,
    "upline_binary_id" TEXT,
    "position" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "User_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_upline_binary_id_fkey" FOREIGN KEY ("upline_binary_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("admin_role", "avatar_url", "created_at", "email", "full_name", "id", "is_active", "is_admin", "password", "phone", "pin", "position", "sponsor_id", "tier_level", "tos_agreed_at", "updated_at", "upline_binary_id", "username") SELECT "admin_role", "avatar_url", "created_at", "email", "full_name", "id", "is_active", "is_admin", "password", "phone", "pin", "position", "sponsor_id", "tier_level", "tos_agreed_at", "updated_at", "upline_binary_id", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_user_id_key" ON "EmailVerification"("user_id");

-- CreateIndex
CREATE INDEX "EmailVerification_user_id_idx" ON "EmailVerification"("user_id");

-- CreateIndex
CREATE INDEX "EmailVerification_expires_at_idx" ON "EmailVerification"("expires_at");
