import { PrismaClient } from '@prisma/client';
import advancedScoringService from '../src/services/advanced-scoring.service';

const prisma = new PrismaClient();

async function checkThomasPesquet() {
  console.log('🔍 Checking Thomas Pesquet\'s score...\n');
  
  try {
    // Find Thomas Pesquet
    const influencer = await prisma.influencer.findFirst({
      where: {
        name: {
          contains: 'Thomas Pesquet',
          mode: 'insensitive',
        },
      },
      include: {
        Mention: true,
        CommunityTrustScore: true,
      },
    });
    
    if (!influencer) {
      console.log('❌ Thomas Pesquet not found in database');
      return;
    }
    
    console.log('📊 Current Data:');
    console.log(`   Name: ${influencer.name}`);
    console.log(`   ID: ${influencer.id}`);
    console.log(`   Current Trust Score (Influencer table): ${influencer.trustScore}`);
    console.log(`   AI Mentions: ${influencer.Mention.length}`);
    console.log(`   Drama Count: ${influencer.dramaCount}`);
    console.log(`   Good Action Count: ${influencer.goodActionCount}`);
    console.log(`   Avg Sentiment: ${influencer.avgSentiment}`);
    
    if (influencer.CommunityTrustScore) {
      console.log(`\n📊 Community Trust Score:');
      console.log(`   AI Score: ${influencer.CommunityTrustScore.aiScore}`);
      console.log(`   Community Score: ${influencer.CommunityTrustScore.communityScore}`);
      console.log(`   Combined Score: ${influencer.CommunityTrustScore.combinedScore}`);
      console.log(`   Final Score: ${influencer.CommunityTrustScore.finalScore}`);
      console.log(`   Confidence: ${influencer.CommunityTrustScore.confidenceLevel}%`);
      console.log(`   Trend: ${influencer.CommunityTrustScore.trend}`);
    } else {
      console.log(`\n⚠️  No CommunityTrustScore record found`);
    }
    
    // Get community signals
    const signals = await prisma.communitySignal.findMany({
      where: { influencerId: influencer.id },
      include: { User: true },
    });
    
    console.log(`\n📊 Community Signals: ${signals.length} total`);
    const verified = signals.filter(s => s.status === 'VERIFIED');
    const pending = signals.filter(s => s.status === 'PENDING');
    const rejected = signals.filter(s => s.status === 'REJECTED');
    
    console.log(`   ✅ Verified: ${verified.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ❌ Rejected: ${rejected.length}`);
    
    if (verified.length > 0) {
      console.log(`\n📋 Verified Signals:`);
      verified.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.type} - Rating: ${s.rating || 'N/A'} - ${s.comment?.substring(0, 50) || 'No comment'}...`);
      });
    }
    
    // Recalculate with advanced algorithm
    console.log(`\n🔄 Recalculating with advanced algorithm...`);
    const score = await advancedScoringService.calculateAdvancedTrustScore({
      influencerId: influencer.id,
    });
    
    console.log(`\n✅ New Score Calculation:`);
    console.log(`   AI Score: ${score.aiScore}`);
    console.log(`   Community Score: ${score.communityScore}`);
    console.log(`   Combined Score: ${score.combinedScore}`);
    console.log(`   Final Score: ${score.finalScore}`);
    console.log(`   Confidence: ${score.confidenceLevel}%`);
    console.log(`   Trend: ${score.trend}`);
    console.log(`   Momentum: ${score.momentum}`);
    console.log(`   Volatility: ${score.volatility}`);
    
    console.log(`\n📊 Score Breakdown:`);
    console.log(`   AI Breakdown:`);
    console.log(`     - Drama Impact: ${score.breakdown.aiBreakdown.dramaImpact}`);
    console.log(`     - Positive Impact: ${score.breakdown.aiBreakdown.positiveImpact}`);
    console.log(`     - Sentiment Impact: ${score.breakdown.aiBreakdown.sentimentImpact}`);
    console.log(`   Community Breakdown:`);
    console.log(`     - Rating Impact: ${score.breakdown.communityBreakdown.ratingImpact}`);
    console.log(`     - Drama Impact: ${score.breakdown.communityBreakdown.dramaImpact}`);
    console.log(`     - Positive Impact: ${score.breakdown.communityBreakdown.positiveImpact}`);
    console.log(`   Adjustments:`);
    console.log(`     - Controversy Penalty: ${score.breakdown.adjustments.controversyPenalty}`);
    console.log(`     - Verification Bonus: ${score.breakdown.adjustments.verificationBonus}`);
    console.log(`     - Consistency Bonus: ${score.breakdown.adjustments.consistencyBonus}`);
    console.log(`     - Outlier Adjustment: ${score.breakdown.adjustments.outlierAdjustment}`);
    
    // Update in database
    console.log(`\n💾 Updating database...`);
    await advancedScoringService.updateInfluencerScore(influencer.id);
    
    // Fetch updated
    const updated = await prisma.influencer.findUnique({
      where: { id: influencer.id },
      include: { CommunityTrustScore: true },
    });
    
    console.log(`\n✅ Updated Successfully!`);
    console.log(`   Old Score: ${influencer.trustScore}`);
    console.log(`   New Score (Influencer table): ${updated?.trustScore}`);
    console.log(`   New Score (CommunityTrustScore): ${updated?.CommunityTrustScore?.combinedScore}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkThomasPesquet();
