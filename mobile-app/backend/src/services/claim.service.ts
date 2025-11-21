import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateClaimRequestInput {
  userId: string;
  influencerId: string;
  proofType?: string;
  proofUrl?: string;
  proofText?: string;
}

export class ClaimService {
  /**
   * Create a claim request for an influencer profile
   */
  async createClaimRequest(input: CreateClaimRequestInput) {
    // Check if influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: input.influencerId },
    });

    if (!influencer) {
      throw new Error('Influencer not found');
    }

    // Check if already claimed
    if (influencer.isClaimed) {
      throw new Error('This profile has already been claimed');
    }

    // Check if user already has a pending claim for this influencer
    const existingClaim = await prisma.claimRequest.findFirst({
      where: {
        userId: input.userId,
        influencerId: input.influencerId,
        status: 'PENDING',
      },
    });

    if (existingClaim) {
      throw new Error('You already have a pending claim request for this influencer');
    }

    // Create claim request
    const claimRequest = await prisma.claimRequest.create({
      data: {
        userId: input.userId,
        influencerId: input.influencerId,
        proofType: input.proofType,
        proofUrl: input.proofUrl,
        proofText: input.proofText,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        influencer: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    logger.info(`Claim request created for influencer ${input.influencerId} by user ${input.userId}`);

    return claimRequest;
  }

  /**
   * Get claim requests (admin only)
   */
  async getClaimRequests(options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (options?.status) {
      where.status = options.status;
    }

    const claimRequests = await prisma.claimRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        influencer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            niche: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });

    return claimRequests;
  }

  /**
   * Get user's claim requests
   */
  async getUserClaimRequests(userId: string) {
    const claimRequests = await prisma.claimRequest.findMany({
      where: { userId },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            niche: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return claimRequests;
  }

  /**
   * Review a claim request (admin only)
   */
  async reviewClaimRequest(
    claimRequestId: string,
    adminUserId: string,
    decision: 'APPROVED' | 'REJECTED',
    reviewNotes?: string
  ) {
    const claimRequest = await prisma.claimRequest.findUnique({
      where: { id: claimRequestId },
      include: { influencer: true },
    });

    if (!claimRequest) {
      throw new Error('Claim request not found');
    }

    if (claimRequest.status !== 'PENDING') {
      throw new Error('This claim request has already been reviewed');
    }

    // Update claim request
    const updatedClaim = await prisma.claimRequest.update({
      where: { id: claimRequestId },
      data: {
        status: decision,
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        reviewNotes,
      },
    });

    // If approved, update influencer
    if (decision === 'APPROVED') {
      await prisma.influencer.update({
        where: { id: claimRequest.influencerId },
        data: {
          isClaimed: true,
          claimedBy: claimRequest.userId,
          claimedAt: new Date(),
          verificationStatus: 'VERIFIED',
        },
      });

      logger.info(`Claim request ${claimRequestId} approved. Influencer ${claimRequest.influencerId} claimed by user ${claimRequest.userId}`);
    } else {
      logger.info(`Claim request ${claimRequestId} rejected by admin ${adminUserId}`);
    }

    return updatedClaim;
  }

  /**
   * Check if user has claimed an influencer
   */
  async hasUserClaimedInfluencer(userId: string, influencerId: string): Promise<boolean> {
    const influencer = await prisma.influencer.findUnique({
      where: { id: influencerId },
    });

    return influencer?.isClaimed === true && influencer?.claimedBy === userId;
  }

  /**
   * Get claimed influencers for a user
   */
  async getUserClaimedInfluencers(userId: string) {
    const influencers = await prisma.influencer.findMany({
      where: {
        isClaimed: true,
        claimedBy: userId,
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
        claimedAt: true,
        verificationStatus: true,
      },
      orderBy: { claimedAt: 'desc' },
    });

    return influencers;
  }
}

export default new ClaimService();
