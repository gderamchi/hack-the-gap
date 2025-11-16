-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommunitySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "tags" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "verifiedBy" TEXT,
    "verificationResult" TEXT,
    "rejectionReason" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunitySignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunitySignal_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CommunitySignal" ("comment", "createdAt", "hiddenReason", "id", "influencerId", "isHidden", "isVerified", "rating", "tags", "type", "updatedAt", "userId", "verifiedAt") SELECT "comment", "createdAt", "hiddenReason", "id", "influencerId", "isHidden", "isVerified", "rating", "tags", "type", "updatedAt", "userId", "verifiedAt" FROM "CommunitySignal";
DROP TABLE "CommunitySignal";
ALTER TABLE "new_CommunitySignal" RENAME TO "CommunitySignal";
CREATE INDEX "CommunitySignal_influencerId_idx" ON "CommunitySignal"("influencerId");
CREATE INDEX "CommunitySignal_userId_idx" ON "CommunitySignal"("userId");
CREATE INDEX "CommunitySignal_type_idx" ON "CommunitySignal"("type");
CREATE INDEX "CommunitySignal_status_idx" ON "CommunitySignal"("status");
CREATE INDEX "CommunitySignal_createdAt_idx" ON "CommunitySignal"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
