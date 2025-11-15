-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COMMUNITY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "avatar" TEXT,
    "subscriptionTier" TEXT,
    "subscriptionStatus" TEXT,
    "subscriptionExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CommunitySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "tags" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "hiddenReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommunitySignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommunitySignal_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommunityTrustScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "avgRating" REAL NOT NULL DEFAULT 0.0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "totalDramaReports" INTEGER NOT NULL DEFAULT 0,
    "totalPositiveReports" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "communityScore" REAL NOT NULL DEFAULT 50.0,
    "combinedScore" REAL NOT NULL DEFAULT 50.0,
    "lastUpdated" DATETIME NOT NULL,
    CONSTRAINT "CommunityTrustScore_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeepSearchAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "analysisData" TEXT,
    "queriesRun" INTEGER NOT NULL DEFAULT 0,
    "sourcesAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "processingTimeMs" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "firstBuyerId" TEXT,
    "unlockedAt" DATETIME,
    "basePrice" REAL NOT NULL DEFAULT 99.99,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "DeepSearchAnalysis_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeepSearchAnalysis_firstBuyerId_fkey" FOREIGN KEY ("firstBuyerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeepSearchOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "deepSearchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "platformFee" REAL NOT NULL,
    "isFirstBuyer" BOOLEAN NOT NULL DEFAULT false,
    "wasFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "DeepSearchOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DeepSearchOrder_deepSearchId_fkey" FOREIGN KEY ("deepSearchId") REFERENCES "DeepSearchAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DeepSearchOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "CommunitySignal_influencerId_idx" ON "CommunitySignal"("influencerId");

-- CreateIndex
CREATE INDEX "CommunitySignal_userId_idx" ON "CommunitySignal"("userId");

-- CreateIndex
CREATE INDEX "CommunitySignal_type_idx" ON "CommunitySignal"("type");

-- CreateIndex
CREATE INDEX "CommunitySignal_createdAt_idx" ON "CommunitySignal"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityTrustScore_influencerId_key" ON "CommunityTrustScore"("influencerId");

-- CreateIndex
CREATE INDEX "CommunityTrustScore_communityScore_idx" ON "CommunityTrustScore"("communityScore");

-- CreateIndex
CREATE INDEX "CommunityTrustScore_combinedScore_idx" ON "CommunityTrustScore"("combinedScore");

-- CreateIndex
CREATE INDEX "DeepSearchAnalysis_influencerId_idx" ON "DeepSearchAnalysis"("influencerId");

-- CreateIndex
CREATE INDEX "DeepSearchAnalysis_status_idx" ON "DeepSearchAnalysis"("status");

-- CreateIndex
CREATE INDEX "DeepSearchAnalysis_isPublic_idx" ON "DeepSearchAnalysis"("isPublic");

-- CreateIndex
CREATE INDEX "DeepSearchOrder_userId_idx" ON "DeepSearchOrder"("userId");

-- CreateIndex
CREATE INDEX "DeepSearchOrder_deepSearchId_idx" ON "DeepSearchOrder"("deepSearchId");

-- CreateIndex
CREATE INDEX "DeepSearchOrder_status_idx" ON "DeepSearchOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
