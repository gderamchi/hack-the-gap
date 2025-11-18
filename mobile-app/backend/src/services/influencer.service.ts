import { PrismaClient, Influencer, Mention } from '@prisma/client';
import { randomUUID } from 'crypto';
import blackboxService from './blackbox.service'; // Using FREE Blackbox AI!
import scoringService from './scoring.service';
import advancedScoringService from './advanced-scoring.service';
import logger from '../utils/logger';
import { config } from '../config';

const prisma = new PrismaClient();

export interface InfluencerWithMentions extends Influencer {
  Mention: Mention[];
}

export interface SearchResult {
  influencer: InfluencerWithMentions;
  isFromCache: boolean;
  researchSummary?: {
    totalQueries: number;
    successfulQueries: number;
    errors: string[];
  };
}

/**
 * Influencer service - main business logic
 */
export class InfluencerService {
  /**
   * Get all influencers sorted by trust score
   * Returns influencers with combined score (AI + Community)
   */
  async getAllInfluencers(
    minTrustScore?: number,
    niche?: string,
    limit: number = 50
  ): Promise<Influencer[]> {
    const where: any = {};
    
    if (minTrustScore !== undefined) {
      where.trustScore = { gte: minTrustScore };
    }
    
    if (niche) {
      where.niche = niche;
    }
    
    const influencers = await prisma.influencer.findMany({
      where,
      orderBy: { trustScore: 'desc' },
      take: limit,
      include: {
        CommunityTrustScore: true,
      },
    });
    
    // Return influencers with combined score as the main trustScore
    return influencers.map(inf => ({
      ...inf,
      trustScore: inf.CommunityTrustScore?.combinedScore || inf.trustScore,
    })) as Influencer[];
  }
  
