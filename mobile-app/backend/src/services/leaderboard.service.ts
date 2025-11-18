import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class LeaderboardService {
  /**
   * Get top rated influencers
   */
  async getTopRated(limit: number = 20) {
    const influencers = await prisma.influencer.findMany({
      orderBy: { trustScore: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
        dramaCount: true,
        goodActionCount: true,
        lastUpdated: true,
        CommunityTrustScore: {
          select: {
            avgRating: true,
            totalRatings: true,
            communityScore: true,
            combinedScore: true,
          },
        },
      },
    });

    return influencers.map((inf, index) => ({
      ...inf,
      rank: index + 1,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Get most improved influencers (biggest positive score change)
   */
  async getMostImproved(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY', limit: number = 20) {
    const periodDate = this.getPeriodDate(period);

    // Get score changes from history
    const influencers = await prisma.$queryRaw<any[]>`
      SELECT 
        i.id,
        i.name,
        i."imageUrl",
        i.niche,
        i."trustScore" as "currentScore",
        (
          SELECT "trustScore" 
          FROM "AnalysisHistory" 
          WHERE "influencerId" = i.id 
            AND "analyzedAt" >= ${periodDate}
          ORDER BY "analyzedAt" ASC 
          LIMIT 1
        ) as "oldScore"
      FROM "Influencer" i
      WHERE EXISTS (
        SELECT 1 FROM "AnalysisHistory" 
        WHERE "influencerId" = i.id 
          AND "analyzedAt" >= ${periodDate}
      )
    `;

    const improved = influencers
      .filter(inf => inf.oldScore !== null)
      .map(inf => ({
        ...inf,
        scoreChange: inf.currentScore - inf.oldScore,
        scoreChangePercent: ((inf.currentScore - inf.oldScore) / Math.max(inf.oldScore, 1)) * 100,
      }))
      .filter(inf => inf.scoreChange > 0)
      .sort((a, b) => b.scoreChange - a.scoreChange)
      .slice(0, limit);

    return improved.map((inf, index) => ({
      ...inf,
      rank: index + 1,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Get highest risk influencers (biggest negative score change or low scores)
   */
  async getHighestRisk(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'WEEKLY', limit: number = 20) {
    const periodDate = this.getPeriodDate(period);

    // Get score changes from history
    const influencers = await prisma.$queryRaw<any[]>`
      SELECT 
        i.id,
        i.name,
        i."imageUrl",
        i.niche,
        i."trustScore" as "currentScore",
        i."dramaCount",
        (
          SELECT "trustScore" 
          FROM "AnalysisHistory" 
          WHERE "influencerId" = i.id 
            AND "analyzedAt" >= ${periodDate}
          ORDER BY "analyzedAt" ASC 
          LIMIT 1
        ) as "oldScore"
      FROM "Influencer" i
      WHERE EXISTS (
        SELECT 1 FROM "AnalysisHistory" 
        WHERE "influencerId" = i.id 
          AND "analyzedAt" >= ${periodDate}
      )
    `;

    const atRisk = influencers
      .filter(inf => inf.oldScore !== null)
      .map(inf => ({
        ...inf,
        scoreChange: inf.currentScore - inf.oldScore,
        scoreChangePercent: ((inf.currentScore - inf.oldScore) / Math.max(inf.oldScore, 1)) * 100,
        riskScore: this.calculateRiskScore(inf),
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);

    return atRisk.map((inf, index) => ({
      ...inf,
      rank: index + 1,
      badge: this.getRiskBadge(index + 1),
    }));
  }

  /**
   * Get trending influencers
   */
  async getTrending(limit: number = 20) {
    const trending = await prisma.trendingInfluencer.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { trendScore: 'desc' },
      take: limit,
    });

    const influencerIds = trending.map(t => t.influencerId);
    const influencers = await prisma.influencer.findMany({
      where: { id: { in: influencerIds } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
      },
    });

    const influencerMap = new Map(influencers.map(inf => [inf.id, inf]));

    return trending
      .map((t, index) => {
        const inf = influencerMap.get(t.influencerId);
        if (!inf) return null;

        return {
          ...inf,
          rank: index + 1,
          trendType: t.trendType,
          trendScore: t.trendScore,
          scoreChange: t.scoreChange,
          scoreChangePercent: t.scoreChangePercent,
          reason: t.reason,
          badge: this.getTrendBadge(t.trendType),
        };
      })
      .filter(Boolean);
  }

  /**
   * Get most active community members
   */
  async getMostActiveUsers(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'WEEKLY', limit: number = 20) {
    const periodDate = this.getPeriodDate(period);

    const users = await prisma.user.findMany({
      where: {
        CommunitySignal: {
          some: {
            createdAt: {
              gte: periodDate,
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        UserEngagementStats: true,
        CommunitySignal: {
          where: {
            createdAt: {
              gte: periodDate,
            },
          },
        },
      },
      take: limit * 2, // Get more to filter
    });

    const ranked = users
      .map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        avatar: user.avatar,
        role: user.role,
        activityCount: user.CommunitySignal.length,
        reputationScore: user.UserEngagementStats?.reputationScore || 50,
        level: user.UserEngagementStats?.level || 1,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit);

    return ranked.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Update trending influencers (run periodically)
   */
  async updateTrending() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get influencers with recent activity
    const influencers = await prisma.influencer.findMany({
      where: {
        OR: [
          { lastUpdated: { gte: weekAgo } },
          { CommunitySignal: { some: { createdAt: { gte: weekAgo } } } },
        ],
      },
      include: {
        AnalysisHistory: {
          where: { analyzedAt: { gte: weekAgo } },
          orderBy: { analyzedAt: 'asc' },
        },
        CommunitySignal: {
          where: { createdAt: { gte: weekAgo } },
        },
      },
    });

    const trendingData = [];

    for (const inf of influencers) {
      if (inf.AnalysisHistory.length < 2) continue;

      const oldScore = inf.AnalysisHistory[0].trustScore;
      const currentScore = inf.trustScore;
      const scoreChange = currentScore - oldScore;
      const scoreChangePercent = (scoreChange / Math.max(oldScore, 1)) * 100;

      // Calculate trend score
      const recentActivity = inf.CommunitySignal.filter(
        (s: any) => s.createdAt >= dayAgo
      ).length;

      const trendScore = Math.abs(scoreChangePercent) * 10 + recentActivity * 5;

      if (trendScore < 10) continue; // Not trending enough

      // Determine trend type
      let trendType = 'RISING';
      let reason = '';

      if (scoreChange > 10) {
        trendType = 'RISING';
        reason = `Score increased by ${scoreChange.toFixed(1)} points`;
      } else if (scoreChange < -10) {
        trendType = 'FALLING';
        reason = `Score decreased by ${Math.abs(scoreChange).toFixed(1)} points`;
      } else if (inf.dramaCount > 0 && recentActivity > 5) {
        trendType = 'CONTROVERSIAL';
        reason = `High community activity (${recentActivity} signals)`;
      } else if (scoreChange > 0 && inf.goodActionCount > inf.dramaCount) {
        trendType = 'IMPROVING';
        reason = `Positive trend with ${inf.goodActionCount} good actions`;
      }

      trendingData.push({
        influencerId: inf.id,
        trendType,
        trendScore,
        scoreChange,
        scoreChangePercent,
        periodStart: weekAgo,
        periodEnd: new Date(),
        reason,
      });
    }

    // Clear old trending data
    await prisma.trendingInfluencer.deleteMany({
      where: {
        createdAt: {
          lt: weekAgo,
        },
      },
    });

    // Insert new trending data
    if (trendingData.length > 0) {
      await prisma.trendingInfluencer.createMany({
        data: trendingData.map(t => ({
          ...t,
          id: randomUUID(),
        })),
      });
    }

    logger.info(`Updated trending influencers: ${trendingData.length} trending`);

    return trendingData.length;
  }

  /**
   * Helper: Get period start date
   */
  private getPeriodDate(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME'): Date {
    const now = Date.now();
    switch (period) {
      case 'DAILY':
        return new Date(now - 24 * 60 * 60 * 1000);
      case 'WEEKLY':
        return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case 'MONTHLY':
        return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case 'ALL_TIME':
        return new Date(0); // Beginning of time
      default:
        return new Date(now - 7 * 24 * 60 * 60 * 1000); // Default to weekly
    }
  }

  /**
   * Helper: Calculate risk score
   */
  private calculateRiskScore(inf: any): number {
    let risk = 0;

    // Low trust score = high risk
    if (inf.currentScore < 40) risk += 50;
    else if (inf.currentScore < 60) risk += 25;

    // Negative score change = high risk
    if (inf.scoreChange < -10) risk += 30;
    else if (inf.scoreChange < -5) risk += 15;

    // High drama count = high risk
    risk += Math.min(inf.dramaCount * 5, 20);

    return risk;
  }

  /**
   * Helper: Get rank badge
   */
  private getRankBadge(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '⭐';
    return '';
  }

  /**
   * Helper: Get risk badge
   */
  private getRiskBadge(rank: number): string {
    if (rank === 1) return '🚨';
    if (rank === 2) return '⚠️';
    if (rank === 3) return '⚡';
    return '🔴';
  }

  /**
   * Get top contributors (all users with drama/positive reports)
   */
  async getTopContributors(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'ALL_TIME', limit: number = 20) {
    const periodDate = period === 'ALL_TIME' ? new Date(0) : this.getPeriodDate(period);

    const users = await prisma.user.findMany({
      where: {
        CommunitySignal: {
          some: {
            createdAt: { gte: periodDate },
            type: { in: ['DRAMA_REPORT', 'POSITIVE_ACTION'] },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        subscriptionTier: true,
        UserEngagementStats: true,
        CommunitySignal: {
          where: {
            createdAt: { gte: periodDate },
            type: { in: ['DRAMA_REPORT', 'POSITIVE_ACTION'] },
          },
          select: {
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const ranked = users
      .map(user => {
        const dramaReports = user.CommunitySignal.filter(s => s.type === 'DRAMA_REPORT').length;
        const positiveReports = user.CommunitySignal.filter(s => s.type === 'POSITIVE_ACTION').length;
        const verifiedReports = user.CommunitySignal.filter(s => s.status === 'VERIFIED').length;
        const pendingReports = user.CommunitySignal.filter(s => s.status === 'PENDING').length;
        const totalReports = dramaReports + positiveReports;

        return {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          avatar: user.avatar,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          dramaReports,
          positiveReports,
          totalReports,
          verifiedReports,
          pendingReports,
          reputationScore: user.UserEngagementStats?.reputationScore || 50,
          level: user.UserEngagementStats?.level || 1,
        };
      })
      .filter(user => user.totalReports > 0)
      .sort((a, b) => {
        // Sort by verified reports first, then pending, then total
        if (b.verifiedReports !== a.verifiedReports) {
          return b.verifiedReports - a.verifiedReports;
        }
        if (b.pendingReports !== a.pendingReports) {
          return b.pendingReports - a.pendingReports;
        }
        return b.totalReports - a.totalReports;
      })
      .slice(0, limit);

    return ranked.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: this.getContributorBadge(index + 1),
    }));
  }

  /**
   * Get top drama reporters (all users with drama reports)
   */
  async getTopDramaReporters(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'ALL_TIME', limit: number = 20) {
    const periodDate = period === 'ALL_TIME' ? new Date(0) : this.getPeriodDate(period);

    const users = await prisma.user.findMany({
      where: {
        CommunitySignal: {
          some: {
            createdAt: { gte: periodDate },
            type: 'DRAMA_REPORT',
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        subscriptionTier: true,
        UserEngagementStats: true,
        CommunitySignal: {
          where: {
            createdAt: { gte: periodDate },
            type: 'DRAMA_REPORT',
          },
          select: {
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const ranked = users
      .map(user => {
        const dramaReports = user.CommunitySignal.length;
        const verifiedReports = user.CommunitySignal.filter(s => s.status === 'VERIFIED').length;
        const pendingReports = user.CommunitySignal.filter(s => s.status === 'PENDING').length;

        return {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          avatar: user.avatar,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          dramaReports,
          verifiedReports,
          pendingReports,
          positiveReports: 0,
          totalReports: dramaReports,
          reputationScore: user.UserEngagementStats?.reputationScore || 50,
          level: user.UserEngagementStats?.level || 1,
        };
      })
      .filter(user => user.dramaReports > 0)
      .sort((a, b) => {
        // Sort by verified reports first, then pending, then total
        if (b.verifiedReports !== a.verifiedReports) {
          return b.verifiedReports - a.verifiedReports;
        }
        if (b.pendingReports !== a.pendingReports) {
          return b.pendingReports - a.pendingReports;
        }
        return b.dramaReports - a.dramaReports;
      })
      .slice(0, limit);

    return ranked.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: this.getDramaBadge(index + 1),
    }));
  }

  /**
   * Get top positive action reporters (all users with positive action reports)
   */
  async getTopPositiveReporters(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME' = 'ALL_TIME', limit: number = 20) {
    const periodDate = period === 'ALL_TIME' ? new Date(0) : this.getPeriodDate(period);

    const users = await prisma.user.findMany({
      where: {
        CommunitySignal: {
          some: {
            createdAt: { gte: periodDate },
            type: 'POSITIVE_ACTION',
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        subscriptionTier: true,
        UserEngagementStats: true,
        CommunitySignal: {
          where: {
            createdAt: { gte: periodDate },
            type: 'POSITIVE_ACTION',
          },
          select: {
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const ranked = users
      .map(user => {
        const positiveReports = user.CommunitySignal.length;
        const verifiedReports = user.CommunitySignal.filter(s => s.status === 'VERIFIED').length;
        const pendingReports = user.CommunitySignal.filter(s => s.status === 'PENDING').length;

        return {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
          avatar: user.avatar,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          dramaReports: 0,
          positiveReports,
          verifiedReports,
          pendingReports,
          totalReports: positiveReports,
          reputationScore: user.UserEngagementStats?.reputationScore || 50,
          level: user.UserEngagementStats?.level || 1,
        };
      })
      .filter(user => user.positiveReports > 0)
      .sort((a, b) => {
        // Sort by verified reports first, then pending, then total
        if (b.verifiedReports !== a.verifiedReports) {
          return b.verifiedReports - a.verifiedReports;
        }
        if (b.pendingReports !== a.pendingReports) {
          return b.pendingReports - a.pendingReports;
        }
        return b.positiveReports - a.positiveReports;
      })
      .slice(0, limit);

    return ranked.map((user, index) => ({
      ...user,
      rank: index + 1,
      badge: this.getPositiveBadge(index + 1),
    }));
  }

  /**
   * Helper: Get contributor badge
   */
  private getContributorBadge(rank: number): string {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '⭐';
    return '🎖️';
  }

  /**
   * Helper: Get drama reporter badge
   */
  private getDramaBadge(rank: number): string {
    if (rank === 1) return '🚨';
    if (rank === 2) return '⚠️';
    if (rank === 3) return '🔴';
    if (rank <= 10) return '🔍';
    return '👁️';
  }

  /**
   * Helper: Get positive reporter badge
   */
  private getPositiveBadge(rank: number): string {
    if (rank === 1) return '✨';
    if (rank === 2) return '🌟';
    if (rank === 3) return '⭐';
    if (rank <= 10) return '💫';
    return '🌠';
  }

  /**
   * Helper: Get trend badge
   */
  private getTrendBadge(trendType: string): string {
    switch (trendType) {
      case 'RISING': return '📈';
      case 'FALLING': return '📉';
      case 'CONTROVERSIAL': return '🔥';
      case 'IMPROVING': return '✨';
      default: return '📊';
    }
  }

  /**
   * Get user activity details (for user profile screen)
   */
  async getUserActivity(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        UserEngagementStats: true,
        CommunitySignal: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 activities
          select: {
            id: true,
            type: true,
            rating: true,
            comment: true,
            status: true,
            isVerified: true,
            createdAt: true,
            Influencer: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                niche: true,
              },
            },
          },
        },
        UserAchievement: {
          where: { unlockedAt: { not: null } },
          orderBy: { unlockedAt: 'desc' },
          select: {
            achievementType: true,
            achievementLevel: true,
            unlockedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate statistics
    const stats = {
      totalActivities: user.CommunitySignal.length,
      dramaReports: user.CommunitySignal.filter(s => s.type === 'DRAMA_REPORT').length,
      positiveReports: user.CommunitySignal.filter(s => s.type === 'POSITIVE_ACTION').length,
      ratings: user.CommunitySignal.filter(s => s.type === 'RATING').length,
      verifiedReports: user.CommunitySignal.filter(s => s.status === 'VERIFIED').length,
      pendingReports: user.CommunitySignal.filter(s => s.status === 'PENDING').length,
      rejectedReports: user.CommunitySignal.filter(s => s.status === 'REJECTED').length,
    };

    // Group activities by influencer
    const influencerActivity = new Map<string, any>();
    user.CommunitySignal.forEach(signal => {
      const infId = signal.Influencer.id;
      if (!influencerActivity.has(infId)) {
        influencerActivity.set(infId, {
          influencer: signal.Influencer,
          activities: [],
        });
      }
      influencerActivity.get(infId).activities.push({
        id: signal.id,
        type: signal.type,
        rating: signal.rating,
        comment: signal.comment,
        status: signal.status,
        isVerified: signal.isVerified,
        createdAt: signal.createdAt,
      });
    });

    return {
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        memberSince: user.createdAt,
        level: user.UserEngagementStats?.level || 1,
        experiencePoints: user.UserEngagementStats?.experiencePoints || 0,
        reputationScore: user.UserEngagementStats?.reputationScore || 50,
        streak: user.UserEngagementStats?.streak || 0,
      },
      stats,
      recentActivities: user.CommunitySignal.map(signal => ({
        id: signal.id,
        type: signal.type,
        rating: signal.rating,
        comment: signal.comment,
        status: signal.status,
        isVerified: signal.isVerified,
        createdAt: signal.createdAt,
        influencer: signal.Influencer,
      })),
      influencerBreakdown: Array.from(influencerActivity.values()),
      achievements: user.UserAchievement,
    };
  }
}

export default new LeaderboardService();
