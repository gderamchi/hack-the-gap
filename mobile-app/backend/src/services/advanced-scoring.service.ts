import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';
import { config } from '../config';

const prisma = new PrismaClient();

/**
 * Advanced Trust Score Calculation Service
 * 
 * This service implements a sophisticated, multi-dimensional trust scoring algorithm
 * that combines AI-generated data with community feedback to produce accurate,
 * fair, and transparent trust scores for influencers.
 * 
 * Key Features:
 * - Multi-source data integration (AI mentions + community reports)
 * - Time-decay weighting (recent events matter more)
 * - User reputation weighting (trusted users have more influence)
 * - Verification status consideration
 * - Controversy detection and handling
 * - Trend analysis and momentum calculation
 * - Outlier detection and filtering
 * - Confidence scoring
 */

export interface ScoringInput {
  influencerId: string;
  aiMentions?: AIMention[];
  communitySignals?: CommunitySignal[];
  forceRecalculation?: boolean;
}

export interface AIMention {
  id: string;
  sentimentScore: number;
  label: 'drama' | 'good_action' | 'neutral';
  scrapedAt: Date;
  source: string;
  textExcerpt: string;
}

export interface CommunitySignal {
  id: string;
  type: 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION' | 'COMMENT';
  rating?: number;
  comment?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: Date;
  user: {
    id: string;
    role: string;
    reputationScore: number;
    level: number;
  };
}

export interface AdvancedTrustScore {
  // Final Scores
  finalScore: number;
  aiScore: number;
  communityScore: number;
  combinedScore: number;
  
  // Confidence & Reliability
  confidenceLevel: number; // 0-100: How confident we are in this score
  dataQuality: number; // 0-100: Quality of underlying data
  controversyLevel: number; // 0-100: How controversial this influencer is
  
  // Trend Analysis
  trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
  momentum: number; // -100 to +100: Rate of change
  volatility: number; // 0-100: How much the score fluctuates
  
  // Component Breakdown
  breakdown: {
    // AI Components
    aiBase: number;
    aiDramaImpact: number;
    aiPositiveImpact: number;
    aiSentimentImpact: number;
    aiRecencyFactor: number;
    
    // Community Components
    communityBase: number;
    communityRatingImpact: number;
    communityDramaImpact: number;
    communityPositiveImpact: number;
    communityReputationFactor: number;
    
    // Adjustments
    controversyPenalty: number;
    verificationBonus: number;
    consistencyBonus: number;
    outlierAdjustment: number;
  };
  
  // Data Metrics
  metrics: {
    totalAIMentions: number;
    totalCommunitySignals: number;
    verifiedSignals: number;
    pendingSignals: number;
    rejectedSignals: number;
    avgRating: number;
    dramaCount: number;
    positiveCount: number;
    neutralCount: number;
    uniqueContributors: number;
    dataSpan: number; // Days of data
  };
  
  // Timestamps
  calculatedAt: Date;
  lastUpdated: Date;
}

export class AdvancedScoringService {
  private readonly BASE_SCORE = 50;
  private readonly AI_WEIGHT = 0.55; // 55% AI
  private readonly COMMUNITY_WEIGHT = 0.45; // 45% Community
  
  // Time decay parameters
  private readonly RECENCY_DECAY_DAYS = 180; // 6 months
  private readonly RECENT_THRESHOLD_DAYS = 30; // Last 30 days = "recent"
  
  // Reputation weights
  private readonly REPUTATION_WEIGHTS = {
    ADMIN: 2.5,
    PROFESSIONAL: 1.8,
    COMMUNITY: 1.0,
  };
  
  // Verification status weights
  private readonly VERIFICATION_WEIGHTS = {
    VERIFIED: 1.0,
    PENDING: 0.3,
    REJECTED: 0.0,
  };
  
