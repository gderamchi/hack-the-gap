import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';
import gamificationService from './gamification.service';
import verificationService from './verification.service';
import emailService from './email.service';
import subscriptionService from './subscription.service';
import duplicateService from './duplicate.service';

const prisma = new PrismaClient();

export interface CreateSignalInput {
  userId: string;
  influencerId: string;
  type: 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION' | 'COMMENT';
  rating?: number;
  comment?: string;
  tags?: string[];
}

export interface GetSignalsOptions {
  influencerId?: string;
  userId?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export class CommunityService {
  /**
   * Create a community signal (rating, report, comment)
   */
  async createSignal(input: CreateSignalInput) {
    // Validate input
    if (input.type === 'RATING' && (!input.rating || input.rating < 1 || input.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check subscription limits for reports (not ratings)
    if (input.type === 'DRAMA_REPORT' || input.type === 'POSITIVE_ACTION') {
      const canSubmit = await subscriptionService.canUserSubmitReport(input.userId);
      
      if (!canSubmit.allowed) {
        throw new Error(canSubmit.reason || 'Report limit reached');
      }
    }

    // Check for duplicates (for reports with comments)
    if (input.comment && (input.type === 'DRAMA_REPORT' || input.type === 'POSITIVE_ACTION')) {
      const duplicateCheck = await duplicateService.checkDuplicate(
        input.influencerId,
        input.type,
        input.comment
      );

      if (duplicateCheck.isDuplicate) {
        throw new Error(
          `This information has already been reported (${duplicateCheck.similarity}% similar). ` +
          `Please check existing reports before submitting.`
        );
      }
    }

    // Check if user already has a signal of this type for this influencer
    const existing = await prisma.communitySignal.findFirst({
      where: {
        userId: input.userId,
        influencerId: input.influencerId,
        type: input.type,
      },
    });

    // Generate content hash for duplicate detection
    const contentHash = input.comment 
      ? crypto.createHash('sha256').update(input.comment.toLowerCase().trim()).digest('hex')
      : null;

    let signal;

    if (existing) {
      // Update existing signal
      signal = await prisma.communitySignal.update({
        where: { id: existing.id },
        data: {
          rating: input.rating,
          comment: input.comment,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          contentHash,
          updatedAt: new Date(),
        },
      });
      logger.info(`Updated signal ${signal.id} by user ${input.userId}`);
    } else {
      // Create new signal
      signal = await prisma.communitySignal.create({
        data: {
          userId: input.userId,
          influencerId: input.influencerId,
          type: input.type,
          rating: input.rating,
          comment: input.comment,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          contentHash,
        },
      });
      logger.info(`Created signal ${signal.id} by user ${input.userId}`);
      
      // Increment report count for subscription limits
      if (input.type === 'DRAMA_REPORT' || input.type === 'POSITIVE_ACTION') {
        await subscriptionService.incrementReportCount(input.userId);
      }
    }

    // For reports, wait for AI verification before returning
    if (signal.type === 'DRAMA_REPORT' || signal.type === 'POSITIVE_ACTION') {
      await this.verifySignalSync(signal.id, input.userId);
    } else {
      // For ratings, verify asynchronously (faster response)
      this.verifySignalAsync(signal.id, input.userId);
    }

    return signal;
  }

  /**
   * Verify signal synchronously (wait for result)
   */
  private async verifySignalSync(signalId: string, userId: string) {
    try {
      // Run verification and WAIT for result
      const result = await verificationService.verifySignal(signalId);

      // Get signal with user info for email
      const signal = await prisma.communitySignal.findUnique({
        where: { id: signalId },
        include: {
          user: true,
          influencer: true,
        },
      });

      if (!signal) return;

      // Send email notification
      await emailService.sendVerificationResult(
        signal.user.email,
        signal.influencer.name,
        signal.type,
        result.verified,
        result.reason
      );

      // Mark email as sent
      await prisma.communitySignal.update({
        where: { id: signalId },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });

      // If verified, recalculate trust score and award XP
      if (result.verified) {
        await this.recalculateTrustScore(signal.influencerId);

        const action = signal.type === 'RATING' ? 'RATING' : 
                       signal.type === 'COMMENT' ? 'COMMENT' : 'REPORT';
        await gamificationService.updateEngagementStats(userId, action);
      }
    } catch (error: any) {
      logger.error(`Sync verification failed for signal ${signalId}:`, error);
    }
  }

  /**
   * Verify signal asynchronously
   */
  private async verifySignalAsync(signalId: string, userId: string) {
    try {
      // Run verification
      const result = await verificationService.verifySignal(signalId);

      // Get signal with user info for email
      const signal = await prisma.communitySignal.findUnique({
        where: { id: signalId },
        include: {
          user: true,
          influencer: true,
        },
      });

      if (!signal) return;

      // Send email notification
      await emailService.sendVerificationResult(
        signal.user.email,
        signal.influencer.name,
        signal.type,
        result.verified,
        result.reason
      );

      // Mark email as sent
      await prisma.communitySignal.update({
        where: { id: signalId },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });

      // If verified, recalculate trust score and award XP
      if (result.verified) {
        await this.recalculateTrustScore(signal.influencerId);

        const action = signal.type === 'RATING' ? 'RATING' : 
                       signal.type === 'COMMENT' ? 'COMMENT' : 'REPORT';
        await gamificationService.updateEngagementStats(userId, action);
      }
    } catch (error: any) {
      logger.error(`Async verification failed for signal ${signalId}:`, error);
    }
  }

  /**
   * Get community signals
   */
  async getSignals(options: GetSignalsOptions) {
    const where: any = {};

    if (options.influencerId) {
      where.influencerId = options.influencerId;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    if (options.type) {
      where.type = options.type;
    }

    // Don't show hidden signals
    where.isHidden = false;
    
    // Only show verified signals (unless getting user's own signals)
    if (!options.userId) {
      where.status = 'VERIFIED';
    }

    const signals = await prisma.communitySignal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options.limit || 50,
      skip: options.offset || 0,
    });

    return signals;
  }

  /**
   * Get user's signal for a specific influencer
   */
  async getUserSignal(userId: string, influencerId: string, type: string) {
    const signal = await prisma.communitySignal.findFirst({
      where: {
        userId,
        influencerId,
        type,
      },
    });

    return signal;
  }

  /**
   * Delete a signal (user can only delete their own)
   */
  async deleteSignal(signalId: string, userId: string) {
    const signal = await prisma.communitySignal.findUnique({
      where: { id: signalId },
    });

    if (!signal) {
      throw new Error('Signal not found');
    }

    if (signal.userId !== userId) {
      throw new Error('You can only delete your own signals');
    }

    await prisma.communitySignal.delete({
      where: { id: signalId },
    });

    // Recalculate trust score
    await this.recalculateTrustScore(signal.influencerId);

    logger.info(`Deleted signal ${signalId} by user ${userId}`);

    return { success: true };
  }

  /**
   * Get community trust score for an influencer
   */
  async getCommunityTrustScore(influencerId: string) {
    const score = await prisma.communityTrustScore.findUnique({
      where: { influencerId },
    });

    return score;
  }

  /**
   * Recalculate community trust score for an influencer
   */
  async recalculateTrustScore(influencerId: string) {
    // Get all VERIFIED signals for this influencer
    const signals = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        isHidden: false,
        status: 'VERIFIED', // Only count verified signals
      },
      include: {
        user: true,
      },
    });

