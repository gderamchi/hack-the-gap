import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test User table
    const userCount = await prisma.user.count();
    console.log(`✅ Users in database: ${userCount}`);

    // Test Influencer table
    const influencerCount = await prisma.influencer.count();
    console.log(`✅ Influencers in database: ${influencerCount}`);

    // Test CommunitySignal table
    const signalCount = await prisma.communitySignal.count();
    console.log(`✅ Community signals in database: ${signalCount}`);

    // Test UserEngagementStats table
    const statsCount = await prisma.userEngagementStats.count();
    console.log(`✅ User engagement stats in database: ${statsCount}`);

    // Get sample users with signals
    const usersWithSignals = await prisma.user.findMany({
      where: {
        CommunitySignal: {
          some: {},
        },
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            CommunitySignal: true,
          },
        },
      },
    });

    console.log(`\n📊 Sample users with signals (${usersWithSignals.length}):`);
    usersWithSignals.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}): ${user._count.CommunitySignal} signals`);
    });

    // Get sample signals
    const signals = await prisma.communitySignal.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        User: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Influencer: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`\n📝 Recent signals (${signals.length}):`);
    signals.forEach(signal => {
      console.log(`  - ${signal.type} by ${signal.User.firstName} ${signal.User.lastName} for ${signal.Influencer.name} (${signal.status})`);
    });

    console.log('\n✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
