import axios, { AxiosError } from 'axios';
import { config } from '../config';
import logger from '../utils/logger';
import { classifyContent, calculateSentiment } from '../utils/classifier';

// Dynamic import for p-limit (ES module)
let pLimit: any;
(async () => {
  const module = await import('p-limit');
  pLimit = module.default;
})();

export interface BlackboxMention {
  textExcerpt: string;
  source: string;
  sourceUrl: string;
  sentimentScore: number;
  label: 'drama' | 'good_action' | 'neutral';
  confidence: number;
}

export interface BlackboxResponse {
  mentions: BlackboxMention[];
  totalQueries: number;
  successfulQueries: number;
  errors: string[];
}

/**
 * Blackbox AI integration service (FREE with your API keys!)
 * Replaces Perplexity AI for influencer research
 */
export class BlackboxService {
  private apiKey: string;
  private apiUrl: string;
  private limiter: any;
  
  constructor() {
    this.apiKey = process.env.BLACKBOX_API_KEY || '';
    this.apiUrl = process.env.BLACKBOX_API_URL || 'https://api.blackbox.ai/v1/chat/completions';
    this.limiter = null; // Will be initialized async
    
    if (!this.apiKey) {
      logger.warn('Blackbox API key not configured. Service will return empty results.');
    }
  }
  
  /**
   * Generate targeted search queries for an influencer
   */
  private generateQueries(influencerName: string): string[] {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    return [
      `Recherche web: Controverses et scandales de ${influencerName} influenceur français`,
      `Recherche web: Actions positives et charité de ${influencerName}`,
      `Recherche web: Polémiques récentes ${influencerName} ${lastYear} ${currentYear}`,
      `Recherche web: Réputation ${influencerName} dans la communauté française`,
      `Recherche web: ${influencerName} dramas et clashs récents`,
      `Recherche web: ${influencerName} dons et actions humanitaires`,
      `Recherche web: Critiques et accusations contre ${influencerName}`,
    ];
  }
  
  /**
   * Execute a single query to Blackbox AI
   */
  private async executeQuery(query: string): Promise<BlackboxMention[]> {
    if (!this.apiKey) {
      return [];
    }
    
    try {
      logger.debug(`Executing Blackbox query: ${query}`);
      
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'blackboxai/perplexity/sonar-pro', // Using Perplexity Sonar Pro via Blackbox!
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
          stream: false,
          webSearch: true, // Enable web search for real-time data
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
      
      return this.parseMentions(content, query);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        logger.error(`Blackbox API error for query "${query}":`, {
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
   * Parse Blackbox response into structured mentions
   */
  private parseMentions(
    content: string,
    query: string
  ): BlackboxMention[] {
    const mentions: BlackboxMention[] = [];
    
    if (!content || content.trim().length === 0) {
      logger.warn('Empty content received from Blackbox');
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
    
    logger.debug(`Parsing ${segments.length} segments from Blackbox response`);
    
    for (const segment of segments) {
      const trimmedSegment = segment.trim();
      
      // More lenient length requirement
      if (trimmedSegment.length < 20) continue;
      
      // Calculate sentiment
      const sentimentScore = calculateSentiment(trimmedSegment);
      
      // Classify content
      const classification = classifyContent(trimmedSegment, sentimentScore);
      
      const mention: BlackboxMention = {
        textExcerpt: trimmedSegment,
        source: 'blackbox',
        sourceUrl: 'https://www.blackbox.ai', // Blackbox doesn't provide individual URLs
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
  async researchInfluencer(influencerName: string): Promise<BlackboxResponse> {
    logger.info(`Starting Blackbox research for: ${influencerName}`);
    
    // Initialize limiter if not done
    if (!this.limiter && pLimit) {
      this.limiter = pLimit(5);
    }
    
    const queries = this.generateQueries(influencerName);
    const errors: string[] = [];
    let successfulQueries = 0;
    
    // Execute queries in parallel (with or without rate limiting)
    const queryPromises = queries.map(query =>
      (this.limiter ? this.limiter(async () => {
        try {
          // Add delay between requests
          await this.delay(200); // 200ms delay
          const mentions = await this.executeQuery(query);
          successfulQueries++;
          return mentions;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Query "${query}": ${errorMsg}`);
          return [];
        }
      }) : (async () => {
        try {
          await this.delay(200);
          const mentions = await this.executeQuery(query);
          successfulQueries++;
          return mentions;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Query "${query}": ${errorMsg}`);
          return [];
        }
      })())
    );
    
    const results = await Promise.all(queryPromises);
    
    // Flatten and deduplicate mentions
    const allMentions = results.flat();
    const uniqueMentions = this.deduplicateMentions(allMentions);
    
    logger.info(`Blackbox research completed: ${uniqueMentions.length} unique mentions found`);
    
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
  private deduplicateMentions(mentions: BlackboxMention[]): BlackboxMention[] {
    const unique: BlackboxMention[] = [];
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

export default new BlackboxService();
