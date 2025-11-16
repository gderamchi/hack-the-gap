import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

// SQLite database (source)
const sqliteDb = new Database('./prisma/dev.db', { readonly: true });

// PostgreSQL database (destination) - uses DATABASE_URL from .env
const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Supabase PostgreSQL...\n');

  try {
    // 1. Migrate Influencers
    console.log('📊 Migrating Influencers...');
    const influencers = sqliteDb.prepare('SELECT * FROM Influencer').all();
    console.log(`Found ${influencers.length} influencers`);

    for (const inf of influencers as any[]) {
      await prisma.influencer.upsert({
        where: { id: inf.id },
        create: {
          id: inf.id,
          name: inf.name,
          imageUrl: inf.imageUrl,
          summary: inf.summary,
          socialHandles: inf.socialHandles,
          niche: inf.niche,
          trustScore: inf.trustScore,
          dramaCount: inf.dramaCount,
          goodActionCount: inf.goodActionCount,
          neutralCount: inf.neutralCount,
          avgSentiment: inf.avgSentiment,
          language: inf.language,
          isClaimed: inf.isClaimed === 1,
          claimedBy: inf.claimedBy,
          claimedAt: inf.claimedAt ? new Date(inf.claimedAt) : null,
          verificationStatus: inf.verificationStatus || 'UNCLAIMED',
          createdAt: new Date(inf.createdAt),
          lastUpdated: new Date(inf.lastUpdated),
        },
        update: {},
      });
    }
    console.log(`✅ Migrated ${influencers.length} influencers\n`);

    // 2. Migrate Mentions
    console.log('📰 Migrating Mentions...');
    const mentions = sqliteDb.prepare('SELECT * FROM Mention').all();
    console.log(`Found ${mentions.length} mentions`);

    for (const mention of mentions as any[]) {
      await prisma.mention.upsert({
        where: { id: mention.id },
        create: {
          id: mention.id,
          influencerId: mention.influencerId,
          source: mention.source,
          sourceUrl: mention.sourceUrl,
          textExcerpt: mention.textExcerpt,
          sentimentScore: mention.sentimentScore,
          label: mention.label,
          severity: mention.severity || 'MEDIUM',
          scoreImpact: mention.scoreImpact || 0,
          isVerified: mention.isVerified === 1,
          verifiedBy: mention.verifiedBy,
          verifiedAt: mention.verifiedAt ? new Date(mention.verifiedAt) : null,
          scrapedAt: new Date(mention.scrapedAt),
        },
        update: {},
      });
    }
    console.log(`✅ Migrated ${mentions.length} mentions\n`);

    // 3. Migrate Analysis History
    console.log('📈 Migrating Analysis History...');
    const history = sqliteDb.prepare('SELECT * FROM AnalysisHistory').all();
    console.log(`Found ${history.length} history records`);

    for (const record of history as any[]) {
      await prisma.analysisHistory.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          influencerId: record.influencerId,
          trustScore: record.trustScore,
          dramaCount: record.dramaCount,
          goodActionCount: record.goodActionCount,
          neutralCount: record.neutralCount,
          avgSentiment: record.avgSentiment,
          analyzedAt: new Date(record.analyzedAt),
        },
        update: {},
      });
    }
    console.log(`✅ Migrated ${history.length} history records\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Influencers: ${influencers.length}`);
    console.log(`  - Mentions: ${mentions.length}`);
    console.log(`  - History: ${history.length}`);
    console.log('\n✅ All data is now in Supabase PostgreSQL!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

migrateData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
