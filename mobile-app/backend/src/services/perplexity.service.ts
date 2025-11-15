import axios, { AxiosError } from 'axios';
import pLimit from 'p-limit';
import { config } from '../config';
import logger from '../utils/logger';
import { classifyContent, calculateSentiment } from '../utils/classifier';

export interface PerplexityMention {
  textExcerpt: string;
  source: string;
  sourceUrl: string;
  sentimentScore: number;
  label: 'drama' | 'good_action' | 'neutral';
  confidence: number;
}

export interface PerplexityResponse {
  mentions: PerplexityMention[];
  totalQueries: number;
  successfulQueries: number;
  errors: string[];
}

/**
 * Perplexity.ai integration service
 * Breaks down influencer research into multiple parallel queries
 */
export class PerplexityService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private limiter: ReturnType<typeof pLimit>;
  
  constructor() {
    this.apiKey = config.perplexity.apiKey;
    this.apiUrl = config.perplexity.apiUrl;
    this.model = config.perplexity.model;
    this.limiter = pLimit(config.perplexity.maxConcurrent);
    
    if (!this.apiKey) {
      logger.warn('Perplexity API key not configured. Service will return empty results.');
    }
  }
  
  /**
   * Generate targeted search queries for an influencer
   */
  private generateQueries(influencerName: string): string[] {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    return [
      `Controverses et scandales de ${influencerName} influenceur français`,
      `Actions positives et charité de ${influencerName}`,
      `Polémiques récentes ${influencerName} ${lastYear} ${currentYear}`,
      `Réputation ${influencerName} dans la communauté française`,
      `${influencerName} dramas et clashs récents`,
      `${influencerName} dons et actions humanitaires`,
      `Critiques et accusations contre ${influencerName}`,
    ];
  }
  
  /**
   * Execute a single query to Perplexity API
   */
  private async executeQuery(query: string): Promise<PerplexityMention[]> {
    if (!this.apiKey) {
      return [];
    }
    
    try {
      logger.debug(`Executing Perplexity query: ${query}`);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant de recherche qui analyse les informations publiques sur les influenceurs français. Fournis des faits vérifiables avec des sources. Ne spécule pas et ne fabrique pas d\'informations.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1000,
          temperature: 0.2,
          return_citations: true,
          return_images: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      // Parse response and extract mentions
      const content = response.data.choices?.[0]?.message?.content || '';
      const citations = response.data.citations || [];
      
      return this.parseMentions(content, citations, query);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        logger.error(`Perplexity API error for query "${query}":`, {
          status: axiosError.response?.status,
          message: axiosError.message,
        });
      } else {
        logger.error(`Unexpected error for query "${query}":`, error);
      }
      return [];
    }
  }
  
  /**
   * Parse Perplexity response into structured mentions
   * Improved to capture more context and better segment text
   */
  private parseMentions(
    content: string,
    citations: any[],
    query: string
  ): PerplexityMention[] {
    const mentions: PerplexityMention[] = [];
    
    if (!content || content.trim().length === 0) {
      logger.warn('Empty content received from Perplexity');
      return mentions;
    }
    
    // Split by paragraphs first (better context preservation)
    const paragraphs = content
      .split(/\n\n+/)
      .filter(p => p.trim().length > 0);
    
    // If no paragraphs, fall back to sentence splitting
    const segments = paragraphs.length > 0 
      ? paragraphs 
      : content.split(/[.!?]\s+/).filter(s => s.trim().length > 20);
    
    logger.debug(`Parsing ${segments.length} segments from Perplexity response`);
    
    for (const segment of segments) {
      const trimmedSegment = segment.trim();
      
      // More lenient length requirement
      if (trimmedSegment.length < 20) continue;
      
      // Calculate sentiment
      const sentimentScore = calculateSentiment(trimmedSegment);
      
      // Classify content
      const classification = classifyContent(trimmedSegment, sentimentScore);
      
      // Find relevant citation (try multiple strategies)
      let citation = citations.find(c => 
        c.text && (content.includes(c.text) || trimmedSegment.includes(c.text))
      );
      
      // If no citation found, use first available or default
      if (!citation && citations.length > 0) {
        citation = citations[0];
      }
      
      const mention: PerplexityMention = {
        textExcerpt: trimmedSegment,
        source: 'perplexity',
        sourceUrl: citation?.url || 'https://www.perplexity.ai',
        sentimentScore: classification.sentimentScore,
        label: classification.label,
        confidence: classification.confidence,
      };
      
      mentions.push(mention);
      
      // Log classification for debugging
      if (classification.label !== 'neutral') {
        logger.debug(`Classified as ${classification.label}: "${trimmedSegment.substring(0, 50)}..."`);
      }
    }
    
    logger.info(`Parsed ${mentions.length} mentions (${mentions.filter(m => m.label === 'drama').length} drama, ${mentions.filter(m => m.label === 'good_action').length} good actions)`);
    
    return mentions;
  }
  
  /**
   * Research an influencer using parallel queries
   */
  async researchInfluencer(influencerName: string): Promise<PerplexityResponse> {
    logger.info(`Starting Perplexity research for: ${influencerName}`);
    
    const queries = this.generateQueries(influencerName);
    const errors: string[] = [];
    let successfulQueries = 0;
    
    // Execute queries in parallel with rate limiting
    const queryPromises = queries.map(query =>
      this.limiter(async () => {
        try {
          // Add delay between requests
          await this.delay(config.perplexity.rateLimitMs);
          const mentions = await this.executeQuery(query);
          successfulQueries++;
          return mentions;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Query "${query}": ${errorMsg}`);
          return [];
        }
      })
    );
    
    const results = await Promise.all(queryPromises);
    
    // Flatten and deduplicate mentions
    const allMentions = results.flat();
    const uniqueMentions = this.deduplicateMentions(allMentions);
    
    logger.info(`Perplexity research completed: ${uniqueMentions.length} unique mentions found`);
    
    return {
      mentions: uniqueMentions,
      totalQueries: queries.length,
      successfulQueries,
      errors,
    };
  }
  
  /**
   * Deduplicate mentions based on text similarity
   */
  private deduplicateMentions(mentions: PerplexityMention[]): PerplexityMention[] {
    const unique: PerplexityMention[] = [];
    const seen = new Set<string>();
    
    for (const mention of mentions) {
      // Create a normalized key for comparison
      const key = mention.textExcerpt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 100);
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(mention);
      }
    }
    
    return unique;
  }
  
  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PerplexityService();
