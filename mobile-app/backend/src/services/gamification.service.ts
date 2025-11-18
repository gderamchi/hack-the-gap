import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_RATING: {
    name: 'First Rating',
    description: 'Rate your first influencer',
    icon: '⭐',
    levels: [{ target: 1, xp: 10 }],
  },
  RATING_MASTER: {
    name: 'Rating Master',
    description: 'Rate multiple influencers',
    icon: '🌟',
    levels: [
      { target: 10, xp: 50, level: 1 },
      { target: 50, xp: 100, level: 2 },
      { target: 100, xp: 200, level: 3 },
      { target: 500, xp: 500, level: 4 },
    ],
  },
  DRAMA_DETECTOR: {
    name: 'Drama Detector',
    description: 'Report drama events',
    icon: '🚨',
    levels: [
      { target: 5, xp: 30, level: 1 },
      { target: 20, xp: 75, level: 2 },
      { target: 50, xp: 150, level: 3 },
    ],
  },
  POSITIVE_VIBES: {
    name: 'Positive Vibes',
    description: 'Report positive actions',
    icon: '✨',
    levels: [
      { target: 5, xp: 30, level: 1 },
      { target: 20, xp: 75, level: 2 },
      { target: 50, xp: 150, level: 3 },
    ],
  },
  TRUSTED_VOTER: {
    name: 'Trusted Voter',
    description: 'Earn reputation through helpful votes',
    icon: '🔹',
    levels: [
      { target: 10, xp: 40, level: 1 },
      { target: 50, xp: 100, level: 2 },
      { target: 100, xp: 250, level: 3 },
    ],
  },
  STREAK_KEEPER: {
    name: 'Streak Keeper',
    description: 'Stay active for consecutive days',
    icon: '🔥',
    levels: [
      { target: 7, xp: 50, level: 1 },
      { target: 30, xp: 150, level: 2 },
      { target: 100, xp: 500, level: 3 },
    ],
  },
  INFLUENCER_HUNTER: {
    name: 'Influencer Hunter',
    description: 'Discover and rate many influencers',
    icon: '🎯',
    levels: [
      { target: 20, xp: 60, level: 1 },
      { target: 50, xp: 120, level: 2 },
      { target: 100, xp: 300, level: 3 },
    ],
  },
};

export class GamificationService {
  /**
   * Update user engagement stats after an action
   */
  async updateEngagementStats(userId: string, action: 'RATING' | 'REPORT' | 'COMMENT' | 'HELPFUL_VOTE') {
    // Get or create engagement stats
    let stats = await prisma.userEngagementStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userEngagementStats.create({
        data: { 
          id: crypto.randomUUID(),
          userId,
          updatedAt: new Date()
        },
      });
    }

    // Update stats based on action
    const updates: any = {};
    let xpGained = 0;

    switch (action) {
      case 'RATING':
        updates.totalRatings = stats.totalRatings + 1;
        xpGained = 5;
        break;
      case 'REPORT':
        updates.totalReports = stats.totalReports + 1;
        xpGained = 10;
        break;
      case 'COMMENT':
        updates.totalComments = stats.totalComments + 1;
        xpGained = 3;
        break;
      case 'HELPFUL_VOTE':
        updates.helpfulVotes = stats.helpfulVotes + 1;
        xpGained = 2;
        break;
    }

