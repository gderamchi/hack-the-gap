import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const BLACKBOX_API_KEY = 'sk-gsrAXDLWPGMK2i3jKlpTIw';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';

async function generateSummary(name: string, niche: string): Promise<string> {
  try {
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: `Write a 2-sentence summary about French influencer "${name}" (${niche}). Focus on who they are and their reputation. Be concise and factual.`
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
    
    return response.data.choices?.[0]?.message?.content || `${name} is a French ${niche} influencer.`;
  } catch (error) {
    return `${name} is a French ${niche} influencer.`;
  }
}

async function quickUpdate() {
  console.log('🚀 Quick Update - Top 50 Influencers\n');
  
  const influencers = await prisma.influencer.findMany({
    orderBy: { trustScore: 'desc' },
    take: 50,
  });
  
  console.log(`Updating ${influencers.length} influencers with summaries...\n`);
  
  for (let i = 0; i < influencers.length; i++) {
    const inf = influencers[i];
    console.log(`[${i + 1}/50] ${inf.name}...`);
    
    const summary = await generateSummary(inf.name, inf.niche || 'General');
    
    await prisma.influencer.update({
      where: { id: inf.id },
      data: { summary },
    });
    
    console.log(`  ✅ ${summary.substring(0, 80)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✅ Complete! Top 50 influencers updated with summaries.');
}

quickUpdate().then(() => process.exit(0)).catch(console.error);