  /**
   * Get influencer by ID with mentions
   * Returns influencer with combined score (AI + Community)
   */
  async getInfluencerById(id: string): Promise<InfluencerWithMentions | null> {
    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        Mention: {
          orderBy: { scrapedAt: 'desc' },
          take: 100,
        },
        CommunityTrustScore: true,
      },
    });
    
    if (!influencer) return null;
    
    // Return influencer with combined score as the main trustScore
    return {
      ...influencer,
      trustScore: influencer.CommunityTrustScore?.combinedScore || influencer.trustScore,
    } as InfluencerWithMentions;
  }
  
  /**
   * Search for influencer by name
   * Returns cached data if available and fresh, otherwise performs new research
   */
  async searchInfluencer(
    name: string,
    forceRefresh: boolean = false
  ): Promise<SearchResult> {
    logger.info(`Searching for influencer: ${name} (forceRefresh: ${forceRefresh})`);
    
    // Check if influencer exists in database
    const existing = await prisma.influencer.findUnique({
      where: { name },
      include: {
        Mention: {
          orderBy: { scrapedAt: 'desc' },
        },
      },
    });
    
    // Check if cache is still valid
    const cacheValid = existing && this.isCacheValid(existing.lastUpdated);
    
    if (existing && cacheValid && !forceRefresh) {
      logger.info(`Returning cached data for: ${name}`);
      return {
        influencer: existing,
        isFromCache: true,
      };
    }
    
    // Perform new research using FREE Blackbox AI
    logger.info(`Performing new research for: ${name}`);
    const researchResult = await blackboxService.researchInfluencer(name);
    
    logger.info(`Research completed: ${researchResult.mentions.length} mentions found`);
    logger.info(`Breakdown: ${researchResult.mentions.filter(m => m.label === 'drama').length} drama, ${researchResult.mentions.filter(m => m.label === 'good_action').length} good actions, ${researchResult.mentions.filter(m => m.label === 'neutral').length} neutral`);
    
    // Calculate trust score using simple algorithm first (for initial save)
    const scoreResult = scoringService.calculateTrustScore(
      researchResult.mentions.map(m => ({
        sentimentScore: m.sentimentScore,
        label: m.label,
        scrapedAt: new Date(),
      }))
    );
    
    logger.info(`Initial AI score calculated: ${scoreResult.trustScore} (drama: ${scoreResult.dramaCount}, good: ${scoreResult.goodActionCount})`);
    
    // Save or update influencer with AI score
    const influencer = await this.saveInfluencer(
      name,
      scoreResult,
      researchResult.mentions
    );
    
    // Now calculate and update with advanced scoring (AI + Community)
    try {
      logger.info(`Calculating advanced score for: ${name}`);
      await advancedScoringService.updateInfluencerScore(influencer.id);
      logger.info(`Advanced score updated for: ${name}`);
    } catch (error) {
      logger.error(`Failed to calculate advanced score for ${name}:`, error);
      // Continue with AI-only score if advanced fails
    }
    
    // Fetch with mentions
    const influencerWithMentions = await this.getInfluencerById(influencer.id);
    
    if (!influencerWithMentions) {
      throw new Error('Failed to fetch influencer after save');
    }
    
    return {
      influencer: influencerWithMentions,
      isFromCache: false,
      researchSummary: {
        totalQueries: researchResult.totalQueries,
        successfulQueries: researchResult.successfulQueries,
        errors: researchResult.errors,
      },
    };
  }
  
  /**
   * Refresh influencer data
   */
  async refreshInfluencer(id: string): Promise<InfluencerWithMentions> {
    const existing = await prisma.influencer.findUnique({
      where: { id },
    });
    
    if (!existing) {
      throw new Error('Influencer not found');
    }
    
    const result = await this.searchInfluencer(existing.name, true);
    return result.influencer;
  }
  
  /**
   * Save or update influencer with mentions
   */
  private async saveInfluencer(
    name: string,
    scoreResult: any,
    mentions: any[]
  ): Promise<Influencer> {
    // Upsert influencer
    const influencer = await prisma.influencer.upsert({
      where: { name },
      update: {
        trustScore: scoreResult.trustScore,
        dramaCount: scoreResult.dramaCount,
        goodActionCount: scoreResult.goodActionCount,
        neutralCount: scoreResult.neutralCount,
        avgSentiment: scoreResult.avgSentiment,
        lastUpdated: new Date(),
      },
      create: {
        id: randomUUID(),
        name,
        trustScore: scoreResult.trustScore,
        dramaCount: scoreResult.dramaCount,
        goodActionCount: scoreResult.goodActionCount,
        neutralCount: scoreResult.neutralCount,
        avgSentiment: scoreResult.avgSentiment,
        lastUpdated: new Date(),
      },
    });
    
    // Delete old mentions
    await prisma.mention.deleteMany({
      where: { influencerId: influencer.id },
    });
    
    // Save new mentions
    if (mentions.length > 0) {
      await prisma.mention.createMany({
        data: mentions.map(m => ({
          id: randomUUID(),
          influencerId: influencer.id,
          source: m.source,
          sourceUrl: m.sourceUrl,
          textExcerpt: m.textExcerpt,
          sentimentScore: m.sentimentScore,
          label: m.label,
        })),
      });
    }
    
    // Save to history
    await prisma.analysisHistory.create({
      data: {
        id: randomUUID(),
        influencerId: influencer.id,
        trustScore: scoreResult.trustScore,
        dramaCount: scoreResult.dramaCount,
        goodActionCount: scoreResult.goodActionCount,
        neutralCount: scoreResult.neutralCount,
        avgSentiment: scoreResult.avgSentiment,
      },
    });
    
    return influencer;
  }
  
  /**
   * Check if cache is still valid
   */
  private isCacheValid(lastUpdated: Date): boolean {
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate < config.cache.ttlHours;
  }
  
  /**
   * Get available niches
   */
  async getNiches(): Promise<string[]> {
    const influencers = await prisma.influencer.findMany({
      where: { niche: { not: null } },
      select: { niche: true },
      distinct: ['niche'],
    });
    
    return influencers
      .map(i => i.niche)
      .filter((n): n is string => n !== null);
  }
}

export default new InfluencerService();