  /**
   * Calculate comprehensive trust score for an influencer
   */
  async calculateAdvancedTrustScore(input: ScoringInput): Promise<AdvancedTrustScore> {
    logger.info(`🎯 Starting advanced trust score calculation for influencer ${input.influencerId}`);
    
    // Fetch data if not provided
    const aiMentions = input.aiMentions || await this.fetchAIMentions(input.influencerId);
    const communitySignals = input.communitySignals || await this.fetchCommunitySignals(input.influencerId);
    
    // Calculate AI-based score
    const aiScoreResult = this.calculateAIScore(aiMentions);
    
    // Calculate community-based score
    const communityScoreResult = this.calculateCommunityScore(communitySignals);
    
    // Combine scores with weighted average
    const combinedScore = (aiScoreResult.score * this.AI_WEIGHT) + 
                         (communityScoreResult.score * this.COMMUNITY_WEIGHT);
    
    // Calculate controversy level
    const controversyLevel = this.calculateControversyLevel(aiMentions, communitySignals);
    
    // Apply controversy penalty
    const controversyPenalty = this.calculateControversyPenalty(controversyLevel);
    
    // Calculate verification bonus
    const verificationBonus = this.calculateVerificationBonus(communitySignals);
    
    // Calculate consistency bonus
    const consistencyBonus = this.calculateConsistencyBonus(aiMentions, communitySignals);
    
    // Detect and handle outliers
    const outlierAdjustment = this.detectOutliers(aiMentions, communitySignals);
    
    // Calculate final score with all adjustments
    let finalScore = combinedScore + controversyPenalty + verificationBonus + 
                     consistencyBonus + outlierAdjustment;
    
    // Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    // Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(aiMentions, communitySignals);
    
    // Calculate data quality
    const dataQuality = this.calculateDataQuality(aiMentions, communitySignals);
    
    // Analyze trend
    const trendAnalysis = this.analyzeTrend(aiMentions, communitySignals);
    
    // Calculate metrics
    const metrics = this.calculateMetrics(aiMentions, communitySignals);
    
    const result: AdvancedTrustScore = {
      finalScore: Math.round(finalScore * 100) / 100,
      aiScore: Math.round(aiScoreResult.score * 100) / 100,
      communityScore: Math.round(communityScoreResult.score * 100) / 100,
      combinedScore: Math.round(combinedScore * 100) / 100,
      
      confidenceLevel: Math.round(confidenceLevel * 100) / 100,
      dataQuality: Math.round(dataQuality * 100) / 100,
      controversyLevel: Math.round(controversyLevel * 100) / 100,
      
      trend: trendAnalysis.trend,
      momentum: Math.round(trendAnalysis.momentum * 100) / 100,
      volatility: Math.round(trendAnalysis.volatility * 100) / 100,
      
      breakdown: {
        aiBase: Math.round(aiScoreResult.base * 100) / 100,
        aiDramaImpact: Math.round(aiScoreResult.dramaImpact * 100) / 100,
        aiPositiveImpact: Math.round(aiScoreResult.positiveImpact * 100) / 100,
        aiSentimentImpact: Math.round(aiScoreResult.sentimentImpact * 100) / 100,
        aiRecencyFactor: Math.round(aiScoreResult.recencyFactor * 100) / 100,
        
        communityBase: Math.round(communityScoreResult.base * 100) / 100,
        communityRatingImpact: Math.round(communityScoreResult.ratingImpact * 100) / 100,
        communityDramaImpact: Math.round(communityScoreResult.dramaImpact * 100) / 100,
        communityPositiveImpact: Math.round(communityScoreResult.positiveImpact * 100) / 100,
        communityReputationFactor: Math.round(communityScoreResult.reputationFactor * 100) / 100,
        
        controversyPenalty: Math.round(controversyPenalty * 100) / 100,
        verificationBonus: Math.round(verificationBonus * 100) / 100,
        consistencyBonus: Math.round(consistencyBonus * 100) / 100,
        outlierAdjustment: Math.round(outlierAdjustment * 100) / 100,
      },
      
      metrics,
      
      calculatedAt: new Date(),
      lastUpdated: new Date(),
    };
    
    logger.info(`✅ Advanced trust score calculated: ${result.finalScore} (AI: ${result.aiScore}, Community: ${result.communityScore}, Confidence: ${result.confidenceLevel}%)`);
    
    return result;
  }
  
