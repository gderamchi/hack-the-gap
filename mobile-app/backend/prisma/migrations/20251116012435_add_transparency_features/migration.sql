-- CreateTable
CREATE TABLE "ClaimRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofType" TEXT,
    "proofUrl" TEXT,
    "proofText" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClaimRequest_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClaimRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InfluencerResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "mentionId" TEXT,
    "signalId" TEXT,
    "responseType" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "evidenceUrls" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InfluencerResponse_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InfluencerResponse_mentionId_fkey" FOREIGN KEY ("mentionId") REFERENCES "Mention" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InfluencerResponse_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "CommunitySignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResponseVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "responseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResponseVote_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "InfluencerResponse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResponseVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "mentionId" TEXT,
    "signalId" TEXT,
    "requestedBy" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "resolution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScoreImpactLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "impactType" TEXT NOT NULL,
    "impactAmount" REAL NOT NULL,
    "oldScore" REAL NOT NULL,
    "newScore" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "summary" TEXT,
    "socialHandles" TEXT,
    "niche" TEXT,
    "trustScore" REAL NOT NULL DEFAULT 50.0,
    "dramaCount" INTEGER NOT NULL DEFAULT 0,
    "goodActionCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "avgSentiment" REAL NOT NULL DEFAULT 0.0,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedBy" TEXT,
    "claimedAt" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNCLAIMED'
);
INSERT INTO "new_Influencer" ("avgSentiment", "createdAt", "dramaCount", "goodActionCount", "id", "imageUrl", "language", "lastUpdated", "name", "neutralCount", "niche", "socialHandles", "summary", "trustScore") SELECT "avgSentiment", "createdAt", "dramaCount", "goodActionCount", "id", "imageUrl", "language", "lastUpdated", "name", "neutralCount", "niche", "socialHandles", "summary", "trustScore" FROM "Influencer";
DROP TABLE "Influencer";
ALTER TABLE "new_Influencer" RENAME TO "Influencer";
CREATE UNIQUE INDEX "Influencer_name_key" ON "Influencer"("name");
CREATE INDEX "Influencer_trustScore_idx" ON "Influencer"("trustScore");
CREATE INDEX "Influencer_name_idx" ON "Influencer"("name");
CREATE INDEX "Influencer_isClaimed_idx" ON "Influencer"("isClaimed");
CREATE TABLE "new_Mention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "textExcerpt" TEXT NOT NULL,
    "sentimentScore" REAL NOT NULL,
    "label" TEXT NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "scoreImpact" REAL NOT NULL DEFAULT 0.0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    CONSTRAINT "Mention_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Mention" ("id", "influencerId", "label", "scrapedAt", "sentimentScore", "source", "sourceUrl", "textExcerpt") SELECT "id", "influencerId", "label", "scrapedAt", "sentimentScore", "source", "sourceUrl", "textExcerpt" FROM "Mention";
DROP TABLE "Mention";
ALTER TABLE "new_Mention" RENAME TO "Mention";
CREATE INDEX "Mention_influencerId_idx" ON "Mention"("influencerId");
CREATE INDEX "Mention_label_idx" ON "Mention"("label");
CREATE INDEX "Mention_severity_idx" ON "Mention"("severity");
CREATE INDEX "Mention_scrapedAt_idx" ON "Mention"("scrapedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ClaimRequest_influencerId_idx" ON "ClaimRequest"("influencerId");

-- CreateIndex
CREATE INDEX "ClaimRequest_userId_idx" ON "ClaimRequest"("userId");

-- CreateIndex
CREATE INDEX "ClaimRequest_status_idx" ON "ClaimRequest"("status");

-- CreateIndex
CREATE INDEX "InfluencerResponse_influencerId_idx" ON "InfluencerResponse"("influencerId");

-- CreateIndex
CREATE INDEX "InfluencerResponse_mentionId_idx" ON "InfluencerResponse"("mentionId");

-- CreateIndex
CREATE INDEX "InfluencerResponse_signalId_idx" ON "InfluencerResponse"("signalId");

-- CreateIndex
CREATE INDEX "ResponseVote_responseId_idx" ON "ResponseVote"("responseId");

-- CreateIndex
CREATE INDEX "ResponseVote_userId_idx" ON "ResponseVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponseVote_responseId_userId_key" ON "ResponseVote"("responseId", "userId");

-- CreateIndex
CREATE INDEX "ReviewRequest_influencerId_idx" ON "ReviewRequest"("influencerId");

-- CreateIndex
CREATE INDEX "ReviewRequest_status_idx" ON "ReviewRequest"("status");

-- CreateIndex
CREATE INDEX "ReviewRequest_requestedBy_idx" ON "ReviewRequest"("requestedBy");

-- CreateIndex
CREATE INDEX "ScoreImpactLog_influencerId_idx" ON "ScoreImpactLog"("influencerId");

-- CreateIndex
CREATE INDEX "ScoreImpactLog_createdAt_idx" ON "ScoreImpactLog"("createdAt");
