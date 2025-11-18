import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import logger from '../utils/logger';
import claimService from './claim.service';

const prisma = new PrismaClient();

export interface CreateResponseInput {
  userId: string;
  influencerId: string;
  mentionId?: string;
  signalId?: string;
  responseType: 'CLARIFICATION' | 'APOLOGY' | 'DENIAL' | 'CONTEXT' | 'CORRECTION';
  responseText: string;
  evidenceUrls?: string[];
}

export class ResponseService {
  /**
   * Create an influencer response to an event or signal
   */
  async createResponse(input: CreateResponseInput) {
    // Verify user has claimed this influencer
    const hasClaimed = await claimService.hasUserClaimedInfluencer(
      input.userId,
      input.influencerId
    );

    if (!hasClaimed) {
      throw new Error('You must claim this influencer profile to respond to events');
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

    // Create response
    const response = await prisma.influencerResponse.create({
      data: {
        id: randomUUID(),
        influencerId: input.influencerId,
        mentionId: input.mentionId,
        signalId: input.signalId,
        responseType: input.responseType,
        responseText: input.responseText,
        evidenceUrls: input.evidenceUrls ? JSON.stringify(input.evidenceUrls) : null,
        updatedAt: new Date(),
      },
      include: {
        Influencer: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    logger.info(`Response created by influencer ${input.influencerId} for ${input.mentionId ? 'mention' : 'signal'} ${input.mentionId || input.signalId}`);

    return response;
  }

  /**
   * Get responses for a mention or signal
   */
  async getResponses(options: {
    mentionId?: string;
    signalId?: string;
    influencerId?: string;
  }) {
    const where: any = {};

    if (options.mentionId) {
      where.mentionId = options.mentionId;
    }

    if (options.signalId) {
      where.signalId = options.signalId;
    }

    if (options.influencerId) {
      where.influencerId = options.influencerId;
    }

    const responses = await prisma.influencerResponse.findMany({
      where,
      include: {
        Influencer: {
          select: {
            name: true,
            imageUrl: true,
            verificationStatus: true,
          },
        },
        ResponseVote: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return responses.map(r => ({
      ...r,
      evidenceUrls: r.evidenceUrls ? JSON.parse(r.evidenceUrls) : [],
    }));
  }

  /**
   * Vote on a response (helpful/not helpful)
   */
  async voteOnResponse(
    responseId: string,
    userId: string,
    isHelpful: boolean
  ) {
    // Check if user already voted
    const existingVote = await prisma.responseVote.findUnique({
      where: {
        responseId_userId: {
          responseId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      await prisma.responseVote.update({
        where: { id: existingVote.id },
        data: { isHelpful },
      });
    } else {
      // Create new vote
      await prisma.responseVote.create({
        data: {
          id: randomUUID(),
          responseId,
          userId,
          isHelpful,
        },
      });
    }

    // Recalculate vote counts
    const votes = await prisma.responseVote.findMany({
      where: { responseId },
    });

    const helpfulCount = votes.filter(v => v.isHelpful).length;
    const notHelpfulCount = votes.filter(v => !v.isHelpful).length;

    await prisma.influencerResponse.update({
      where: { id: responseId },
      data: {
        helpfulCount,
        notHelpfulCount,
      },
    });

    logger.info(`User ${userId} voted ${isHelpful ? 'helpful' : 'not helpful'} on response ${responseId}`);

    return { helpfulCount, notHelpfulCount };
  }

  /**
   * Verify a response (admin only)
   */
  async verifyResponse(
    responseId: string,
    adminUserId: string,
    isVerified: boolean
  ) {
    const response = await prisma.influencerResponse.update({
      where: { id: responseId },
      data: {
        isVerified,
        verifiedBy: adminUserId,
        verifiedAt: new Date(),
      },
    });

    logger.info(`Response ${responseId} ${isVerified ? 'verified' : 'unverified'} by admin ${adminUserId}`);

    return response;
  }

  /**
   * Delete a response (only by the influencer who created it)
   */
  async deleteResponse(responseId: string, userId: string) {
    const response = await prisma.influencerResponse.findUnique({
      where: { id: responseId },
      include: { Influencer: true },
    });

    if (!response) {
      throw new Error('Response not found');
    }

    // Verify user has claimed this influencer
    const hasClaimed = await claimService.hasUserClaimedInfluencer(
      userId,
      response.influencerId
    );

    if (!hasClaimed) {
      throw new Error('You can only delete responses for influencers you have claimed');
    }

    await prisma.influencerResponse.delete({
      where: { id: responseId },
    });

    logger.info(`Response ${responseId} deleted by user ${userId}`);

    return { success: true };
  }
}

export default new ResponseService();
