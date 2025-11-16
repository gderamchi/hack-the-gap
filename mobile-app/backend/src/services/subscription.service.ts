import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Subscription tiers and limits
const SUBSCRIPTION_LIMITS = {
  FREE: {
    monthlyReports: 5,
    features: ['basic_rating', 'view_leaderboards', 'view_profiles'],
  },
  PREMIUM: {
    monthlyReports: 50,
    features: ['basic_rating', 'unlimited_ratings', 'view_leaderboards', 'view_profiles', 'advanced_stats'],
  },
  PROFESSIONAL: {
    monthlyReports: -1, // Unlimited
    features: ['all_features', 'api_access', 'export_reports', 'priority_support'],
  },
};

export class SubscriptionService {
  /**
   * Check if user can submit a report
   */
  async canUserSubmitReport(userId: string): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if we need to reset monthly counter
    await this.resetMonthlyLimitIfNeeded(userId, user);

    const tier = user.subscriptionTier || 'FREE';
    const limit = this.getMonthlyLimit(tier);

    // Unlimited for PROFESSIONAL
    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    // Check if user has reached limit
    if (user.monthlyReportsUsed >= limit) {
      return {
        allowed: false,
        reason: `You've reached your monthly limit of ${limit} reports. Upgrade to submit more!`,
        remaining: 0,
      };
    }

    return {
      allowed: true,
      remaining: limit - user.monthlyReportsUsed,
    };
  }

  /**
   * Increment user's report count
   */
  async incrementReportCount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    await prisma.user.update({
      where: { id: userId },
      data: {
        monthlyReportsUsed: user.monthlyReportsUsed + 1,
      },
    });

    logger.info(`User ${userId} report count: ${user.monthlyReportsUsed + 1}/${user.monthlyReportsLimit}`);
  }

  /**
   * Reset monthly limit if needed
   */
  private async resetMonthlyLimitIfNeeded(userId: string, user: any) {
    const now = new Date();
    const lastReset = new Date(user.lastResetDate);

    // Check if it's been a month since last reset
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                             (now.getMonth() - lastReset.getMonth());

    if (monthsSinceReset >= 1) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          monthlyReportsUsed: 0,
          lastResetDate: now,
        },
      });

      logger.info(`Reset monthly limit for user ${userId}`);
    }
  }

  /**
   * Get monthly limit for tier
   */
  private getMonthlyLimit(tier: string): number {
    switch (tier) {
      case 'PREMIUM':
        return SUBSCRIPTION_LIMITS.PREMIUM.monthlyReports;
      case 'PROFESSIONAL':
        return SUBSCRIPTION_LIMITS.PROFESSIONAL.monthlyReports;
      default:
        return SUBSCRIPTION_LIMITS.FREE.monthlyReports;
    }
  }

  /**
   * Get user's subscription info
   */
  async getUserSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const tier = user.subscriptionTier || 'FREE';
    const limit = this.getMonthlyLimit(tier);

    return {
      tier,
      status: user.subscriptionStatus || 'ACTIVE',
      monthlyReportsUsed: user.monthlyReportsUsed,
      monthlyReportsLimit: limit,
      remaining: limit === -1 ? -1 : limit - user.monthlyReportsUsed,
      features: SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS]?.features || [],
      expiresAt: user.subscriptionExpiry,
    };
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(userId: string, tier: 'PREMIUM' | 'PROFESSIONAL', expiryDate?: Date) {
    const limit = this.getMonthlyLimit(tier);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: expiryDate,
        monthlyReportsLimit: limit,
      },
    });

    logger.info(`User ${userId} upgraded to ${tier}`);
  }

  /**
   * Get subscription pricing
   */
  getPricing() {
    return {
      FREE: {
        price: 0,
        currency: 'EUR',
        period: 'forever',
        monthlyReports: 5,
        features: [
          'Rate influencers (unlimited)',
          '5 drama/positive reports per month',
          'View leaderboards',
          'View profiles',
          'Earn achievements',
        ],
      },
      PREMIUM: {
        price: 4.99,
        currency: 'EUR',
        period: 'month',
        monthlyReports: 50,
        features: [
          'Everything in FREE',
          '50 drama/positive reports per month',
          'Advanced statistics',
          'Priority verification',
          'No ads',
        ],
      },
      PROFESSIONAL: {
        price: 19.99,
        currency: 'EUR',
        period: 'month',
        monthlyReports: -1, // Unlimited
        features: [
          'Everything in PREMIUM',
          'Unlimited reports',
          'API access',
          'Export reports',
          'Priority support',
          'Custom analytics',
        ],
      },
    };
  }
}

export default new SubscriptionService();