  /**
   * Calculate AI-based score from mentions
   */
  private calculateAIScore(mentions: AIMention[]) {
    if (mentions.length === 0) {
      return {
        score: this.BASE_SCORE,
        base: this.BASE_SCORE,
        dramaImpact: 0,
        positiveImpact: 0,
        sentimentImpact: 0,
        recencyFactor: 0,
      };
    }
    
    const now = new Date();
    let score = this.BASE_SCORE;
    
    // Count by label with time weighting
    let weightedDrama = 0;
    let weightedPositive = 0;
    let weightedSentiment = 0;
    let totalWeight = 0;
    
    let dramaCount = 0;
    let positiveCount = 0;
    
    for (const mention of mentions) {
      const daysOld = this.getDaysOld(mention.scrapedAt, now);
      const recencyWeight = this.calculateRecencyWeight(daysOld);
      
      if (mention.label === 'drama') {
        dramaCount++;
        weightedDrama += recencyWeight;
      } else if (mention.label === 'good_action') {
        positiveCount++;
        weightedPositive += recencyWeight;
      }
      
      weightedSentiment += mention.sentimentScore * recencyWeight;
      totalWeight += recencyWeight;
    }
    
    // Normalize weights
    if (totalWeight > 0) {
      weightedDrama /= totalWeight;
      weightedPositive /= totalWeight;
      weightedSentiment /= totalWeight;
    }
    
    // Calculate impacts
    const dramaImpact = -weightedDrama * 15 * Math.min(dramaCount, 10); // Max -150
    const positiveImpact = weightedPositive * 10 * Math.min(positiveCount, 10); // Max +100
    const sentimentImpact = weightedSentiment * 20; // -20 to +20
    
    score += dramaImpact + positiveImpact + sentimentImpact;
    
    // Clamp
    score = Math.max(0, Math.min(100, score));
    
    const recencyFactor = totalWeight / mentions.length;
    
    return {
      score,
      base: this.BASE_SCORE,
      dramaImpact,
      positiveImpact,
      sentimentImpact,
      recencyFactor,
    };
  }
  
  /**
   * Calculate community-based score from signals
   */
  private calculateCommunityScore(signals: CommunitySignal[]) {
    if (signals.length === 0) {
      return {
        score: this.BASE_SCORE,
        base: this.BASE_SCORE,
        ratingImpact: 0,
        dramaImpact: 0,
        positiveImpact: 0,
        reputationFactor: 0,
      };
    }
    
    const now = new Date();
    let score = this.BASE_SCORE;
    
    // Separate by type
    const ratings = signals.filter(s => s.type === 'RATING' && s.rating);
    const dramas = signals.filter(s => s.type === 'DRAMA_REPORT');
    const positives = signals.filter(s => s.type === 'POSITIVE_ACTION');
    
    // Calculate weighted average rating
    let weightedRating = 0;
    let ratingWeight = 0;
    
    for (const signal of ratings) {
      const daysOld = this.getDaysOld(signal.createdAt, now);
      const recencyWeight = this.calculateRecencyWeight(daysOld);
      const verificationWeight = this.VERIFICATION_WEIGHTS[signal.status];
      const reputationWeight = this.getReputationWeight(signal.user);
      
      const totalWeight = recencyWeight * verificationWeight * reputationWeight;
      
      weightedRating += (signal.rating || 0) * totalWeight;
      ratingWeight += totalWeight;
    }
    
    const avgRating = ratingWeight > 0 ? weightedRating / ratingWeight : 3;
    
    // Rating impact: -20 to +20 based on deviation from 3
    const ratingImpact = (avgRating - 3) * 10;
    
    // Calculate drama impact with reputation weighting
    let dramaImpact = 0;
    for (const signal of dramas) {
      if (signal.status === 'VERIFIED') {
        const daysOld = this.getDaysOld(signal.createdAt, now);
        const recencyWeight = this.calculateRecencyWeight(daysOld);
        const reputationWeight = this.getReputationWeight(signal.user);
        dramaImpact -= 8 * recencyWeight * reputationWeight; // Up to -8 per verified drama
      }
    }
    dramaImpact = Math.max(dramaImpact, -40); // Cap at -40
    
    // Calculate positive impact with reputation weighting
    let positiveImpact = 0;
    for (const signal of positives) {
      if (signal.status === 'VERIFIED') {
        const daysOld = this.getDaysOld(signal.createdAt, now);
        const recencyWeight = this.calculateRecencyWeight(daysOld);
        const reputationWeight = this.getReputationWeight(signal.user);
        positiveImpact += 6 * recencyWeight * reputationWeight; // Up to +6 per verified positive
      }
    }
    positiveImpact = Math.min(positiveImpact, 30); // Cap at +30
    
    score += ratingImpact + dramaImpact + positiveImpact;
    
    // Clamp
    score = Math.max(0, Math.min(100, score));
    
    // Calculate average reputation factor
    const reputationFactor = signals.length > 0
      ? signals.reduce((sum, s) => sum + this.getReputationWeight(s.user), 0) / signals.length
      : 1.0;
    
    return {
      score,
      base: this.BASE_SCORE,
      ratingImpact,
      dramaImpact,
      positiveImpact,
      reputationFactor,
    };
  }
  
