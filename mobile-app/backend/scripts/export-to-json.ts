import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportToJSON() {
  console.log('📦 Exporting database to JSON...\n');
  
  // Get all influencers with mentions
  const influencers = await prisma.influencer.findMany({
    include: {
      mentions: {
        take: 50,
        orderBy: { scrapedAt: 'desc' },
      },
    },
    orderBy: { trustScore: 'desc' },
  });
  
  console.log(`✅ Fetched ${influencers.length} influencers`);
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Export full data
  const fullDataPath = path.join(publicDir, 'influencers-full.json');
  fs.writeFileSync(fullDataPath, JSON.stringify(influencers, null, 2));
  console.log(`✅ Exported full data: ${fullDataPath}`);
  
  // Export compact data (without mentions)
  const compactData = influencers.map(inf => ({
    id: inf.id,
    name: inf.name,
    imageUrl: inf.imageUrl,
    summary: inf.summary,
    niche: inf.niche,
    trustScore: inf.trustScore,
    dramaCount: inf.dramaCount,
    goodActionCount: inf.goodActionCount,
    neutralCount: inf.neutralCount,
    avgSentiment: inf.avgSentiment,
    socialHandles: inf.socialHandles,
    lastUpdated: inf.lastUpdated,
  }));
  
  const compactDataPath = path.join(publicDir, 'influencers-compact.json');
  fs.writeFileSync(compactDataPath, JSON.stringify(compactData, null, 2));
  console.log(`✅ Exported compact data: ${compactDataPath}`);
  
  // Export stats
  const stats = {
    total: influencers.length,
    avgTrustScore: influencers.reduce((sum, inf) => sum + inf.trustScore, 0) / influencers.length,
    categories: Array.from(new Set(influencers.map(i => i.niche).filter(Boolean))),
    lastUpdated: new Date().toISOString(),
  };
  
  const statsPath = path.join(publicDir, 'stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log(`✅ Exported stats: ${statsPath}`);
  
  console.log('\n🎉 Export complete!');
  console.log(`📊 Total size: ${(JSON.stringify(influencers).length / 1024 / 1024).toFixed(2)} MB`);
}

exportToJSON().then(() => process.exit(0)).catch(console.error);
