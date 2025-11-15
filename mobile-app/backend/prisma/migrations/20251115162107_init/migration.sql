-- CreateTable
CREATE TABLE "Influencer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "socialHandles" TEXT,
    "niche" TEXT,
    "trustScore" REAL NOT NULL DEFAULT 50.0,
    "dramaCount" INTEGER NOT NULL DEFAULT 0,
    "goodActionCount" INTEGER NOT NULL DEFAULT 0,
    "neutralCount" INTEGER NOT NULL DEFAULT 0,
    "avgSentiment" REAL NOT NULL DEFAULT 0.0,
    "language" TEXT NOT NULL DEFAULT 'fr',
    "lastUpdated" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "textExcerpt" TEXT NOT NULL,
    "sentimentScore" REAL NOT NULL,
    "label" TEXT NOT NULL,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mention_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnalysisHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "influencerId" TEXT NOT NULL,
    "trustScore" REAL NOT NULL,
    "dramaCount" INTEGER NOT NULL,
    "goodActionCount" INTEGER NOT NULL,
    "neutralCount" INTEGER NOT NULL,
    "avgSentiment" REAL NOT NULL,
    "analyzedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalysisHistory_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_name_key" ON "Influencer"("name");

-- CreateIndex
CREATE INDEX "Influencer_trustScore_idx" ON "Influencer"("trustScore");

-- CreateIndex
CREATE INDEX "Influencer_name_idx" ON "Influencer"("name");

-- CreateIndex
CREATE INDEX "Mention_influencerId_idx" ON "Mention"("influencerId");

-- CreateIndex
CREATE INDEX "Mention_label_idx" ON "Mention"("label");

-- CreateIndex
CREATE INDEX "Mention_scrapedAt_idx" ON "Mention"("scrapedAt");

-- CreateIndex
CREATE INDEX "AnalysisHistory_influencerId_idx" ON "AnalysisHistory"("influencerId");

-- CreateIndex
CREATE INDEX "AnalysisHistory_analyzedAt_idx" ON "AnalysisHistory"("analyzedAt");
