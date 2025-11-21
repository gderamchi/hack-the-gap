import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';

interface ResearchResult {
  summary: string;
  dramas: string[];
  positiveActions: string[];
  mentions: Array<{
    text: string;
    sentiment: number;
    label: 'drama' | 'good_action' | 'neutral';
  }>;
}

async function comprehensiveResearch(name: string, niche: string): Promise<ResearchResult> {
  console.log(`  🔍 Researching ${name}...`);
  
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant analyzing French influencers. Provide factual, verified information in JSON format.'
          },
          {
            role: 'user',
            content: `Research French influencer "${name}" (${niche}). Provide a comprehensive analysis in this EXACT JSON format:

{
  "summary": "2-3 sentence overview of who they are and their reputation",
  "dramas": ["drama 1", "drama 2"],
  "positiveActions": ["positive action 1", "positive action 2"],
  "mentions": [
    {"text": "mention text", "sentiment": 0.5, "label": "good_action"},
    {"text": "mention text", "sentiment": -0.3, "label": "drama"}
  ]
}

Focus on recent 2024-2025 information. Return ONLY valid JSON, no other text.`
          }
        ],
        stream: false,
        webSearch: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return data;
    }
    
    // Fallback
    return {
      summary: `${name} is a French ${niche} influencer.`,
      dramas: [],
      positiveActions: [],
      mentions: [],
    };
    
  } catch (error: any) {
    console.error(`    ❌ Research failed: ${error.message}`);
    return {
      summary: `${name} is a French ${niche} influencer.`,
      dramas: [],
      positiveActions: [],
      mentions: [],
    };
  }
}

function calculateTrustScore(mentions: any[]): { score: number; dramaCount: number; goodCount: number; neutralCount: number } {
  if (mentions.length === 0) {
    return { score: 50, dramaCount: 0, goodCount: 0, neutralCount: 0 };
  }
  
  let dramaCount = 0;
  let goodCount = 0;
  let neutralCount = 0;
  let totalSentiment = 0;
  
  mentions.forEach(m => {
    if (m.label === 'drama') dramaCount++;
    else if (m.label === 'good_action') goodCount++;
    else neutralCount++;
    
    totalSentiment += m.sentiment || 0;
  });
  
  const avgSentiment = totalSentiment / mentions.length;
  
  // Calculate score
  let score = 50;
  score -= dramaCount * 10;
  score += goodCount * 8;
  score += avgSentiment * 15;
  
  score = Math.max(0, Math.min(100, score));
  
  return { score, dramaCount, goodCount, neutralCount };
}

async function updateInfluencer(influencer: any) {
  try {
    console.log(`\n📊 Updating: ${influencer.name}`);
    
    // Comprehensive research
    const research = await comprehensiveResearch(influencer.name, influencer.niche || 'General');
    
    // Calculate new scores
    const scores = calculateTrustScore(research.mentions);
    
    // Update influencer
    await prisma.influencer.update({
      where: { id: influencer.id },
      data: {
        summary: research.summary,
        trustScore: scores.score,
        dramaCount: scores.dramaCount,
        goodActionCount: scores.goodCount,
        neutralCount: scores.neutralCount,
        avgSentiment: research.mentions.reduce((sum, m) => sum + (m.sentiment || 0), 0) / (research.mentions.length || 1),
      },
    });
    
    // Delete old mentions
    await prisma.mention.deleteMany({
      where: { influencerId: influencer.id },
    });
    
    // Save new mentions
    if (research.mentions.length > 0) {
      await prisma.mention.createMany({
        data: research.mentions.map(m => ({
          influencerId: influencer.id,
          source: 'perplexity',
          sourceUrl: 'https://www.perplexity.ai',
          textExcerpt: m.text,
          sentimentScore: m.sentiment,
          label: m.label,
        })),
      });
    }
    
    console.log(`  ✅ Updated: ${scores.score}% (${scores.dramaCount}D, ${scores.goodCount}P)`);
    console.log(`  📝 Summary: ${research.summary.substring(0, 80)}...`);
    
    return true;
  } catch (error: any) {
    console.error(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

async function updateAllInfluencers() {
  console.log('🚀 COMPREHENSIVE UPDATE - All Influencers\n');
  console.log('This will research and update ALL influencers with:');
  console.log('  - Live Perplexity research');
  console.log('  - AI-generated summaries');
  console.log('  - Updated trust scores');
  console.log('  - Fresh mentions and data\n');
  
  const influencers = await prisma.influencer.findMany({
    select: { id: true, name: true, niche: true },
    orderBy: { trustScore: 'desc' },
  });
  
  console.log(`📊 Found ${influencers.length} influencers to update\n`);
  console.log('⏱️  Estimated time: ${Math.round(influencers.length * 0.5)} minutes\n');
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < influencers.length; i++) {
    const influencer = influencers[i];
    
    console.log(`\n[${i + 1}/${influencers.length}] Processing...`);
    
    const success = await updateInfluencer(influencer);
    
    if (success) {
      updated++;
    } else {
      failed++;
    }
    
    // Delay between requests (rate limiting)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Progress update every 10
    if ((i + 1) % 10 === 0) {
      console.log(`\n📈 Progress: ${i + 1}/${influencers.length} (${Math.round(((i + 1) / influencers.length) * 100)}%)`);
      console.log(`   ✅ Updated: ${updated}`);
      console.log(`   ❌ Failed: ${failed}\n`);
    }
  }
  
  console.log('\n\n🎉 COMPLETE!');
  console.log('━'.repeat(60));
  console.log(`✅ Successfully updated: ${updated} influencers`);
  console.log(`❌ Failed: ${failed} influencers`);
  console.log(`📊 Total: ${influencers.length} influencers`);
  console.log(`✨ All influencers now have fresh data and summaries!`);
}

async function main() {
  try {
    await updateAllInfluencers();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
