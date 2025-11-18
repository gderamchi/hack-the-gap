import { PrismaClient } from '@prisma/client';
import advancedScoringService from '../src/services/advanced-scoring.service';

const prisma = new PrismaClient();

async function checkHugopose() {
  try {
    // Find Hugoposé
    const influencer = await prisma.influencer.findFirst({
      where: { name: { contains: 'Hugo', mode: 'insensitive' } },
      include: {
        CommunityTrustScore: true,
        CommunitySignal: {
          include: {
            User: {
              include: {
                UserEngagementStats: true
              }
            }
          }
        }
      }
    });
    
    if (!influencer) {
      console.log('❌ Hugoposé not found');
      return;
    }
    
    console.log('📊 BEFORE Recalculation:');
    console.log('━'.repeat(60));
    console.log('Name:', influencer.name);
    console.log('Influencer.trustScore:', influencer.trustScore);
    console.log('CommunityTrustScore.combinedScore:', influencer.CommunityTrustScore?.combinedScore || 'N/A');
    console.log('CommunityTrustScore.communityScore:', influencer.CommunityTrustScore?.communityScore || 'N/A');
    console.log('Community Signals:', influencer.CommunitySignal.length);
    
    console.log('\nSignals:');
    for (const signal of influencer.CommunitySignal) {
      console.log(`  - ${signal.type}: rating=${signal.rating}, status=${signal.status}`);
    }
    
    console.log('\n🔄 Recalculating with advanced algorithm...\n');
    
    await advancedScoringService.updateInfluencerScore(influencer.id);
    
    const updated = await prisma.influencer.findUnique({
      where: { id: influencer.id },
      include: { CommunityTrustScore: true }
    });
    
    console.log('\n📊 AFTER Recalculation:');
    console.log('━'.repeat(60));
    console.log('Influencer.trustScore:', updated?.trustScore);
    console.log('CommunityTrustScore.combinedScore:', updated?.CommunityTrustScore?.combinedScore || 'N/A');
    console.log('CommunityTrustScore.communityScore:', updated?.CommunityTrustScore?.communityScore || 'N/A');
    
    // Check if they match
    const diff = Math.abs((updated?.trustScore || 0) - (updated?.CommunityTrustScore?.combinedScore || 0));
    
    console.log('\n🔍 Verification:');
    console.log('━'.repeat(60));
    if (diff < 0.01) {
      console.log('✅ Scores are IN SYNC!');
    } else {
      console.log(`⚠️  Scores are OUT OF SYNC! Difference: ${diff.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHugopose();
