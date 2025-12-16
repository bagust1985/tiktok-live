-- CreateTable
CREATE TABLE "TaskConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sequence" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_url" TEXT NOT NULL,
    "icon_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskConfig_sequence_key" ON "TaskConfig"("sequence");

-- CreateIndex
CREATE INDEX "TaskConfig_sequence_idx" ON "TaskConfig"("sequence");

-- CreateIndex
CREATE INDEX "TaskConfig_is_active_idx" ON "TaskConfig"("is_active");
