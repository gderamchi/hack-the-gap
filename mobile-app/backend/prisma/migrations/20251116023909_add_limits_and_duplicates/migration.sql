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
    "contentHash" TEXT,
    "isDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicateOf" TEXT,
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
INSERT INTO "new_CommunitySignal" ("comment", "createdAt", "emailSent", "emailSentAt", "hiddenReason", "id", "influencerId", "isHidden", "isVerified", "rating", "rejectionReason", "status", "tags", "type", "updatedAt", "userId", "verificationResult", "verifiedAt", "verifiedBy") SELECT "comment", "createdAt", "emailSent", "emailSentAt", "hiddenReason", "id", "influencerId", "isHidden", "isVerified", "rating", "rejectionReason", "status", "tags", "type", "updatedAt", "userId", "verificationResult", "verifiedAt", "verifiedBy" FROM "CommunitySignal";
DROP TABLE "CommunitySignal";
ALTER TABLE "new_CommunitySignal" RENAME TO "CommunitySignal";
CREATE INDEX "CommunitySignal_influencerId_idx" ON "CommunitySignal"("influencerId");
CREATE INDEX "CommunitySignal_userId_idx" ON "CommunitySignal"("userId");
CREATE INDEX "CommunitySignal_type_idx" ON "CommunitySignal"("type");
CREATE INDEX "CommunitySignal_status_idx" ON "CommunitySignal"("status");
CREATE INDEX "CommunitySignal_createdAt_idx" ON "CommunitySignal"("createdAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COMMUNITY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "avatar" TEXT,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionExpiry" DATETIME,
    "monthlyReportsUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyReportsLimit" INTEGER NOT NULL DEFAULT 5,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("avatar", "company", "createdAt", "email", "emailVerified", "firstName", "id", "lastLoginAt", "lastName", "passwordHash", "role", "status", "subscriptionExpiry", "subscriptionStatus", "subscriptionTier") SELECT "avatar", "company", "createdAt", "email", "emailVerified", "firstName", "id", "lastLoginAt", "lastName", "passwordHash", "role", "status", "subscriptionExpiry", coalesce("subscriptionStatus", 'ACTIVE') AS "subscriptionStatus", coalesce("subscriptionTier", 'FREE') AS "subscriptionTier" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