    // Calculate metrics
    const ratings = signals.filter(s => s.type === 'RATING' && s.rating);
    const dramaReports = signals.filter(s => s.type === 'DRAMA_REPORT');
    const positiveReports = signals.filter(s => s.type === 'POSITIVE_ACTION');
    const comments = signals.filter(s => s.type === 'COMMENT');

    // Calculate average rating with reputation weighting
    let avgRating = 0;
    let totalWeight = 0;

    if (ratings.length > 0) {
      for (const rating of ratings) {
        const weight = this.getUserReputationWeight(rating.user);
        avgRating += (rating.rating || 0) * weight;
        totalWeight += weight;
      }
      avgRating = totalWeight > 0 ? avgRating / totalWeight : 0;
    }

    // Calculate community score (0-100)
    // Base: 50
    // +10 per star above 3 (max +20)
    // -10 per star below 3 (max -20)
    // -5 per drama report (max -30)
    // +5 per positive report (max +30)
    let communityScore = 50;

    if (avgRating > 0) {
      communityScore += (avgRating - 3) * 10;
    }

    communityScore -= Math.min(dramaReports.length * 5, 30);
    communityScore += Math.min(positiveReports.length * 5, 30);

    // Clamp between 0-100
    communityScore = Math.max(0, Math.min(100, communityScore));

