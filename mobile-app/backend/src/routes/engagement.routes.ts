import { Router, Request, Response } from 'express';
import leaderboardService from '../services/leaderboard.service';
import gamificationService from '../services/gamification.service';
import subscriptionService from '../services/subscription.service';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// ============================================
// LEADERBOARD ENDPOINTS
// ============================================

/**
 * GET /api/engagement/leaderboard/top-rated
 * Get top rated influencers
 */
router.get('/leaderboard/top-rated', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const leaderboard = await leaderboardService.getTopRated(
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting top rated:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/leaderboard/most-improved
 * Get most improved influencers
 */
router.get('/leaderboard/most-improved', async (req: Request, res: Response) => {
  try {
    const { period, limit } = req.query;
    const leaderboard = await leaderboardService.getMostImproved(
      (period as any) || 'WEEKLY',
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting most improved:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/leaderboard/highest-risk
 * Get highest risk influencers
 */
router.get('/leaderboard/highest-risk', async (req: Request, res: Response) => {
  try {
    const { period, limit } = req.query;
    const leaderboard = await leaderboardService.getHighestRisk(
      (period as any) || 'WEEKLY',
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting highest risk:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/leaderboard/trending
 * Get trending influencers
 */
router.get('/leaderboard/trending', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const leaderboard = await leaderboardService.getTrending(
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting trending:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/leaderboard/active-users
 * Get most active community members
 */
router.get('/leaderboard/active-users', async (req: Request, res: Response) => {
  try {
    const { period, limit } = req.query;
    const leaderboard = await leaderboardService.getMostActiveUsers(
      (period as any) || 'WEEKLY',
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting active users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/engagement/leaderboard/update-trending
 * Update trending influencers (admin only)
 */
router.post('/leaderboard/update-trending', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const count = await leaderboardService.updateTrending();

    res.json({
      success: true,
      data: { trendingCount: count },
    });
  } catch (error: any) {
    logger.error('Error updating trending:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// GAMIFICATION ENDPOINTS
// ============================================

/**
 * GET /api/engagement/my-stats
 * Get current user's engagement stats
 */
router.get('/my-stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const stats = await gamificationService.getUserStats(user.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/my-achievements
 * Get current user's achievements
 */
router.get('/my-achievements', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const achievements = await gamificationService.getUserAchievements(user.userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    logger.error('Error getting achievements:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/top-users
 * Get top users by level/XP
 */
router.get('/top-users', async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const leaderboard = await gamificationService.getTopUsers(
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting top users:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/leaderboard/top-contributors
 * Get top contributors (most accepted drama/positive reports)
 */
router.get('/leaderboard/top-contributors', async (req: Request, res: Response) => {
  try {
    const { period, limit } = req.query;
    const leaderboard = await leaderboardService.getTopContributors(
      (period as any) || 'ALL_TIME',
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    logger.error('Error getting top contributors:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// SUBSCRIPTION ENDPOINTS
// ============================================

/**
 * GET /api/engagement/my-subscription
 * Get current user's subscription info
 */
router.get('/my-subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const subscription = await subscriptionService.getUserSubscription(user.userId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    logger.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/engagement/pricing
 * Get subscription pricing
 */
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const pricing = subscriptionService.getPricing();

    res.json({
      success: true,
      data: pricing,
    });
  } catch (error: any) {
    logger.error('Error getting pricing:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