    // Update streak
    const today = new Date().toDateString();
    const lastActive = stats.lastActiveDate ? new Date(stats.lastActiveDate).toDateString() : null;
    
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (lastActive === yesterday) {
        updates.streak = stats.streak + 1;
      } else {
        updates.streak = 1;
      }
      updates.lastActiveDate = new Date();
    }

    // Add XP
    updates.experiencePoints = stats.experiencePoints + xpGained;

    // Calculate new level
    const newLevel = this.calculateLevel(updates.experiencePoints);
    if (newLevel > stats.level) {
      updates.level = newLevel;
      logger.info(`User ${userId} leveled up to ${newLevel}!`);
    }

    // Update stats
    const updatedStats = await prisma.userEngagementStats.update({
      where: { userId },
      data: updates,
    });

    // Check for achievements
    await this.checkAchievements(userId, updatedStats);

    return {
      stats: updatedStats,
      xpGained,
      leveledUp: newLevel > stats.level,
    };
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId: string, stats: any) {
    const unlockedAchievements = [];

    // Check each achievement type
    for (const [type, achievement] of Object.entries(ACHIEVEMENTS)) {
      const progress = this.getAchievementProgress(type, stats);

      for (const levelDef of achievement.levels) {
        if (progress >= levelDef.target) {
          const existing = await prisma.userAchievement.findUnique({
            where: {
              userId_achievementType: {
                userId,
                achievementType: type,
              },
            },
          });

          const targetLevel = 'level' in levelDef ? levelDef.level : 1;

          if (!existing) {
            // Create new achievement
            const newAchievement = await prisma.userAchievement.create({
              data: {
                id: crypto.randomUUID(),
                userId,
                achievementType: type,
                achievementLevel: targetLevel,
                progress,
                progressTarget: levelDef.target,
                unlockedAt: new Date(),
              },
            });
            unlockedAchievements.push(newAchievement);
            logger.info(`User ${userId} unlocked achievement: ${type} Level ${targetLevel}`);
          } else if (existing.achievementLevel < targetLevel && !existing.unlockedAt) {
            // Upgrade achievement level
            const upgraded = await prisma.userAchievement.update({
              where: { id: existing.id },
              data: {
                achievementLevel: targetLevel,
                progress,
                progressTarget: levelDef.target,
                unlockedAt: new Date(),
              },
            });
            unlockedAchievements.push(upgraded);
            logger.info(`User ${userId} upgraded achievement: ${type} to Level ${targetLevel}`);
          } else if (!existing.unlockedAt) {
            // Update progress
            await prisma.userAchievement.update({
              where: { id: existing.id },
              data: { progress },
            });
          }
        }
      }
    }

    return unlockedAchievements;
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    return achievements.map(ach => {
      const definition = ACHIEVEMENTS[ach.achievementType as keyof typeof ACHIEVEMENTS];
      return {
        ...ach,
        name: definition?.name || ach.achievementType,
        description: definition?.description || '',
        icon: definition?.icon || '🏆',
      };
    });
  }

  /**
   * Get user's engagement stats
   */
  async getUserStats(userId: string) {
    let stats = await prisma.userEngagementStats.findUnique({
      where: { userId },
    });

    if (!stats) {
      stats = await prisma.userEngagementStats.create({
        data: { 
          id: crypto.randomUUID(),
          userId,
          updatedAt: new Date()
        },
      });
    }

    const nextLevelXP = this.getXPForLevel(stats.level + 1);
    const currentLevelXP = this.getXPForLevel(stats.level);
    const progressToNextLevel = stats.experiencePoints - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;

    return {
      ...stats,
      nextLevelXP,
      progressToNextLevel,
      xpNeededForNextLevel,
      progressPercent: (progressToNextLevel / xpNeededForNextLevel) * 100,
    };
  }

  /**
   * Get leaderboard of top users by XP
   */
  async getTopUsers(limit: number = 20) {
    const users = await prisma.userEngagementStats.findMany({
      orderBy: [
        { level: 'desc' },
        { experiencePoints: 'desc' },
      ],
      take: limit,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return users.map((stats, index) => ({
      rank: index + 1,
      userId: stats.userId,
      name: `${stats.User.firstName || ''} ${stats.User.lastName || ''}`.trim() || 'Anonymous',
      avatar: stats.User.avatar,
      role: stats.User.role,
      level: stats.level,
      experiencePoints: stats.experiencePoints,
      reputationScore: stats.reputationScore,
      badge: this.getRankBadge(index + 1),
    }));
  }

  /**
   * Helper: Get achievement progress
   */
  private getAchievementProgress(type: string, stats: any): number {
    switch (type) {
      case 'FIRST_RATING':
      case 'RATING_MASTER':
      case 'INFLUENCER_HUNTER':
        return stats.totalRatings;
      case 'DRAMA_DETECTOR':
        return stats.totalReports; // Assuming drama reports
      case 'POSITIVE_VIBES':
        return stats.totalReports; // Assuming positive reports
      case 'TRUSTED_VOTER':
        return stats.helpfulVotes;
      case 'STREAK_KEEPER':
        return stats.streak;
      default:
        return 0;
    }
  }

  /**
   * Helper: Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100))
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  /**
   * Helper: Get XP required for level
   */
  private getXPForLevel(level: number): number {
    // Inverse of level formula
    return Math.pow(level - 1, 2) * 100;
  }

  /**
   * Helper: Get rank badge
   */
  private getRankBadge(rank: number): string {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '⭐';
    return '';
  }
}

export default new GamificationService();
