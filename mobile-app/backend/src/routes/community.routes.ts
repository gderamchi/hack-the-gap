import { Router, Request, Response } from 'express';
import communityService from '../services/community.service';
import { authMiddleware, optionalAuthMiddleware, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/community/signals
 * Create a community signal (rating, report, comment)
 * Requires authentication
 */
router.post('/signals', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, type, rating, comment, tags } = req.body;

    if (!influencerId || !type) {
      return res.status(400).json({
        success: false,
        error: 'influencerId and type are required',
      });
    }

    const signal = await communityService.createSignal({
      userId: user.userId,
      influencerId,
      type,
      rating,
      comment,
      tags,
    });

    res.json({
      success: true,
      data: signal,
      message: 'Report submitted successfully! You will receive an email once it has been verified.',
    });
  } catch (error: any) {
    logger.error('Error creating signal:', error);
    
    // Return appropriate status code based on error type
    const statusCode = error.message.includes('limit') || 
                       error.message.includes('duplicate') ||
                       error.message.includes('Rating must be') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      error: error.message || 'Failed to submit report',
    });
  }
});

/**
 * GET /api/community/signals/:influencerId
 * Get all signals for an influencer
 * Optional authentication (to show user's own signals)
 */
router.get('/signals/:influencerId', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const { type, limit, offset } = req.query;

    const signals = await communityService.getSignals({
      influencerId,
      type: type as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: signals,
    });
  } catch (error: any) {
    logger.error('Error getting signals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/community/my-signals
 * Get current user's signals
 * Requires authentication
 */
router.get('/my-signals', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, type, limit, offset } = req.query;

    const signals = await communityService.getSignals({
      userId: user.userId,
      influencerId: influencerId as string,
      type: type as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: signals,
    });
  } catch (error: any) {
    logger.error('Error getting user signals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/community/my-signal/:influencerId/:type
 * Get user's specific signal for an influencer
 * Requires authentication
 */
router.get('/my-signal/:influencerId/:type', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, type } = req.params;

    const signal = await communityService.getUserSignal(user.userId, influencerId, type);

    res.json({
      success: true,
      data: signal,
    });
  } catch (error: any) {
    logger.error('Error getting user signal:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/community/signals/:signalId
 * Delete a signal (user can only delete their own)
 * Requires authentication
 */
router.delete('/signals/:signalId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { signalId } = req.params;

    await communityService.deleteSignal(signalId, user.userId);

    res.json({
      success: true,
      message: 'Signal deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting signal:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/community/trust-score/:influencerId
 * Get community trust score for an influencer
 */
router.get('/trust-score/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;

    const trustScore = await communityService.getCommunityTrustScore(influencerId);

    res.json({
      success: true,
      data: trustScore,
    });
  } catch (error: any) {
    logger.error('Error getting trust score:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/community/stats/:influencerId
 * Get community statistics for an influencer
 */
router.get('/stats/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;

    const stats = await communityService.getCommunityStats(influencerId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error getting community stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/community/my-activity
 * Get current user's activity summary
 * Requires authentication
 */
router.get('/my-activity', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const activity = await communityService.getUserActivity(user.userId);

    res.json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/community/signals/:signalId/flag
 * Flag a signal as inappropriate (admin only)
 * Requires admin role
 */
router.post('/signals/:signalId/flag', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { signalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required',
      });
    }

    const signal = await communityService.flagSignal(signalId, reason, user.userId);

    res.json({
      success: true,
      data: signal,
    });
  } catch (error: any) {
    logger.error('Error flagging signal:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/community/recalculate/:influencerId
 * Manually recalculate trust score (admin only)
 * Requires admin role
 */
router.post('/recalculate/:influencerId', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;

    const trustScore = await communityService.recalculateTrustScore(influencerId);

    res.json({
      success: true,
      data: trustScore,
    });
  } catch (error: any) {
    logger.error('Error recalculating trust score:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