  /**
   * Calculate controversy level (0-100)
   * High controversy = lots of conflicting signals
   */
  private calculateControversyLevel(mentions: AIMention[], signals: CommunitySignal[]): number {
    let controversy = 0;
    
    // AI controversy: drama vs positive ratio
    const aiDrama = mentions.filter(m => m.label === 'drama').length;
    const aiPositive = mentions.filter(m => m.label === 'good_action').length;
    
    if (aiDrama > 0 && aiPositive > 0) {
      const ratio = Math.min(aiDrama, aiPositive) / Math.max(aiDrama, aiPositive);
      controversy += ratio * 30; // Up to +30 if balanced drama/positive
    }
    
    // Community controversy: rating variance
    const ratings = signals
      .filter(s => s.type === 'RATING' && s.rating && s.status === 'VERIFIED')
      .map(s => s.rating!);
    
    if (ratings.length >= 3) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / ratings.length;
      const stdDev = Math.sqrt(variance);
      controversy += Math.min(stdDev * 15, 30); // Up to +30 for high variance
    }
    
    // Report controversy: drama vs positive reports
    const dramaReports = signals.filter(s => s.type === 'DRAMA_REPORT' && s.status === 'VERIFIED').length;
    const positiveReports = signals.filter(s => s.type === 'POSITIVE_ACTION' && s.status === 'VERIFIED').length;
    
    if (dramaReports > 0 && positiveReports > 0) {
      const ratio = Math.min(dramaReports, positiveReports) / Math.max(dramaReports, positiveReports);
      controversy += ratio * 40; // Up to +40 if balanced reports
    }
    
