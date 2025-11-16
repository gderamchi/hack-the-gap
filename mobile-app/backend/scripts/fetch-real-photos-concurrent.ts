import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const prisma = new PrismaClient();
const supabase = createClient(
  'https://ffvgvjymkiaiasfrhqih.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdmd2anlta2lhaWFzZnJocWloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIyNzgzNiwiZXhwIjoyMDc4ODAzODM2fQ.fbdv6_QijazMiKo79QXDJWsVQVk-oHT9M_tbRzRysRs'
);

const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';
const CONCURRENT_LIMIT = 5; // Process 5 at a time

async function findRealProfileImage(name: string, platform: string): Promise<string | null> {
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: `Find the DIRECT profile picture URL for French influencer "${name}" on ${platform}. Search for their official ${platform} profile picture, Instagram, YouTube, or TikTok profile image. Return ONLY the direct image URL (must end in .jpg, .jpeg, .png, .webp or be from yt3.googleusercontent.com, fbcdn.net, jtvnw.net). If found, return just the URL. If not found, return exactly: NOT_FOUND`
          }
        ],
        stream: false,
        webSearch: true,
      },
      {
        headers: {
          'Authorization': 'Bearer ' + BLACKBOX_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    
    const content = response.data.choices?.[0]?.message?.content || '';
    
    // Extract URL from response
    const urlPatterns = [
      /(https?:\/\/yt3\.googleusercontent\.com\/[^\s<>"]+)/i,
      /(https?:\/\/[^\s]*instagram[^\s]*\.fbcdn\.net\/[^\s<>"]+\.(jpg|jpeg|png|webp))/i,
      /(https?:\/\/static-cdn\.jtvnw\.net\/[^\s<>"]+)/i,
      /(https?:\/\/[^\s<>"]+\.(jpg|jpeg|png|webp))/i,
    ];
    
    for (const pattern of urlPatterns) {
      const match = content.match(pattern);
      if (match) {
        // Verify URL is accessible
        try {
          const testResponse = await axios.head(match[1], { timeout: 5000 });
          if (testResponse.status === 200) {
            return match[1];
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

async function processInfluencer(influencer: any): Promise<{ name: string; success: boolean; imageUrl: string | null }> {
  const socialHandles = influencer.socialHandles ? JSON.parse(influencer.socialHandles) : {};
  const platform = socialHandles.platform || 'YouTube';
  
  console.log('  🔍 Searching for ' + influencer.name + ' (' + platform + ')...');
  
  const imageUrl = await findRealProfileImage(influencer.name, platform);
  
  if (imageUrl) {
    // Update in both databases
    await Promise.all([
      prisma.influencer.update({
        where: { id: influencer.id },
        data: { imageUrl },
      }),
      supabase.from('Influencer').update({ imageUrl }).eq('id', influencer.id),
    ]);
    
    console.log('    ✅ Found: ' + imageUrl.substring(0, 60) + '...');
    return { name: influencer.name, success: true, imageUrl };
  } else {
    console.log(\`    ⚠️  No real image found\`);
    return { name: influencer.name, success: false, imageUrl: null };
  }
}

async function processBatch(influencers: any[]): Promise<void> {
  const promises = influencers.map(inf => processInfluencer(inf));
  await Promise.all(promises);
}

async function fetchAllRealPhotos() {
  console.log('🖼️  FETCHING REAL PROFILE PHOTOS - CONCURRENT MODE\n');
  console.log('Using Perplexity to find actual profile pictures...\n');
  
  const influencers = await prisma.influencer.findMany({
    orderBy: { trustScore: 'desc' },
  });
  
  console.log('Found ' + influencers.length + ' influencers\n');
  console.log('Processing ' + CONCURRENT_LIMIT + ' at a time...\n');
  
  let totalFound = 0;
  let totalProcessed = 0;
  
  // Process in batches
  for (let i = 0; i < influencers.length; i += CONCURRENT_LIMIT) {
    const batch = influencers.slice(i, i + CONCURRENT_LIMIT);
    
    console.log('\n[Batch ' + (Math.floor(i / CONCURRENT_LIMIT) + 1) + '/' + Math.ceil(influencers.length / CONCURRENT_LIMIT) + ']');
    
    const results = await Promise.all(batch.map(inf => processInfluencer(inf)));
    
    const found = results.filter(r => r.success).length;
    totalFound += found;
    totalProcessed += batch.length;
    
    console.log('  Batch complete: ' + found + '/' + batch.length + ' real images found');
    console.log('  Total progress: ' + totalProcessed + '/' + influencers.length + ' (' + Math.round((totalProcessed/influencers.length)*100) + '%)');
    console.log('  Real images so far: ' + totalFound);
    
    // Small delay between batches
    if (i + CONCURRENT_LIMIT < influencers.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n\n🎉 COMPLETE!');
  console.log('━'.repeat(60));
  console.log('✅ Real images found: ' + totalFound + '/' + influencers.length);
  console.log('📊 Success rate: ' + Math.round((totalFound/influencers.length)*100) + '%');
  console.log('⚠️  Using placeholders: ' + (influencers.length - totalFound));
  
  // Show some examples
  const withReal = await prisma.influencer.findMany({
    where: {
      OR: [
        { imageUrl: { contains: 'googleusercontent' } },
        { imageUrl: { contains: 'fbcdn' } },
        { imageUrl: { contains: 'jtvnw' } },
      ],
    },
    select: { name: true, imageUrl: true },
    take: 10,
  });
  
  console.log('\n✅ Examples of real images:');
  withReal.forEach(inf => {
    console.log('  - ' + inf.name);
    console.log('    ' + (inf.imageUrl?.substring(0, 80) || '') + '...');
  });
}

async function main() {
  try {
    await fetchAllRealPhotos();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
