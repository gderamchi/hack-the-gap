import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../utils/logger';
import { config } from '../config';

const prisma = new PrismaClient();

const BLACKBOX_API_KEY = process.env.BLACKBOX_API_KEY || '';
const BLACKBOX_API_URL = process.env.BLACKBOX_API_URL || 'https://api.blackbox.ai/v1/chat/completions';

export class VerificationService {
  /**
   * Verify a community signal using AI
   */
  async verifySignal(signalId: string): Promise<{ verified: boolean; reason: string }> {
    const signal = await prisma.communitySignal.findUnique({
      where: { id: signalId },
      include: {
        Influencer: true,
        User: true,
      },
    });

    if (!signal) {
      throw new Error('Signal not found');
    }

    // Auto-approve ratings without comments (just star ratings)
    if (signal.type === 'RATING' && !signal.comment) {
      await this.approveSignal(signalId, 'Auto-approved: Simple rating without claims');
      return { verified: true, reason: 'Auto-approved: Simple rating' };
    }

    // For DRAMA_REPORT and POSITIVE_ACTION, ALWAYS use AI verification
    if ((signal.type === 'DRAMA_REPORT' || signal.type === 'POSITIVE_ACTION') && signal.comment) {
      // Check for obvious spam first
      const isSpam = this.detectSpam(signal.comment);
      
      if (isSpam) {
        await this.rejectSignal(signalId, 'Rejected: Spam detected');
        return { verified: false, reason: 'Rejected: Spam detected' };
      }

      // Use AI verification for all drama/positive reports
      if (!BLACKBOX_API_KEY) {
        logger.error('AI verification required but API key not configured');
        // Auto-reject if AI is not configured
        await this.rejectSignal(signalId, 'AI verification unavailable - please contact support');
        return { verified: false, reason: 'AI verification unavailable' };
      }

      const verificationPrompt = this.buildVerificationPrompt(signal);

      try {
        logger.info(`🤖 Starting AI verification for signal ${signalId}...`);
        const aiResponse = await this.queryAI(verificationPrompt);
        logger.info(`🤖 AI response received: ${aiResponse.substring(0, 200)}...`);
        
        const result = this.parseAIResponse(aiResponse);
        logger.info(`🤖 AI verdict: ${result.verified ? 'APPROVED' : 'REJECTED'} - ${result.reason}`);

        if (result.verified) {
          await this.approveSignal(signalId, result.reason);
        } else {
          await this.rejectSignal(signalId, result.reason);
        }

        return result;
      } catch (error: any) {
        logger.error('❌ AI verification failed:', error.message);
        // On AI failure, REJECT to be safe (don't auto-approve unverified claims)
        await this.rejectSignal(signalId, 'AI verification failed, please try again or provide more details');
        return { verified: false, reason: 'AI verification failed' };
      }
    }

    // For ratings with comments, auto-approve if not spam
    if (signal.type === 'RATING' && signal.comment) {
      const isSpam = this.detectSpam(signal.comment);
      
      if (isSpam) {
        await this.rejectSignal(signalId, 'Rejected: Spam detected');
        return { verified: false, reason: 'Rejected: Spam detected' };
      }

      await this.approveSignal(signalId, 'Auto-approved: Rating with comment');
      return { verified: true, reason: 'Auto-approved: Rating with comment' };
    }

    // Default: reject if we get here
    await this.rejectSignal(signalId, 'Unable to verify');
    return { verified: false, reason: 'Unable to verify' };
  }

  /**
   * Basic spam detection
   */
  private detectSpam(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /https?:\/\/bit\.ly|tinyurl|shorturl/i, // Suspicious URLs
      /buy now|click here|limited time|act now/i, // Spam phrases
      /\$\$\$|💰💰💰|🔥🔥🔥/i, // Excessive emojis
    ];