    // Get AI trust score
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    const aiScore = influencer?.trustScore || 50;

    // Combined score: 60% AI + 40% Community
    const combinedScore = aiScore * 0.6 + communityScore * 0.4;

    // Upsert community trust score
    const trustScore = await prisma.communityTrustScore.upsert({
      where: { influencerId },
      create: {
        influencerId,
        avgRating,
        totalRatings: ratings.length,
        totalDramaReports: dramaReports.length,
        totalPositiveReports: positiveReports.length,
        totalComments: comments.length,
        communityScore,
        combinedScore,
      },
      update: {
        avgRating,
        totalRatings: ratings.length,
        totalDramaReports: dramaReports.length,
        totalPositiveReports: positiveReports.length,
        totalComments: comments.length,
        communityScore,
        combinedScore,
        lastUpdated: new Date(),
      },
    });

    logger.info(`Recalculated trust score for influencer ${influencerId}: AI=${aiScore.toFixed(1)}, Community=${communityScore.toFixed(1)}, Combined=${combinedScore.toFixed(1)}`);

    return trustScore;
  }

  /**
   * Calculate user reputation weight (for weighted voting)
   * Higher reputation = more weight
   */
  private getUserReputationWeight(user: any): number {
    // Base weight: 1.0
    let weight = 1.0;

    // Professional users get higher weight
    if (user.role === 'PROFESSIONAL') {
      weight = 1.5;
    }

    // Admin users get highest weight
    if (user.role === 'ADMIN') {
      weight = 2.0;
    }

    // TODO: Add more reputation factors:
    // - Account age
    // - Number of verified signals
    // - Community upvotes
    // - Consistency of ratings

    return weight;
  }

  /**
   * Flag a signal as inappropriate (admin only)
   */
  async flagSignal(signalId: string, reason: string, adminUserId: string) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Only admins can flag signals');
    }

    const signal = await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        isHidden: true,
        hiddenReason: reason,
      },
    });

    // Recalculate trust score
    await this.recalculateTrustScore(signal.influencerId);

    logger.info(`Signal ${signalId} flagged by admin ${adminUserId}: ${reason}`);

    return signal;
  }

  /**
   * Get community statistics for an influencer
   */
  async getCommunityStats(influencerId: string) {
    const signals = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        isHidden: false,
      },
    });

    const ratings = signals.filter(s => s.type === 'RATING' && s.rating);
    const ratingDistribution = {
      1: ratings.filter(r => r.rating === 1).length,
      2: ratings.filter(r => r.rating === 2).length,
      3: ratings.filter(r => r.rating === 3).length,
      4: ratings.filter(r => r.rating === 4).length,
      5: ratings.filter(r => r.rating === 5).length,
    };

    const trustScore = await this.getCommunityTrustScore(influencerId);

    return {
      totalSignals: signals.length,
      totalRatings: ratings.length,
      totalDramaReports: signals.filter(s => s.type === 'DRAMA_REPORT').length,
      totalPositiveReports: signals.filter(s => s.type === 'POSITIVE_ACTION').length,
      totalComments: signals.filter(s => s.type === 'COMMENT').length,
      ratingDistribution,
      avgRating: trustScore?.avgRating || 0,
      communityScore: trustScore?.communityScore || 50,
      combinedScore: trustScore?.combinedScore || 50,
    };
  }

  /**
   * Get user's activity summary
   */
  async getUserActivity(userId: string) {
    const signals = await prisma.communitySignal.findMany({
      where: { userId },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      totalSignals: signals.length,
      totalRatings: signals.filter(s => s.type === 'RATING').length,
      totalReports: signals.filter(s => s.type === 'DRAMA_REPORT' || s.type === 'POSITIVE_ACTION').length,
      totalComments: signals.filter(s => s.type === 'COMMENT').length,
      recentActivity: signals.slice(0, 10),
    };
  }
}

export default new CommunityService();
