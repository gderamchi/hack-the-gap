import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class TransparencyService {
  /**
   * Calculate and log score impact for a mention
   */
  async calculateMentionImpact(mentionId: string): Promise<number> {
    const mention = await prisma.mention.findUnique({
      where: { id: mentionId },
      include: { influencer: true },
    });

    if (!mention) {
      throw new Error('Mention not found');
    }

    // Calculate impact based on label and sentiment
    let impact = 0;
    const severity = mention.severity || 'MEDIUM';

    // Severity multipliers
    const severityMultiplier = {
      LOW: 0.5,
      MEDIUM: 1.0,
      HIGH: 1.5,
      CRITICAL: 2.0,
    }[severity] || 1.0;

    // Base impact by label
    if (mention.label === 'drama') {
      impact = -15 * severityMultiplier;
    } else if (mention.label === 'good_action') {
      impact = 10 * severityMultiplier;
    } else {
      impact = 0;
    }

    // Adjust by sentiment
    impact += mention.sentimentScore * 5;

    // Update mention with calculated impact
    await prisma.mention.update({
      where: { id: mentionId },
      data: { scoreImpact: impact },
    });

    return impact;
  }

  /**
   * Get score impact breakdown for an influencer
   */
  async getScoreBreakdown(influencerId: string) {
    const [mentions, communitySignals, impactLogs] = await Promise.all([
      prisma.mention.findMany({
        where: { influencerId },
        orderBy: { scrapedAt: 'desc' },
        take: 50,
      }),
      prisma.communitySignal.findMany({
        where: { influencerId, isHidden: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.scoreImpactLog.findMany({
        where: { influencerId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Calculate AI score components
    const dramaImpact = mentions
      .filter(m => m.label === 'drama')
      .reduce((sum, m) => sum + (m.scoreImpact || 0), 0);

    const positiveImpact = mentions
      .filter(m => m.label === 'good_action')
      .reduce((sum, m) => sum + (m.scoreImpact || 0), 0);

    const sentimentImpact = mentions.reduce(
      (sum, m) => sum + m.sentimentScore * 5,
      0
    ) / Math.max(mentions.length, 1);

    // Calculate community score components
    const ratingImpact = communitySignals
      .filter(s => s.type === 'RATING' && s.rating)
      .reduce((sum, s) => sum + ((s.rating! - 3) * 10), 0) / Math.max(
        communitySignals.filter(s => s.type === 'RATING').length,
        1
      );

    const communityDramaImpact = -communitySignals.filter(
      s => s.type === 'DRAMA_REPORT'
    ).length * 5;

    const communityPositiveImpact = communitySignals.filter(
      s => s.type === 'POSITIVE_ACTION'
    ).length * 5;

    return {
      aiScore: {
        total: 50 + dramaImpact + positiveImpact + sentimentImpact,
        components: {
          base: 50,
          dramaImpact: Math.round(dramaImpact * 10) / 10,
          positiveImpact: Math.round(positiveImpact * 10) / 10,
          sentimentImpact: Math.round(sentimentImpact * 10) / 10,
        },
        topDramas: mentions
          .filter(m => m.label === 'drama')
          .sort((a, b) => (a.scoreImpact || 0) - (b.scoreImpact || 0))
          .slice(0, 5)
          .map(m => ({
            id: m.id,
            text: m.textExcerpt,
            source: m.source,
            sourceUrl: m.sourceUrl,
            impact: m.scoreImpact || 0,
            severity: m.severity,
            date: m.scrapedAt,
          })),
        topPositive: mentions
          .filter(m => m.label === 'good_action')
          .sort((a, b) => (b.scoreImpact || 0) - (a.scoreImpact || 0))
          .slice(0, 5)
          .map(m => ({
            id: m.id,
            text: m.textExcerpt,
            source: m.source,
            sourceUrl: m.sourceUrl,
            impact: m.scoreImpact || 0,
            severity: m.severity,
            date: m.scrapedAt,
          })),
      },
      communityScore: {
        total: 50 + ratingImpact + communityDramaImpact + communityPositiveImpact,
        components: {
          base: 50,
          ratingImpact: Math.round(ratingImpact * 10) / 10,
          dramaImpact: communityDramaImpact,
          positiveImpact: communityPositiveImpact,
        },
      },
      recentImpacts: impactLogs.map(log => ({
        id: log.id,
        eventType: log.eventType,
        impactType: log.impactType,
        impactAmount: log.impactAmount,
        oldScore: log.oldScore,
        newScore: log.newScore,
        reason: log.reason,
        date: log.createdAt,
      })),
    };
  }

  /**
   * Log a score impact event
   */
  async logScoreImpact(data: {
    influencerId: string;
    eventType: string;
    eventId: string;
    impactType: string;
    impactAmount: number;
    oldScore: number;
    newScore: number;
    reason: string;
    details?: any;
  }) {
    const log = await prisma.scoreImpactLog.create({
      data: {
        influencerId: data.influencerId,
        eventType: data.eventType,
        eventId: data.eventId,
        impactType: data.impactType,
        impactAmount: data.impactAmount,
        oldScore: data.oldScore,
        newScore: data.newScore,
        reason: data.reason,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });

    logger.info(`Score impact logged for influencer ${data.influencerId}: ${data.reason} (${data.impactAmount > 0 ? '+' : ''}${data.impactAmount})`);

    return log;
  }

  /**
   * Update mention severity
   */
  async updateMentionSeverity(
    mentionId: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    userId: string
  ) {
    const mention = await prisma.mention.findUnique({
      where: { id: mentionId },
      include: { influencer: true },
    });

    if (!mention) {
      throw new Error('Mention not found');
    }

    const oldSeverity = mention.severity;
    const oldImpact = mention.scoreImpact || 0;

    // Update severity
    await prisma.mention.update({
      where: { id: mentionId },
      data: {
        severity,
        verifiedBy: userId,
        verifiedAt: new Date(),
        isVerified: true,
      },
    });

    // Recalculate impact
    const newImpact = await this.calculateMentionImpact(mentionId);

    logger.info(`Mention ${mentionId} severity updated from ${oldSeverity} to ${severity} by user ${userId}`);

    return {
      oldSeverity,
      newSeverity: severity,
      oldImpact,
      newImpact,
    };
  }

  /**
   * Get event timeline for an influencer
   */
  async getEventTimeline(influencerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = { influencerId };

    if (options?.startDate || options?.endDate) {
      where.scrapedAt = {};
      if (options.startDate) {
        where.scrapedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.scrapedAt.lte = options.endDate;
      }
    }

    const mentions = await prisma.mention.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
      take: options?.limit || 100,
      include: {
        responses: {
          include: {
            influencer: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const communitySignals = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        isHidden: false,
        createdAt: where.scrapedAt || undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 100,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        responses: {
          include: {
            influencer: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Combine and sort by date
    const timeline = [
      ...mentions.map(m => ({
        type: 'MENTION' as const,
        id: m.id,
        date: m.scrapedAt,
        label: m.label,
        severity: m.severity,
        scoreImpact: m.scoreImpact,
        source: m.source,
        sourceUrl: m.sourceUrl,
        text: m.textExcerpt,
        sentiment: m.sentimentScore,
        isVerified: m.isVerified,
        responses: m.responses,
      })),
      ...communitySignals.map(s => ({
        type: 'COMMUNITY_SIGNAL' as const,
        id: s.id,
        date: s.createdAt,
        signalType: s.type,
        rating: s.rating,
        comment: s.comment,
        user: s.user,
        responses: s.responses,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }
}

export default new TransparencyService();
