import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateReviewRequestInput {
  userId: string;
  influencerId: string;
  mentionId?: string;
  signalId?: string;
  requestType: 'DISPUTE_EVENT' | 'REMOVE_SIGNAL' | 'UPDATE_SEVERITY' | 'VERIFY_EVENT';
  reason: string;
  evidence?: any;
}

export class ReviewService {
  /**
   * Create a review request
   */
  async createReviewRequest(input: CreateReviewRequestInput) {
    // Validate that either mentionId or signalId is provided
    if (!input.mentionId && !input.signalId) {
      throw new Error('Either mentionId or signalId must be provided');
    }

    // Verify mention or signal exists
    if (input.mentionId) {
      const mention = await prisma.mention.findUnique({
        where: { id: input.mentionId },
      });
      if (!mention || mention.influencerId !== input.influencerId) {
        throw new Error('Mention not found or does not belong to this influencer');
      }
    }

    if (input.signalId) {
      const signal = await prisma.communitySignal.findUnique({
        where: { id: input.signalId },
      });
      if (!signal || signal.influencerId !== input.influencerId) {
        throw new Error('Signal not found or does not belong to this influencer');
      }
    }

    // Check for existing pending request
    const existingRequest = await prisma.reviewRequest.findFirst({
      where: {
        influencerId: input.influencerId,
        mentionId: input.mentionId,
        signalId: input.signalId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      throw new Error('A review request for this event is already pending');
    }

    // Create review request
    const reviewRequest = await prisma.reviewRequest.create({
      data: {
        influencerId: input.influencerId,
        mentionId: input.mentionId,
        signalId: input.signalId,
        requestedBy: input.userId,
        requestType: input.requestType,
        reason: input.reason,
        evidence: input.evidence ? JSON.stringify(input.evidence) : null,
      },
    });

    logger.info(`Review request created by user ${input.userId} for influencer ${input.influencerId}`);

    return reviewRequest;
  }

  /**
   * Get review requests (admin only)
   */
  async getReviewRequests(options?: {
    status?: string;
    influencerId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.influencerId) {
      where.influencerId = options.influencerId;
    }

    const reviewRequests = await prisma.reviewRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return reviewRequests.map(r => ({
      ...r,
      evidence: r.evidence ? JSON.parse(r.evidence) : null,
    }));
  }

  /**
   * Get user's review requests
   */
  async getUserReviewRequests(userId: string) {
    const reviewRequests = await prisma.reviewRequest.findMany({
      where: { requestedBy: userId },
      orderBy: { createdAt: 'desc' },
    });

    return reviewRequests.map(r => ({
      ...r,
      evidence: r.evidence ? JSON.parse(r.evidence) : null,
    }));
  }

  /**
   * Process a review request (admin only)
   */
  async processReviewRequest(
    reviewRequestId: string,
    adminUserId: string,
    decision: 'APPROVED' | 'REJECTED',
    reviewNotes?: string,
    resolution?: string
  ) {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
    });

    if (!reviewRequest) {
      throw new Error('Review request not found');
    }

    if (reviewRequest.status !== 'PENDING' && reviewRequest.status !== 'UNDER_REVIEW') {
      throw new Error('This review request has already been processed');
    }

    // Update review request
    const updatedRequest = await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: decision,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        reviewNotes,
        resolution,
      },
    });

    // If approved, take action based on request type
    if (decision === 'APPROVED') {
      await this.executeReviewAction(reviewRequest, adminUserId);
    }

    logger.info(`Review request ${reviewRequestId} ${decision.toLowerCase()} by admin ${adminUserId}`);

    return updatedRequest;
  }

  /**
   * Execute the action for an approved review request
   */
  private async executeReviewAction(reviewRequest: any, adminUserId: string) {
    switch (reviewRequest.requestType) {
      case 'REMOVE_SIGNAL':
        if (reviewRequest.signalId) {
          await prisma.communitySignal.update({
            where: { id: reviewRequest.signalId },
            data: {
              isHidden: true,
              hiddenReason: 'Removed after review request',
            },
          });
          logger.info(`Signal ${reviewRequest.signalId} hidden after review approval`);
        }
        break;

      case 'UPDATE_SEVERITY':
        if (reviewRequest.mentionId) {
          const evidence = reviewRequest.evidence ? JSON.parse(reviewRequest.evidence) : {};
          const newSeverity = evidence.newSeverity || 'MEDIUM';
          
          await prisma.mention.update({
            where: { id: reviewRequest.mentionId },
            data: {
              severity: newSeverity,
              verifiedBy: adminUserId,
              verifiedAt: new Date(),
              isVerified: true,
            },
          });
          logger.info(`Mention ${reviewRequest.mentionId} severity updated to ${newSeverity}`);
        }
        break;

      case 'VERIFY_EVENT':
        if (reviewRequest.mentionId) {
          await prisma.mention.update({
            where: { id: reviewRequest.mentionId },
            data: {
              isVerified: true,
              verifiedBy: adminUserId,
              verifiedAt: new Date(),
            },
          });
          logger.info(`Mention ${reviewRequest.mentionId} verified`);
        }
        break;

      case 'DISPUTE_EVENT':
        // For disputes, the admin decision is recorded but no automatic action
        logger.info(`Dispute for ${reviewRequest.mentionId || reviewRequest.signalId} resolved`);
        break;
    }
  }

  /**
   * Mark review request as under review
   */
  async markUnderReview(reviewRequestId: string, adminUserId: string) {
    const reviewRequest = await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: 'UNDER_REVIEW',
        reviewedBy: adminUserId,
      },
    });

    logger.info(`Review request ${reviewRequestId} marked as under review by admin ${adminUserId}`);

    return reviewRequest;
  }
}

export default new ReviewService();
