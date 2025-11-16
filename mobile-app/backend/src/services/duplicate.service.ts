import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export class DuplicateDetectionService {
  /**
   * Check if a signal is a duplicate
   */
  async checkDuplicate(
    influencerId: string,
    type: string,
    comment: string
  ): Promise<{ isDuplicate: boolean; originalSignalId?: string; similarity?: number }> {
    if (!comment || comment.trim().length < 10) {
      return { isDuplicate: false };
    }

    // Generate content hash
    const contentHash = this.generateContentHash(comment);

    // Check for exact hash match
    const exactMatch = await prisma.communitySignal.findFirst({
      where: {
        influencerId,
        type,
        contentHash,
        status: 'VERIFIED',
        isHidden: false,
      },
    });

    if (exactMatch) {
      logger.info(`Exact duplicate detected for influencer ${influencerId}`);
      return {
        isDuplicate: true,
        originalSignalId: exactMatch.id,
        similarity: 100,
      };
    }

    // Check for similar content (fuzzy matching)
    const similarSignals = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        type,
        status: 'VERIFIED',
        isHidden: false,
        comment: {
          not: null,
        },
      },
      take: 50, // Check last 50 signals
      orderBy: { createdAt: 'desc' },
    });

    for (const signal of similarSignals) {
      if (!signal.comment) continue;

      const similarity = this.calculateSimilarity(comment, signal.comment);

      // If similarity > 80%, consider it a duplicate
      if (similarity > 80) {
        logger.info(`Similar duplicate detected (${similarity}%) for influencer ${influencerId}`);
        return {
          isDuplicate: true,
          originalSignalId: signal.id,
          similarity,
        };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Generate content hash for exact duplicate detection
   */
  private generateContentHash(content: string): string {
    // Normalize content: lowercase, remove extra spaces, trim
    const normalized = content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex');
  }

  /**
   * Calculate similarity between two strings (0-100)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    // Normalize strings
    const s1 = str1.toLowerCase().replace(/\s+/g, ' ').trim();
    const s2 = str2.toLowerCase().replace(/\s+/g, ' ').trim();

    // If one is substring of the other
    if (s1.includes(s2) || s2.includes(s1)) {
      return 90;
    }

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Mark signal as duplicate
   */
  async markAsDuplicate(signalId: string, originalSignalId: string) {
    await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        isDuplicate: true,
        duplicateOf: originalSignalId,
        status: 'REJECTED',
        rejectionReason: 'Duplicate: This information has already been reported',
      },
    });

    logger.info(`Signal ${signalId} marked as duplicate of ${originalSignalId}`);
  }

  /**
   * Get duplicate statistics for an influencer
   */
  async getDuplicateStats(influencerId: string) {
    const duplicates = await prisma.communitySignal.findMany({
      where: {
        influencerId,
        isDuplicate: true,
      },
    });

    const uniqueOriginals = new Set(duplicates.map(d => d.duplicateOf).filter(Boolean));

    return {
      totalDuplicates: duplicates.length,
      uniqueReports: uniqueOriginals.size,
      duplicateRate: duplicates.length > 0 
        ? (duplicates.length / (duplicates.length + uniqueOriginals.size)) * 100 
        : 0,
    };
  }
}

export default new DuplicateDetectionService();
