import { Router, Request, Response } from 'express';
import verificationService from '../services/verification.service';
import emailService from '../services/email.service';
import { authMiddleware, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/verification/process-queue
 * Process pending signals verification queue
 * Can be called manually or via cron job
 */
router.post('/process-queue', async (req: Request, res: Response) => {
  try {
    const results = await verificationService.processVerificationQueue();

    // Send email notifications
    await emailService.sendBatchVerificationResults(results);

    res.json({
      success: true,
      data: {
        processed: results.length,
        approved: results.filter(r => r.verified).length,
        rejected: results.filter(r => !r.verified).length,
        results,
      },
    });
  } catch (error: any) {
    logger.error('Error processing verification queue:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/verification/pending
 * Get pending signals (admin only)
 */
router.get('/pending', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const signals = await verificationService.getPendingSignals(
      limit ? parseInt(limit as string) : 10
    );

    res.json({
      success: true,
      data: signals,
    });
  } catch (error: any) {
    logger.error('Error getting pending signals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/manual-approve/:signalId
 * Manually approve a signal (admin only)
 */
router.post('/manual-approve/:signalId', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { signalId } = req.params;
    const { reason } = req.body;

    await verificationService.manualApprove(signalId, user.userId, reason);

    res.json({
      success: true,
      message: 'Signal approved',
    });
  } catch (error: any) {
    logger.error('Error approving signal:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/manual-reject/:signalId
 * Manually reject a signal (admin only)
 */
router.post('/manual-reject/:signalId', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
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

    await verificationService.manualReject(signalId, user.userId, reason);

    res.json({
      success: true,
      message: 'Signal rejected',
    });
  } catch (error: any) {
    logger.error('Error rejecting signal:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/verification/verify/:signalId
 * Verify a specific signal immediately (admin only)
 */
router.post('/verify/:signalId', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { signalId } = req.params;
    const result = await verificationService.verifySignal(signalId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error verifying signal:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
