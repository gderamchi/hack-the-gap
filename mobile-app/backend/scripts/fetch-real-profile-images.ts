import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BLACKBOX_API_KEY = 'sk-8OyzCHGCmjs5uft_9NNl1w';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';

async function fetchRealProfileImage(name: string, platform: string): Promise<string | null> {
  console.log(`  🔍 Searching for ${name}'s real profile image...`);
  
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: `Find the official profile picture URL for French influencer "${name}" on ${platform}. 
            
Search for their official ${platform} profile image, Instagram profile picture, or official website photo.

Return ONLY a direct image URL (must end in .jpg, .jpeg, .png, .webp). 
If you find multiple, return the highest quality one.
If not found, return exactly: "NOT_FOUND"

Format: https://example.com/image.jpg`
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
        timeout: 30000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    // Extract URL
    const urlMatch = content.match(/(https?:\/\/[^\s<>"]+?\.(jpg|jpeg|png|webp|gif))/i);
    if (urlMatch) {
      console.log(`    ✅ Found: ${urlMatch[1].substring(0, 60)}...`);
      return urlMatch[1];
    }
    
    console.log(`    ⚠️  No image URL found`);
    return null;
    
  } catch (error: any) {
    console.error(`    ❌ Error: ${error.message}`);
    return null;
  }
}

async function updateWithRealImages() {
  console.log('🖼️  FETCHING REAL PROFILE IMAGES\n');
  console.log('Using Perplexity to find actual profile photos...\n');
  
  // Start with top influencers (most important)
  const influencers = await prisma.influencer.findMany({
    orderBy: { trustScore: 'desc' },
    take: 100, // Update top 100 first
  });
  
  console.log(`Processing ${influencers.length} influencers...\n`);
  
  let foundReal = 0;
  let usedFallback = 0;
  
  for (let i = 0; i < influencers.length; i++) {
    const inf = influencers[i];
    const socialHandles = inf.socialHandles ? JSON.parse(inf.socialHandles) : {};
    const platform = socialHandles.platform || 'YouTube';
    
    console.log(`\n[${i + 1}/${influencers.length}] ${inf.name} (${platform})`);
    
    const realImageUrl = await fetchRealProfileImage(inf.name, platform);
    
    if (realImageUrl) {
      await prisma.influencer.update({
        where: { id: inf.id },
        data: { imageUrl: realImageUrl },
      });
      foundReal++;
    } else {
      // Use high-quality fallback
      const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(inf.name)}&size=400&backgroundColor=random`;
      await prisma.influencer.update({
        where: { id: inf.id },
        data: { imageUrl: fallbackUrl },
      });
      usedFallback++;
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Progress update
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${influencers.length}`);
      console.log(`   ✅ Real images: ${foundReal}`);
      console.log(`   ⚠️  Fallbacks: ${usedFallback}\n`);
    }
  }
  
  console.log('\n\n🎉 COMPLETE!');
  console.log('━'.repeat(60));
  console.log(`✅ Real images found: ${foundReal}`);
  console.log(`⚠️  Fallback avatars: ${usedFallback}`);
  console.log(`📊 Total updated: ${influencers.length}`);
}

updateWithRealImages().then(() => process.exit(0)).catch(console.error);
