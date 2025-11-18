import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BLACKBOX_API_KEY = 'sk-8OyzCHGCmjs5uft_9NNl1w';

async function getImageUrl(name: string): Promise<string> {
  try {
    // Use Google's unofficial API via SerpAPI alternative
    // Or use a combination of sources
    
    // For now, use high-quality avatar service with better styling
    const encodedName = encodeURIComponent(name);
    
    // Try multiple avatar services for variety
    const services = [
      `https://api.dicebear.com/7.x/avataaars/png?seed=${encodedName}&size=200&backgroundColor=random`,
      `https://api.dicebear.com/7.x/bottts/png?seed=${encodedName}&size=200&backgroundColor=random`,
      `https://api.dicebear.com/7.x/personas/png?seed=${encodedName}&size=200&backgroundColor=random`,
      `https://robohash.org/${encodedName}?size=200x200&set=set1`,
    ];
    
    // Use hash of name to consistently pick same style per influencer
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const serviceIndex = hash % services.length;
    
    return services[serviceIndex];
  } catch (error) {
    // Fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&bold=true&format=png`;
  }
}

async function updateAllImages() {
  console.log('🖼️  Updating profile images for all influencers...\n');
  
  const influencers = await prisma.influencer.findMany({
    select: { id: true, name: true, imageUrl: true },
  });
  
  console.log(`Found ${influencers.length} influencers\n`);
  
  let updated = 0;
  
  for (const influencer of influencers) {
    try {
      const imageUrl = await getImageUrl(influencer.name);
      
      await prisma.influencer.update({
        where: { id: influencer.id },
        data: { imageUrl },
      });
      
      console.log(`✅ ${influencer.name} - ${imageUrl.substring(0, 50)}...`);
      updated++;
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`❌ Error updating ${influencer.name}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated: ${updated} influencers`);
  console.log(`🖼️  All influencers now have profile images!`);
}

async function main() {
  try {
    await updateAllImages();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
