import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';

interface InfluencerData {
  name: string;
  niche: string;
  platform: string;
  followers: string;
  imageUrl?: string;
}

async function askAIForInfluencers(category: string, count: number): Promise<InfluencerData[]> {
  console.log(`🤖 Asking AI for ${count} ${category} influencers...`);
  
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a French social media expert. Provide accurate, real influencer data in JSON format only. No explanations, just valid JSON array.'
          },
          {
            role: 'user',
            content: `Liste ${count} influenceurs français populaires dans la catégorie "${category}". 
            
Pour chaque influenceur, fournis UNIQUEMENT un tableau JSON avec cette structure exacte:
[
  {
    "name": "Nom exact de l'influenceur",
    "niche": "${category}",
    "platform": "YouTube/Instagram/TikTok/Twitch",
    "followers": "nombre + M/K (ex: 5.2M, 800K)"
  }
]

IMPORTANT: 
- Noms réels et vérifiables
- Pas de doublons
- Format JSON valide uniquement
- Pas de texte avant ou après le JSON`
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
        timeout: 60000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.log('⚠️  No JSON found in response');
      return [];
    }
    
    const influencers = JSON.parse(jsonMatch[0]);
    console.log(`✅ Got ${influencers.length} influencers for ${category}`);
    
    return influencers;
    
  } catch (error: any) {
    console.error(`❌ Error fetching ${category}:`, error.message);
    return [];
  }
}

function generateImageUrl(name: string): string {
  // Use UI Avatars for free profile images
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6', 'EC4899'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=${randomColor}&color=fff&bold=true&format=png`;
}

function generateTrustScore(): number {
  // Realistic distribution: more scores in 50-85 range
  const random = Math.random();
  if (random < 0.1) return Math.floor(Math.random() * 20) + 80; // 10% excellent (80-100)
  if (random < 0.4) return Math.floor(Math.random() * 20) + 60; // 30% good (60-80)
  if (random < 0.8) return Math.floor(Math.random() * 20) + 40; // 40% neutral (40-60)
  return Math.floor(Math.random() * 20) + 20; // 20% poor (20-40)
}

function generateCounts() {
  const dramaCount = Math.floor(Math.random() * 10);
  const goodActionCount = Math.floor(Math.random() * 15);
  const neutralCount = Math.floor(Math.random() * 40) + 10;
  
  return { dramaCount, goodActionCount, neutralCount };
}

async function populateFromAI() {
  console.log('🚀 Starting AI-powered influencer population...\n');
  
  const categories = [
    { name: 'Gaming', count: 150 },
    { name: 'Beauty', count: 100 },
    { name: 'Lifestyle', count: 100 },
    { name: 'Fitness', count: 80 },
    { name: 'Comedy', count: 80 },
    { name: 'Tech', count: 70 },
    { name: 'Cooking', count: 70 },
    { name: 'Music', count: 80 },
    { name: 'Fashion', count: 80 },
    { name: 'Travel', count: 60 },
    { name: 'Education', count: 60 },
    { name: 'Science', count: 50 },
    { name: 'Sports', count: 50 },
    { name: 'Business', count: 40 },
    { name: 'Art', count: 30 },
  ];
  
  let totalCreated = 0;
  let totalSkipped = 0;
  const seenNames = new Set<string>();
  
  // Get existing influencers to avoid duplicates
  const existing = await prisma.influencer.findMany({
    select: { name: true },
  });
  existing.forEach(inf => seenNames.add(inf.name.toLowerCase()));
  
  console.log(`📊 Starting with ${existing.length} existing influencers\n`);
  
  for (const category of categories) {
    console.log(`\n📂 Category: ${category.name} (target: ${category.count})`);
    console.log('━'.repeat(60));
    
    // Fetch in batches of 20
    const batches = Math.ceil(category.count / 20);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchSize = Math.min(20, category.count - (batch * 20));
      
      console.log(`  Batch ${batch + 1}/${batches}: Fetching ${batchSize} influencers...`);
      
      const influencers = await askAIForInfluencers(category.name, batchSize);
      
      for (const inf of influencers) {
        try {
          const nameLower = inf.name.toLowerCase();
          
          // Check for duplicates
          if (seenNames.has(nameLower)) {
            console.log(`  ⏭️  Skipping ${inf.name} (duplicate)`);
            totalSkipped++;
            continue;
          }
          
          seenNames.add(nameLower);
          
          // Generate data
          const trustScore = generateTrustScore();
          const counts = generateCounts();
          const avgSentiment = (Math.random() - 0.3) * 2;
          const imageUrl = generateImageUrl(inf.name);
          
          // Create influencer
          await prisma.influencer.create({
            data: {
              name: inf.name,
              niche: category.name,
              trustScore,
              dramaCount: counts.dramaCount,
              goodActionCount: counts.goodActionCount,
              neutralCount: counts.neutralCount,
              avgSentiment,
              imageUrl,
              socialHandles: JSON.stringify({
                platform: inf.platform,
                followers: inf.followers,
              }),
            },
          });
          
          console.log(`  ✅ ${inf.name} - ${trustScore}% (${inf.platform}, ${inf.followers})`);
          totalCreated++;
          
          // Small delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`  ⏭️  Skipping ${inf.name} (already exists)`);
            totalSkipped++;
          } else {
            console.error(`  ❌ Error creating ${inf.name}:`, error.message);
          }
        }
      }
      
      // Delay between batches to respect rate limits
      if (batch < batches - 1) {
        console.log(`  ⏸️  Waiting 3 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  // Final summary
  const finalCount = await prisma.influencer.count();
  
  console.log('\n\n📊 FINAL SUMMARY:');
  console.log('━'.repeat(60));
  console.log(`✅ Created: ${totalCreated} new influencers`);
  console.log(`⏭️  Skipped: ${totalSkipped} duplicates`);
  console.log(`📈 Total in database: ${finalCount}`);
  console.log(`🎯 Target: 1000`);
  console.log(`📊 Progress: ${Math.round((finalCount / 1000) * 100)}%`);
  
  // Show top 10
  console.log('\n🏆 Top 10 by Trust Score:');
  const top10 = await prisma.influencer.findMany({
    orderBy: { trustScore: 'desc' },
    take: 10,
  });
  
  top10.forEach((inf, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
    console.log(`${medal} ${inf.name} - ${Math.round(inf.trustScore)}% (${inf.niche})`);
  });
  
  // Show distribution by category
  console.log('\n📂 Distribution by Category:');
  const categoryStats = await prisma.influencer.groupBy({
    by: ['niche'],
    _count: { niche: true },
    orderBy: { _count: { niche: 'desc' } },
  });
  
  categoryStats.forEach(cat => {
    if (cat.niche) {
      console.log(`  ${cat.niche}: ${cat._count.niche} influencers`);
    }
  });
}

async function main() {
  try {
    await populateFromAI();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
