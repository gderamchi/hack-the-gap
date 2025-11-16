import { Router, Request, Response } from 'express';
import transparencyService from '../services/transparency.service';
import claimService from '../services/claim.service';
import responseService from '../services/response.service';
import reviewService from '../services/review.service';
import { authMiddleware, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// ============================================
// TRANSPARENCY ENDPOINTS
// ============================================

/**
 * GET /api/transparency/breakdown/:influencerId
 * Get score breakdown for an influencer
 */
router.get('/breakdown/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const breakdown = await transparencyService.getScoreBreakdown(influencerId);

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error: any) {
    logger.error('Error getting score breakdown:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/timeline/:influencerId
 * Get event timeline for an influencer
 */
router.get('/timeline/:influencerId', async (req: Request, res: Response) => {
  try {
    const { influencerId } = req.params;
    const { startDate, endDate, limit } = req.query;

    const timeline = await transparencyService.getEventTimeline(influencerId, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    logger.error('Error getting timeline:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/transparency/mention/:mentionId/severity
 * Update mention severity (admin only)
 */
router.put('/mention/:mentionId/severity', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { mentionId } = req.params;
    const { severity } = req.body;

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity level',
      });
    }

    const result = await transparencyService.updateMentionSeverity(
      mentionId,
      severity,
      user.userId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error updating severity:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// CLAIM ENDPOINTS
// ============================================

/**
 * POST /api/transparency/claim
 * Create a claim request
 */
router.post('/claim', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, proofType, proofUrl, proofText } = req.body;

    if (!influencerId) {
      return res.status(400).json({
        success: false,
        error: 'influencerId is required',
      });
    }

    const claimRequest = await claimService.createClaimRequest({
      userId: user.userId,
      influencerId,
      proofType,
      proofUrl,
      proofText,
    });

    res.status(201).json({
      success: true,
      data: claimRequest,
    });
  } catch (error: any) {
    logger.error('Error creating claim request:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/claims
 * Get all claim requests (admin only)
 */
router.get('/claims', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;

    const claims = await claimService.getClaimRequests({
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: claims,
    });
  } catch (error: any) {
    logger.error('Error getting claim requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/my-claims
 * Get current user's claim requests
 */
router.get('/my-claims', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const claims = await claimService.getUserClaimRequests(user.userId);

    res.json({
      success: true,
      data: claims,
    });
  } catch (error: any) {
    logger.error('Error getting user claims:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/my-influencers
 * Get influencers claimed by current user
 */
router.get('/my-influencers', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const influencers = await claimService.getUserClaimedInfluencers(user.userId);

    res.json({
      success: true,
      data: influencers,
    });
  } catch (error: any) {
    logger.error('Error getting claimed influencers:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/transparency/claims/:claimId/review
 * Review a claim request (admin only)
 */
router.post('/claims/:claimId/review', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { claimId } = req.params;
    const { decision, reviewNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Decision must be APPROVED or REJECTED',
      });
    }

    const result = await claimService.reviewClaimRequest(
      claimId,
      user.userId,
      decision,
      reviewNotes
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error reviewing claim:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// RESPONSE ENDPOINTS
// ============================================

/**
 * POST /api/transparency/response
 * Create an influencer response
 */
router.post('/response', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, mentionId, signalId, responseType, responseText, evidenceUrls } = req.body;

    if (!influencerId || !responseType || !responseText) {
      return res.status(400).json({
        success: false,
        error: 'influencerId, responseType, and responseText are required',
      });
    }

    const response = await responseService.createResponse({
      userId: user.userId,
      influencerId,
      mentionId,
      signalId,
      responseType,
      responseText,
      evidenceUrls,
    });

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    logger.error('Error creating response:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/responses
 * Get responses for a mention or signal
 */
router.get('/responses', async (req: Request, res: Response) => {
  try {
    const { mentionId, signalId, influencerId } = req.query;

    const responses = await responseService.getResponses({
      mentionId: mentionId as string,
      signalId: signalId as string,
      influencerId: influencerId as string,
    });

    res.json({
      success: true,
      data: responses,
    });
  } catch (error: any) {
    logger.error('Error getting responses:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/transparency/responses/:responseId/vote
 * Vote on a response
 */
router.post('/responses/:responseId/vote', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { responseId } = req.params;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isHelpful must be a boolean',
      });
    }

    const result = await responseService.voteOnResponse(
      responseId,
      user.userId,
      isHelpful
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error voting on response:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/transparency/responses/:responseId
 * Delete a response
 */
router.delete('/responses/:responseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { responseId } = req.params;

    await responseService.deleteResponse(responseId, user.userId);

    res.json({
      success: true,
      message: 'Response deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting response:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// REVIEW REQUEST ENDPOINTS
// ============================================

/**
 * POST /api/transparency/review-request
 * Create a review request
 */
router.post('/review-request', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { influencerId, mentionId, signalId, requestType, reason, evidence } = req.body;

    if (!influencerId || !requestType || !reason) {
      return res.status(400).json({
        success: false,
        error: 'influencerId, requestType, and reason are required',
      });
    }

    const reviewRequest = await reviewService.createReviewRequest({
      userId: user.userId,
      influencerId,
      mentionId,
      signalId,
      requestType,
      reason,
      evidence,
    });

    res.status(201).json({
      success: true,
      data: reviewRequest,
    });
  } catch (error: any) {
    logger.error('Error creating review request:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/review-requests
 * Get review requests (admin only)
 */
router.get('/review-requests', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const { status, influencerId, limit, offset } = req.query;

    const requests = await reviewService.getReviewRequests({
      status: status as string,
      influencerId: influencerId as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    logger.error('Error getting review requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/transparency/my-review-requests
 * Get current user's review requests
 */
router.get('/my-review-requests', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const requests = await reviewService.getUserReviewRequests(user.userId);

    res.json({
      success: true,
      data: requests,
    });
  } catch (error: any) {
    logger.error('Error getting user review requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/transparency/review-requests/:requestId/process
 * Process a review request (admin only)
 */
router.post('/review-requests/:requestId/process', authMiddleware, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { requestId } = req.params;
    const { decision, reviewNotes, resolution } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Decision must be APPROVED or REJECTED',
      });
    }

    const result = await reviewService.processReviewRequest(
      requestId,
      user.userId,
      decision,
      reviewNotes,
      resolution
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error processing review request:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
