import { PrismaClient, Influencer, Mention } from '@prisma/client';
import perplexityService from './perplexity.service';
import scoringService from './scoring.service';
import logger from '../utils/logger';
import { config } from '../config';

const prisma = new PrismaClient();

export interface InfluencerWithMentions extends Influencer {
  mentions: Mention[];
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
    
    return prisma.influencer.findMany({
      where,
      orderBy: { trustScore: 'desc' },
      take: limit,
    });
  }
  
  /**
   * Get influencer by ID with mentions
   */
  async getInfluencerById(id: string): Promise<InfluencerWithMentions | null> {
    return prisma.influencer.findUnique({
      where: { id },
      include: {
        mentions: {
          orderBy: { scrapedAt: 'desc' },
          take: 100,
        },
      },
    });
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
        mentions: {
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
    
    // Perform new research
    logger.info(`Performing new research for: ${name}`);
    const researchResult = await perplexityService.researchInfluencer(name);
    
    logger.info(`Research completed: ${researchResult.mentions.length} mentions found`);
    logger.info(`Breakdown: ${researchResult.mentions.filter(m => m.label === 'drama').length} drama, ${researchResult.mentions.filter(m => m.label === 'good_action').length} good actions, ${researchResult.mentions.filter(m => m.label === 'neutral').length} neutral`);
    
    // Calculate trust score
    const scoreResult = scoringService.calculateTrustScore(
      researchResult.mentions.map(m => ({
        sentimentScore: m.sentimentScore,
        label: m.label,
        scrapedAt: new Date(),
      }))
    );
    
    logger.info(`Trust score calculated: ${scoreResult.trustScore} (drama: ${scoreResult.dramaCount}, good: ${scoreResult.goodActionCount})`);
    
    // Save or update influencer
    const influencer = await this.saveInfluencer(
      name,
      scoreResult,
      researchResult.mentions
    );
    
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
        name,
        trustScore: scoreResult.trustScore,
        dramaCount: scoreResult.dramaCount,
        goodActionCount: scoreResult.goodActionCount,
        neutralCount: scoreResult.neutralCount,
        avgSentiment: scoreResult.avgSentiment,
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