    return spamPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Build verification prompt for AI
   */
  private buildVerificationPrompt(signal: any): string {
    const influencerName = signal.Influencer.name;
    const signalType = signal.type;
    const comment = signal.comment || '';
    const rating = signal.rating;

    let prompt = '';

    if (signalType === 'DRAMA_REPORT') {
      prompt = `You are an investigative fact-checker for TrustFluencers, a platform that verifies claims about French influencers.

INFLUENCER: ${influencerName}
USER'S CLAIM: "${comment}"

YOUR TASK:
1. RESEARCH: Search the internet for information about ${influencerName} and this specific claim
2. FACT-CHECK: Look for evidence in news articles, social media, official statements, interviews
3. VERIFY: Determine if this claim is true, false, or unverifiable
4. EDUCATE: Provide context about what you found

SEARCH FOR:
- News articles about ${influencerName} and this incident
- Social media posts or statements
- Official responses or clarifications
- Timeline of events
- Multiple sources to confirm or deny

Respond in JSON format:
{
  "verified": true/false,
  "reason": "What you found in your research (max 200 chars)",
  "confidence": 0-100,
  "sources_checked": "Brief summary of sources you searched"
}

APPROVE if:
- You found credible evidence supporting this claim
- Multiple sources confirm the incident
- The claim is factually accurate

REJECT if:
- No evidence found in any sources
- Claim contradicted by evidence
- Too vague to research
- Spam or hate speech

IMPORTANT: Actually SEARCH and RESEARCH before deciding. Don't just check if it's vague - verify if it's TRUE.

Respond ONLY with valid JSON.`;
    } else if (signalType === 'POSITIVE_ACTION') {
      prompt = `You are an investigative fact-checker for TrustFluencers, a platform that verifies claims about French influencers.

INFLUENCER: ${influencerName}
USER'S CLAIM: "${comment}"

YOUR TASK:
1. RESEARCH: Search the internet for information about ${influencerName} and this positive action
2. FACT-CHECK: Look for evidence in news articles, charity announcements, social media, press releases
3. VERIFY: Determine if this positive action actually happened
4. EDUCATE: Provide context about what you found

SEARCH FOR:
- News articles about ${influencerName} and this positive action
- Charity announcements or press releases
- Social media posts confirming the action
- Official statements or receipts
- Multiple sources to confirm

Respond in JSON format:
{
  "verified": true/false,
  "reason": "What you found in your research (max 200 chars)",
  "confidence": 0-100,
  "sources_checked": "Brief summary of sources you searched"
}

APPROVE if:
- You found credible evidence of this positive action
- Multiple sources confirm it happened
- The claim is factually accurate

REJECT if:
- No evidence found in any sources
- Claim appears to be fake or exaggerated
- Too vague to research
- Spam or fake praise

IMPORTANT: Actually SEARCH and RESEARCH before deciding. Verify if it's TRUE.

Respond ONLY with valid JSON.`;
    } else if (signalType === 'RATING' && comment) {
      prompt = `You are a content moderator for an influencer trust platform. A user rated "${influencerName}" ${rating}/5 stars with this comment:

"${comment}"

Your task:
1. Check if the comment is appropriate (no hate speech, spam, or abuse)
2. Verify it's a genuine opinion, not spam

Respond in JSON format:
{
  "verified": true/false,
  "reason": "Brief explanation (max 100 chars)",
  "confidence": 0-100
}

Approve if:
- It's a genuine opinion or feedback
- It's not hate speech or abuse
- It's not spam

Reject if:
- It contains hate speech, threats, or abuse
- It's obvious spam
- It's completely off-topic

Respond ONLY with valid JSON.`;
    }

    return prompt;
  }

  /**
   * Query AI for verification
   */
  private async queryAI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        BLACKBOX_API_URL,
        {
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'perplexity/sonar-pro', // Use Perplexity Sonar Pro via Blackbox
          max_tokens: 500,
          temperature: 0.1, // Low temperature for factual verification
        },
        {
          headers: {
            'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      return content;
    } catch (error: any) {
      logger.error('Blackbox AI query failed:', error.message);
      throw error;
    }
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): { verified: boolean; reason: string; confidence?: number; sources?: string } {
    try {
      // Extract JSON from response (in case there's extra text or markdown)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Log the full AI response for transparency
      logger.info(`📚 AI Research Summary: ${parsed.sources_checked || 'N/A'}`);
      
      return {
        verified: parsed.verified === true,
        reason: parsed.reason || 'No reason provided',
        confidence: parsed.confidence || 0,
        sources: parsed.sources_checked,
      };
    } catch (error) {
      logger.error('Failed to parse AI response:', error);
      logger.error('Raw response:', response);
      // Default to rejection if we can't parse
      return {
        verified: false,
        reason: 'AI response parsing failed',
      };
    }
  }

  /**
   * Approve a signal
   */
  private async approveSignal(signalId: string, reason: string) {
    await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        status: 'VERIFIED',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: 'AI',
        verificationResult: reason,
      },
    });

    logger.info(`Signal ${signalId} approved: ${reason}`);
  }

  /**
   * Reject a signal
   */
  private async rejectSignal(signalId: string, reason: string) {
    await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        status: 'REJECTED',
        isVerified: false,
        verifiedAt: new Date(),
        verifiedBy: 'AI',
        rejectionReason: reason,
      },
    });

    logger.info(`Signal ${signalId} rejected: ${reason}`);
  }

  /**
   * Get pending signals for verification
   */
  async getPendingSignals(limit: number = 10) {
    const signals = await prisma.communitySignal.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        Influencer: {
          select: {
            id: true,
            name: true,
            niche: true,
          },
        },
        User: {
          select: {
            id: true,
            email: true,
            firstName: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return signals;
  }

  /**
   * Process verification queue
   */
  async processVerificationQueue() {
    const pendingSignals = await this.getPendingSignals(5); // Process 5 at a time

    logger.info(`Processing ${pendingSignals.length} pending signals for verification`);

    const results = [];

    for (const signal of pendingSignals) {
      try {
        const result = await this.verifySignal(signal.id);
        results.push({
          signalId: signal.id,
          userId: signal.userId,
          userEmail: signal.User.email,
          influencerName: signal.Influencer.name,
          type: signal.type,
          ...result,
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        logger.error(`Failed to verify signal ${signal.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Manually approve a signal (admin)
   */
  async manualApprove(signalId: string, adminUserId: string, reason?: string) {
    await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        status: 'VERIFIED',
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        verificationResult: reason || 'Manually approved by admin',
      },
    });

    logger.info(`Signal ${signalId} manually approved by admin ${adminUserId}`);
  }

  /**
   * Manually reject a signal (admin)
   */
  async manualReject(signalId: string, adminUserId: string, reason: string) {
    await prisma.communitySignal.update({
      where: { id: signalId },
      data: {
        status: 'REJECTED',
        isVerified: false,
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        rejectionReason: reason,
      },
    });

    logger.info(`Signal ${signalId} manually rejected by admin ${adminUserId}`);
  }
}

export default new VerificationService();
