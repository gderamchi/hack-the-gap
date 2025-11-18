import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findDuplicates() {
  console.log('🔍 Searching for duplicate influencers...\n');
  
  try {
    // Find duplicates by name (case-insensitive)
    const duplicates = await prisma.$queryRaw<any[]>`
      SELECT 
        LOWER(name) as lower_name,
        MAX(name) as name,
        COUNT(*) as count, 
        STRING_AGG(id::text, ', ') as ids,
        STRING_AGG("imageUrl", ' | ') as images
      FROM "Influencer"
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;
    
    console.log(`Found ${duplicates.length} duplicate names:\n`);
    
    for (const dup of duplicates) {
      console.log(`📛 ${dup.name} - ${dup.count} entries`);
      console.log(`   IDs: ${dup.ids}`);
      console.log(`   Images: ${dup.images?.substring(0, 100)}...\n`);
    }
    
    // Get total influencer count
    const total = await prisma.influencer.count();
    console.log(`\n📊 Total influencers: ${total}`);
    console.log(`📊 Duplicate entries: ${duplicates.reduce((sum, d) => sum + (parseInt(d.count) - 1), 0)}`);
    console.log(`📊 Unique influencers after cleanup: ${total - duplicates.reduce((sum, d) => sum + (parseInt(d.count) - 1), 0)}`);
    
  } catch (error) {
    console.error('Error finding duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findDuplicates();
