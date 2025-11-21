import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';

async function fetchImageUrlForInfluencer(name: string, platform: string): Promise<string | null> {
  try {
    // Try to get real image URL from web search
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: 'blackboxai/perplexity/sonar-pro',
        messages: [
          {
            role: 'user',
            content: `Find the official profile picture URL for French influencer "${name}" on ${platform}. Return ONLY the direct image URL, nothing else. If not found, return "NOT_FOUND".`
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
        timeout: 15000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    // Extract URL from response
    const urlMatch = content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|webp|gif))/i);
    if (urlMatch) {
      return urlMatch[1];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function updateImagesForInfluencers() {
  console.log('🖼️  Fetching real profile images for influencers...\n');
  
  // Get influencers without images
  const influencers = await prisma.influencer.findMany({
    where: {
      OR: [
        { imageUrl: null },
        { imageUrl: { contains: 'ui-avatars.com' } },
      ],
    },
    take: 100, // Process 100 at a time
  });
  
  console.log(`Found ${influencers.length} influencers needing images\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const influencer of influencers) {
    try {
      const socialHandles = influencer.socialHandles 
        ? JSON.parse(influencer.socialHandles) 
        : { platform: 'YouTube' };
      
      console.log(`🔍 Fetching image for ${influencer.name}...`);
      
      const imageUrl = await fetchImageUrlForInfluencer(
        influencer.name,
        socialHandles.platform || 'YouTube'
      );
      
      if (imageUrl) {
        await prisma.influencer.update({
          where: { id: influencer.id },
          data: { imageUrl },
        });
        console.log(`  ✅ Updated with real image`);
        updated++;
      } else {
        // Use better placeholder
        const fallbackUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(influencer.name)}&size=200`;
        await prisma.influencer.update({
          where: { id: influencer.id },
          data: { imageUrl: fallbackUrl },
        });
        console.log(`  ⚠️  Using avatar placeholder`);
        failed++;
      }
      
      // Delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ❌ Error for ${influencer.name}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated with real images: ${updated}`);
  console.log(`⚠️  Using placeholders: ${failed}`);
}

async function main() {
  try {
    await updateImagesForInfluencers();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
