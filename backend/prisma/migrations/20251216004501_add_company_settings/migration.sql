-- CreateTable
CREATE TABLE "CompanyBank" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactCenter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE INDEX "CompanyBank_is_active_idx" ON "CompanyBank"("is_active");

-- CreateIndex
CREATE INDEX "ContactCenter_is_active_sequence_idx" ON "ContactCenter"("is_active", "sequence");
