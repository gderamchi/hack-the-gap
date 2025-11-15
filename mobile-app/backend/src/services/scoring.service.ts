import { config } from '../config';

export interface MentionData {
  sentimentScore: number;
  label: 'drama' | 'good_action' | 'neutral';
  scrapedAt: Date;
}

export interface TrustScoreResult {
  trustScore: number;
  dramaCount: number;
  goodActionCount: number;
  neutralCount: number;
  avgSentiment: number;
  breakdown: {
    base: number;
    dramaImpact: number;
    goodActionImpact: number;
    sentimentImpact: number;
    totalMentions: number;
    recencyFactor: number;
  };
}

/**
 * Trust score calculation service
 * Implements the same algorithm as the Python scorer.py
 */
export class ScoringService {
  private baseScore: number;
  private dramaWeight: number;
  private goodActionWeight: number;
  private sentimentWeight: number;
  private recencyDecayDays: number;
  
  constructor() {
    this.baseScore = config.scoring.baseScore;
    this.dramaWeight = config.scoring.dramaWeight;
    this.goodActionWeight = config.scoring.goodActionWeight;
    this.sentimentWeight = config.scoring.sentimentWeight;
    this.recencyDecayDays = config.scoring.recencyDecayDays;
  }
  
  /**
   * Calculate trust score from mentions
   */
  calculateTrustScore(mentions: MentionData[]): TrustScoreResult {
    if (mentions.length === 0) {
      return {
        trustScore: this.baseScore,
        dramaCount: 0,
        goodActionCount: 0,
        neutralCount: 0,
        avgSentiment: 0.0,
        breakdown: {
          base: this.baseScore,
          dramaImpact: 0,
          goodActionImpact: 0,
          sentimentImpact: 0,
          totalMentions: 0,
          recencyFactor: 0,
        },
      };
    }
    
    // Count mentions by label
    let dramaCount = 0;
    let goodActionCount = 0;
    let neutralCount = 0;
    const sentimentScores: number[] = [];
    
    // Calculate weighted scores based on recency
    let weightedDrama = 0.0;
    let weightedGood = 0.0;
    let weightedSentiment = 0.0;
    let totalWeight = 0.0;
    
    const now = new Date();
    
    for (const mention of mentions) {
      // Calculate recency weight
      const scrapedAt = mention.scrapedAt instanceof Date 
        ? mention.scrapedAt 
        : new Date(mention.scrapedAt);
      
      const daysOld = Math.floor((now.getTime() - scrapedAt.getTime()) / (1000 * 60 * 60 * 24));
      const recencyWeight = this.calculateRecencyWeight(daysOld);
      
      // Count by label
      if (mention.label === 'drama') {
        dramaCount++;
        weightedDrama += recencyWeight;
      } else if (mention.label === 'good_action') {
        goodActionCount++;
        weightedGood += recencyWeight;
      } else {
        neutralCount++;
      }
      
      sentimentScores.push(mention.sentimentScore);
      weightedSentiment += mention.sentimentScore * recencyWeight;
      totalWeight += recencyWeight;
    }
    
    // Calculate average sentiment
    const avgSentiment = sentimentScores.length > 0
      ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
      : 0.0;
    
    // Calculate weighted averages
    if (totalWeight > 0) {
      weightedDrama /= totalWeight;
      weightedGood /= totalWeight;
      weightedSentiment /= totalWeight;
    }
    
    // Calculate trust score
    let trustScore = this.baseScore;
    
    // Apply drama penalty (weighted)
    const dramaImpact = weightedDrama * this.dramaWeight * dramaCount;
    trustScore += dramaImpact;
    
    // Apply good action bonus (weighted)
    const goodActionImpact = weightedGood * this.goodActionWeight * goodActionCount;
    trustScore += goodActionImpact;
    
    // Apply sentiment influence
    const sentimentImpact = weightedSentiment * this.sentimentWeight;
    trustScore += sentimentImpact;
    
    // Normalize to 0-100 range
    trustScore = Math.max(0.0, Math.min(100.0, trustScore));
    
    // Calculate recency factor
    const recencyFactor = mentions.length > 0 ? totalWeight / mentions.length : 0.0;
    
    return {
      trustScore: Math.round(trustScore * 100) / 100,
      dramaCount,
      goodActionCount,
      neutralCount,
      avgSentiment: Math.round(avgSentiment * 1000) / 1000,
      breakdown: {
        base: this.baseScore,
        dramaImpact: Math.round(dramaImpact * 100) / 100,
        goodActionImpact: Math.round(goodActionImpact * 100) / 100,
        sentimentImpact: Math.round(sentimentImpact * 100) / 100,
        totalMentions: mentions.length,
        recencyFactor: Math.round(recencyFactor * 1000) / 1000,
      },
    };
  }
  
  /**
   * Calculate weight based on how recent the mention is
   * Uses exponential decay: weight = e^(-days/decay_period)
   */
  private calculateRecencyWeight(daysOld: number): number {
    if (daysOld < 0) {
      daysOld = 0;
    }
    
    // Exponential decay
    const weight = Math.exp(-daysOld / this.recencyDecayDays);
    
    // Ensure minimum weight of 0.1 for very old mentions
    return Math.max(0.1, weight);
  }
  
  /**
   * Get trust level description in French
   */
  getTrustLevel(trustScore: number): string {
    if (trustScore >= 80) return 'Très fiable';
    if (trustScore >= 60) return 'Fiable';
    if (trustScore >= 40) return 'Neutre';
    if (trustScore >= 20) return 'Peu fiable';
    return 'Non fiable';
  }
  
  /**
   * Get color for trust score visualization
   */
  getTrustColor(trustScore: number): string {
    if (trustScore >= 80) return '#10b981'; // Green
    if (trustScore >= 60) return '#3b82f6'; // Blue
    if (trustScore >= 40) return '#f59e0b'; // Orange
    if (trustScore >= 20) return '#ef4444'; // Red
    return '#991b1b'; // Dark red
  }
}

export default new ScoringService();