    return Math.min(controversy, 100);
  }
  
  /**
   * Calculate controversy penalty
   * High controversy = less reliable score = penalty
   */
  private calculateControversyPenalty(controversyLevel: number): number {
    // Penalty increases with controversy
    // 0% controversy = 0 penalty
    // 50% controversy = -5 penalty
    // 100% controversy = -15 penalty
    return -(controversyLevel / 100) * 15;
  }
  
  /**
   * Calculate verification bonus
   * More verified signals = more reliable = bonus
   */
  private calculateVerificationBonus(signals: CommunitySignal[]): number {
    if (signals.length === 0) return 0;
    
    const verified = signals.filter(s => s.status === 'VERIFIED').length;
    const verificationRate = verified / signals.length;
    
    // High verification rate = bonus
    // 100% verified = +5 bonus
    // 50% verified = +2.5 bonus
    return verificationRate * 5;
  }
  
  /**
   * Calculate consistency bonus
   * AI and community agree = bonus
   */
  private calculateConsistencyBonus(mentions: AIMention[], signals: CommunitySignal[]): number {
    if (mentions.length === 0 || signals.length === 0) return 0;
    
    // Compare AI sentiment with community ratings
    const aiSentiment = mentions.reduce((sum, m) => sum + m.sentimentScore, 0) / mentions.length;
    
    const ratings = signals
      .filter(s => s.type === 'RATING' && s.rating && s.status === 'VERIFIED')
      .map(s => s.rating!);
    
    if (ratings.length === 0) return 0;
    
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    
    // Convert rating to sentiment scale (-1 to +1)
    const ratingSentiment = (avgRating - 3) / 2; // 1->-1, 3->0, 5->+1
    
    // Calculate agreement
    const agreement = 1 - Math.abs(aiSentiment - ratingSentiment);
    
    // High agreement = bonus (up to +5)
    return agreement * 5;
  }
  
  /**
   * Detect outliers and adjust score
   */
  private detectOutliers(mentions: AIMention[], signals: CommunitySignal[]): number {
    // Detect if there are extreme outlier ratings
    const ratings = signals
      .filter(s => s.type === 'RATING' && s.rating && s.status === 'VERIFIED')
      .map(s => s.rating!);
    
    if (ratings.length < 5) return 0; // Need enough data
    
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const outliers = ratings.filter(r => Math.abs(r - avg) > 2).length;
    
    // If >30% are outliers, apply small adjustment
    const outlierRate = outliers / ratings.length;
    if (outlierRate > 0.3) {
      return -outlierRate * 3; // Up to -3 penalty
    }
    
    return 0;
  }
  
  /**
   * Calculate confidence level (0-100)
   * More data + more verified + less controversy = higher confidence
   */
  private calculateConfidenceLevel(mentions: AIMention[], signals: CommunitySignal[]): number {
    let confidence = 0;
    
    // Data volume confidence (0-40 points)
    const totalData = mentions.length + signals.length;
    confidence += Math.min(totalData * 2, 40);
    
    // Verification confidence (0-30 points)
    if (signals.length > 0) {
      const verified = signals.filter(s => s.status === 'VERIFIED').length;
      const verificationRate = verified / signals.length;
      confidence += verificationRate * 30;
    }
    
    // Recency confidence (0-20 points)
    const recentMentions = mentions.filter(m => 
      this.getDaysOld(m.scrapedAt, new Date()) < this.RECENT_THRESHOLD_DAYS
    ).length;
    const recentSignals = signals.filter(s => 
      this.getDaysOld(s.createdAt, new Date()) < this.RECENT_THRESHOLD_DAYS
    ).length;
    const recentData = recentMentions + recentSignals;
    confidence += Math.min(recentData * 2, 20);
    
    // Diversity confidence (0-10 points)
    const uniqueContributors = new Set(signals.map(s => s.user.id)).size;
    confidence += Math.min(uniqueContributors, 10);
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Calculate data quality (0-100)
   */
  private calculateDataQuality(mentions: AIMention[], signals: CommunitySignal[]): number {
    let quality = 0;
    
    // Source diversity (0-30 points)
    const uniqueSources = new Set(mentions.map(m => m.source)).size;
    quality += Math.min(uniqueSources * 5, 30);
    
    // Verification rate (0-40 points)
    if (signals.length > 0) {
      const verified = signals.filter(s => s.status === 'VERIFIED').length;
      quality += (verified / signals.length) * 40;
    }
    
    // Contributor reputation (0-30 points)
    if (signals.length > 0) {
      const avgReputation = signals.reduce((sum, s) => 
        sum + (s.user.reputationScore || 50), 0
      ) / signals.length;
      quality += (avgReputation / 100) * 30;
    }
    
    return Math.min(quality, 100);
  }
  
  /**
   * Analyze trend and momentum
   */
  private analyzeTrend(mentions: AIMention[], signals: CommunitySignal[]) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    // Recent vs older data
    const recentMentions = mentions.filter(m => m.scrapedAt >= thirtyDaysAgo);
    const olderMentions = mentions.filter(m => m.scrapedAt < thirtyDaysAgo && m.scrapedAt >= sixtyDaysAgo);
    
    const recentSignals = signals.filter(s => s.createdAt >= thirtyDaysAgo);
    const olderSignals = signals.filter(s => s.createdAt < thirtyDaysAgo && s.createdAt >= sixtyDaysAgo);
    
    // Calculate scores for each period
    const recentScore = this.calculatePeriodScore(recentMentions, recentSignals);
    const olderScore = this.calculatePeriodScore(olderMentions, olderSignals);
    
    // Calculate momentum
    const momentum = recentScore - olderScore;
    
    // Calculate volatility
    const allScores = [...mentions, ...signals].map(item => {
      if ('sentimentScore' in item) {
        return item.sentimentScore * 50 + 50; // Convert to 0-100
      } else if ('rating' in item && item.rating) {
        return item.rating * 20; // Convert to 0-100
      }
      return 50;
    });
    
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length;
    const volatility = Math.sqrt(variance);
    
    // Determine trend
    let trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE';
    if (volatility > 20) {
      trend = 'VOLATILE';
    } else if (momentum > 10) {
      trend = 'RISING';
    } else if (momentum < -10) {
      trend = 'FALLING';
    } else {
      trend = 'STABLE';
    }
    
    return {
      trend,
      momentum,
      volatility,
    };
  }
  
  /**
   * Calculate score for a specific time period
   */
  private calculatePeriodScore(mentions: AIMention[], signals: CommunitySignal[]): number {
    if (mentions.length === 0 && signals.length === 0) return 50;
    
    const aiResult = this.calculateAIScore(mentions);
    const communityResult = this.calculateCommunityScore(signals);
    
    return (aiResult.score * this.AI_WEIGHT) + (communityResult.score * this.COMMUNITY_WEIGHT);
  }
  
  /**
   * Calculate comprehensive metrics
   */
  private calculateMetrics(mentions: AIMention[], signals: CommunitySignal[]) {
    const verifiedSignals = signals.filter(s => s.status === 'VERIFIED');
    const ratings = verifiedSignals.filter(s => s.type === 'RATING' && s.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, s) => sum + (s.rating || 0), 0) / ratings.length
      : 0;
    
    const dramaCount = mentions.filter(m => m.label === 'drama').length +
                      verifiedSignals.filter(s => s.type === 'DRAMA_REPORT').length;
    
    const positiveCount = mentions.filter(m => m.label === 'good_action').length +
                         verifiedSignals.filter(s => s.type === 'POSITIVE_ACTION').length;
    
    const neutralCount = mentions.filter(m => m.label === 'neutral').length;
    
    const uniqueContributors = new Set(signals.map(s => s.user.id)).size;
    
    // Calculate data span
    const allDates = [
      ...mentions.map(m => m.scrapedAt),
      ...signals.map(s => s.createdAt),
    ];
    
    const dataSpan = allDates.length > 0
      ? this.getDaysOld(Math.min(...allDates.map(d => d.getTime())), new Date())
      : 0;
    
    return {
      totalAIMentions: mentions.length,
      totalCommunitySignals: signals.length,
      verifiedSignals: verifiedSignals.length,
      pendingSignals: signals.filter(s => s.status === 'PENDING').length,
      rejectedSignals: signals.filter(s => s.status === 'REJECTED').length,
      avgRating: Math.round(avgRating * 100) / 100,
      dramaCount,
      positiveCount,
      neutralCount,
      uniqueContributors,
      dataSpan,
    };
  }
  
  /**
   * Helper: Get reputation weight for a user
   */
  private getReputationWeight(user: { role: string; reputationScore: number; level: number }): number {
    let weight = this.REPUTATION_WEIGHTS[user.role as keyof typeof this.REPUTATION_WEIGHTS] || 1.0;
    
    // Adjust by reputation score (50-150% of base weight)
    const reputationMultiplier = 0.5 + (user.reputationScore / 100);
    weight *= reputationMultiplier;
    
    // Adjust by level (small bonus for high-level users)
    const levelBonus = 1 + (Math.min(user.level, 50) * 0.01); // Up to +50%
    weight *= levelBonus;
    
    return weight;
  }
  
  /**
   * Helper: Calculate recency weight using exponential decay
   */
  private calculateRecencyWeight(daysOld: number): number {
    return Math.max(0.1, Math.exp(-daysOld / this.RECENCY_DECAY_DAYS));
  }
  
  /**
   * Helper: Get days old
   */
  private getDaysOld(date: Date | number, now: Date): number {
    const timestamp = date instanceof Date ? date.getTime() : date;
    return Math.floor((now.getTime() - timestamp) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Fetch AI mentions from database
   */
  private async fetchAIMentions(influencerId: string): Promise<AIMention[]> {
    const mentions = await prisma.mention.findMany({
      where: { influencerId },
      orderBy: { scrapedAt: 'desc' },
    });
    
    return mentions.map(m => ({
      id: m.id,
      sentimentScore: m.sentimentScore,
      label: m.label as 'drama' | 'good_action' | 'neutral',
      scrapedAt: m.scrapedAt,
      source: m.source,
      textExcerpt: m.textExcerpt,
    }));
  }
  
  /**
   * Fetch community signals from database
   */
  private async fetchCommunitySignals(influencerId: string): Promise<CommunitySignal[]> {
    const signals = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        isHidden: false,
      },
      include: {
        User: {
          include: {
            UserEngagementStats: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return signals.map(s => ({
      id: s.id,
      type: s.type as 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION' | 'COMMENT',
      rating: s.rating || undefined,
      comment: s.comment || undefined,
      status: s.status as 'PENDING' | 'VERIFIED' | 'REJECTED',
      createdAt: s.createdAt,
      user: {
        id: s.User?.id || '',
        role: s.User?.role || 'COMMUNITY',
        reputationScore: s.User?.UserEngagementStats?.reputationScore || 50,
        level: s.User?.UserEngagementStats?.level || 1,
      },
    }));
  }
  
  /**
   * Update influencer's trust score in database
   */
  async updateInfluencerScore(influencerId: string): Promise<void> {
    const score = await this.calculateAdvancedTrustScore({ influencerId });
    
    await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        trustScore: score.finalScore,
        dramaCount: score.metrics.dramaCount,
        goodActionCount: score.metrics.positiveCount,
        neutralCount: score.metrics.neutralCount,
        avgSentiment: (score.aiScore - 50) / 50, // Convert back to -1 to +1
        lastUpdated: new Date(),
      },
    });
    
    // Store detailed score breakdown
    await prisma.communityTrustScore.upsert({
      where: { influencerId },
      create: {
        id: crypto.randomUUID(),
        influencerId,
        avgRating: score.metrics.avgRating,
        totalRatings: score.metrics.verifiedSignals,
        totalDramaReports: score.metrics.dramaCount,
        totalPositiveReports: score.metrics.positiveCount,
        totalComments: score.metrics.totalCommunitySignals,
        communityScore: score.communityScore,
        combinedScore: score.finalScore,
        lastUpdated: new Date(),
      },
      update: {
        avgRating: score.metrics.avgRating,
        totalRatings: score.metrics.verifiedSignals,
        totalDramaReports: score.metrics.dramaCount,
        totalPositiveReports: score.metrics.positiveCount,
        totalComments: score.metrics.totalCommunitySignals,
        communityScore: score.communityScore,
        combinedScore: score.finalScore,
        lastUpdated: new Date(),
      },
    });
    
    logger.info(`✅ Updated influencer ${influencerId} trust score to ${score.finalScore}`);
  }
}

export default new AdvancedScoringService();
