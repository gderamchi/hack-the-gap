-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "achievementType" TEXT NOT NULL,
    "achievementLevel" INTEGER NOT NULL DEFAULT 1,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "progressTarget" INTEGER NOT NULL,
    "unlockedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrendingInfluencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "trendType" TEXT NOT NULL,
    "trendScore" REAL NOT NULL,
    "scoreChange" REAL NOT NULL,
    "scoreChangePercent" REAL NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LeaderboardCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaderboardType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "calculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserEngagementStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "reputationScore" REAL NOT NULL DEFAULT 50.0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experiencePoints" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserEngagementStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementType_idx" ON "UserAchievement"("achievementType");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementType_key" ON "UserAchievement"("userId", "achievementType");

-- CreateIndex
CREATE INDEX "TrendingInfluencer_influencerId_idx" ON "TrendingInfluencer"("influencerId");

-- CreateIndex
CREATE INDEX "TrendingInfluencer_trendType_idx" ON "TrendingInfluencer"("trendType");

-- CreateIndex
CREATE INDEX "TrendingInfluencer_trendScore_idx" ON "TrendingInfluencer"("trendScore");

-- CreateIndex
CREATE INDEX "TrendingInfluencer_createdAt_idx" ON "TrendingInfluencer"("createdAt");

-- CreateIndex
CREATE INDEX "LeaderboardCache_leaderboardType_idx" ON "LeaderboardCache"("leaderboardType");

-- CreateIndex
CREATE INDEX "LeaderboardCache_expiresAt_idx" ON "LeaderboardCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardCache_leaderboardType_period_key" ON "LeaderboardCache"("leaderboardType", "period");

-- CreateIndex
CREATE UNIQUE INDEX "UserEngagementStats_userId_key" ON "UserEngagementStats"("userId");

-- CreateIndex
CREATE INDEX "UserEngagementStats_reputationScore_idx" ON "UserEngagementStats"("reputationScore");

-- CreateIndex
CREATE INDEX "UserEngagementStats_level_idx" ON "UserEngagementStats"("level");
