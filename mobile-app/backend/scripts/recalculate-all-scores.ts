import { PrismaClient } from '@prisma/client';
import advancedScoringService from '../src/services/advanced-scoring.service';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();

/**
 * Recalculate trust scores for all influencers using the advanced algorithm
 */
async function recalculateAllScores() {
  console.log('🎯 Starting trust score recalculation for all influencers\n');
  console.log('This will use the advanced scoring algorithm (AI + Community)\n');
  
  try {
    // Get all influencers
    const influencers = await prisma.influencer.findMany({
      select: {
        id: true,
        name: true,
        trustScore: true,
      },
      orderBy: { name: 'asc' },
    });
    
    console.log(`📊 Found ${influencers.length} influencers to process\n`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (let i = 0; i < influencers.length; i++) {
      const influencer = influencers[i];
      
      console.log(`\n[${i + 1}/${influencers.length}] Processing: ${influencer.name}`);
      console.log(`  Current score: ${influencer.trustScore}`);
      
      try {
        // Calculate advanced score
        const score = await advancedScoringService.calculateAdvancedTrustScore({
          influencerId: influencer.id,
        });
        
        console.log(`  📊 Score breakdown:`);
        console.log(`     AI Score: ${score.aiScore}`);
        console.log(`     Community Score: ${score.communityScore}`);
        console.log(`     Combined Score: ${score.combinedScore}`);
        console.log(`     Final Score: ${score.finalScore}`);
        console.log(`     Confidence: ${score.confidenceLevel}%`);
        console.log(`     Trend: ${score.trend}`);
        
        // Update in database
        await advancedScoringService.updateInfluencerScore(influencer.id);
        
        // Get updated score
        const updatedInfluencer = await prisma.influencer.findUnique({
          where: { id: influencer.id },
          include: { CommunityTrustScore: true },
        });
        
        const newScore = updatedInfluencer?.CommunityTrustScore?.combinedScore || updatedInfluencer?.trustScore || 0;
        const change = newScore - influencer.trustScore;
        const changeSymbol = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        
        console.log(`  ${changeSymbol} Updated: ${influencer.trustScore} → ${newScore} (${change > 0 ? '+' : ''}${change.toFixed(1)})`);
        
        updated++;
      } catch (error: any) {
        console.error(`  ❌ Failed: ${error.message}`);
        failed++;
      }
      
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Progress update every 10
      if ((i + 1) % 10 === 0) {
        console.log(`\n📈 Progress: ${i + 1}/${influencers.length} (${Math.round(((i + 1) / influencers.length) * 100)}%)`);
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⏭️  Skipped: ${skipped}\n`);
      }
    }
    
    console.log('\n\n🎉 RECALCULATION COMPLETE!');
    console.log('━'.repeat(60));
    console.log(`✅ Successfully updated: ${updated} influencers`);
    console.log(`❌ Failed: ${failed} influencers`);
    console.log(`⏭️  Skipped: ${skipped} influencers`);
    console.log(`📊 Total: ${influencers.length} influencers`);
    console.log(`✨ All scores now use the advanced algorithm (AI + Community)!`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
recalculateAllScores();
