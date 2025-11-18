import { PrismaClient } from '@prisma/client';
import advancedScoringService from '../src/services/advanced-scoring.service';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

/**
 * Synchronize all influencer scores
 * This ensures that:
 * 1. Influencer.trustScore matches the advanced algorithm
 * 2. CommunityTrustScore.combinedScore is in sync
 * 3. All displayed scores are consistent
 */
async function syncAllScores() {
  console.log('🔄 Starting score synchronization for all influencers...\n');
  
  try {
    // Get all influencers
    const influencers = await prisma.influencer.findMany({
      select: {
        id: true,
        name: true,
        trustScore: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    console.log(`Found ${influencers.length} influencers to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < influencers.length; i++) {
      const influencer = influencers[i];
      const progress = `[${i + 1}/${influencers.length}]`;
      
      try {
        console.log(`${progress} Processing: ${influencer.name}`);
        console.log(`  Current score: ${influencer.trustScore}`);
        
        // Recalculate using advanced algorithm
        await advancedScoringService.updateInfluencerScore(influencer.id);
        
        // Get updated scores
        const updated = await prisma.influencer.findUnique({
          where: { id: influencer.id },
          include: {
            CommunityTrustScore: true,
          },
        });
        
        if (updated) {
          console.log(`  ✅ New score: ${updated.trustScore}`);
          console.log(`  Community score: ${updated.CommunityTrustScore?.communityScore || 'N/A'}`);
          console.log(`  Combined score: ${updated.CommunityTrustScore?.combinedScore || 'N/A'}`);
          
          // Verify sync
          if (updated.CommunityTrustScore) {
            const diff = Math.abs(updated.trustScore - updated.CommunityTrustScore.combinedScore);
            if (diff > 0.01) {
              console.log(`  ⚠️  WARNING: Scores not in sync! Diff: ${diff.toFixed(2)}`);
            }
          }
          
          successCount++;
        }
        
        console.log('');
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Synchronization Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total influencers: ${influencers.length}`);
    
    // Verify overall consistency
    console.log('\n🔍 Verifying overall consistency...\n');
    
    const inconsistent = await prisma.$queryRaw<any[]>`
      SELECT 
        i.id,
        i.name,
        i."trustScore" as influencer_score,
        cts."combinedScore" as community_score,
        ABS(i."trustScore" - cts."combinedScore") as difference
      FROM "Influencer" i
      LEFT JOIN "CommunityTrustScore" cts ON cts."influencerId" = i.id
      WHERE ABS(i."trustScore" - COALESCE(cts."combinedScore", i."trustScore")) > 0.01
      ORDER BY difference DESC
      LIMIT 10
    `;
    
    if (inconsistent.length > 0) {
      console.log(`⚠️  Found ${inconsistent.length} influencers with inconsistent scores:\n`);
      for (const inf of inconsistent) {
        console.log(`  ${inf.name}:`);
        console.log(`    Influencer.trustScore: ${inf.influencer_score}`);
        console.log(`    CommunityTrustScore.combinedScore: ${inf.community_score}`);
        console.log(`    Difference: ${inf.difference}\n`);
      }
    } else {
      console.log('✅ All scores are consistent!\n');
    }
    
    // Show score distribution
    console.log('📊 Score Distribution:\n');
    
    const distribution = await prisma.$queryRaw<any[]>`
      SELECT 
        CASE 
          WHEN "trustScore" >= 80 THEN '80-100 (Excellent)'
          WHEN "trustScore" >= 60 THEN '60-79 (Good)'
          WHEN "trustScore" >= 40 THEN '40-59 (Average)'
          WHEN "trustScore" >= 20 THEN '20-39 (Poor)'
          ELSE '0-19 (Critical)'
        END as score_range,
        COUNT(*) as count
      FROM "Influencer"
      GROUP BY score_range
      ORDER BY score_range DESC
    `;
    
    for (const range of distribution) {
      console.log(`  ${range.score_range}: ${range.count} influencers`);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during synchronization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncAllScores();
