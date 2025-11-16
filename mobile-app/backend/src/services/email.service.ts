import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export class EmailService {
  /**
   * Send verification result email
   */
  async sendVerificationResult(
    userEmail: string,
    influencerName: string,
    signalType: string,
    verified: boolean,
    reason: string
  ) {
    const subject = verified
      ? `✅ Your ${this.getSignalTypeLabel(signalType)} was approved`
      : `❌ Your ${this.getSignalTypeLabel(signalType)} was not approved`;

    const body = verified
      ? this.buildApprovalEmail(influencerName, signalType, reason)
      : this.buildRejectionEmail(influencerName, signalType, reason);

    await this.sendEmail(userEmail, subject, body);
  }

  /**
   * Build approval email
   */
  private buildApprovalEmail(influencerName: string, signalType: string, reason: string): string {
    return `
Hello!

Great news! Your ${this.getSignalTypeLabel(signalType)} for ${influencerName} has been verified and published.

Verification: ${reason}

Your contribution helps the community make informed decisions about influencers. Thank you for participating!

${signalType === 'RATING' ? 'You earned +5 XP!' : 'You earned +10 XP!'}

View the influencer profile: [Link to app]

Best regards,
The TrustFluencers Team
    `.trim();
  }

  /**
   * Build rejection email
   */
  private buildRejectionEmail(influencerName: string, signalType: string, reason: string): string {
    return `
Hello!

Thank you for your submission regarding ${influencerName}.

Unfortunately, your ${this.getSignalTypeLabel(signalType)} could not be verified at this time.

Reason: ${reason}

What you can do:
- Provide more specific details
- Include sources or evidence
- Ensure your report is factual and verifiable

You can submit a new report with more information.

Best regards,
The TrustFluencers Team
    `.trim();
  }

  /**
   * Send email using Resend
   */
  private async sendEmail(to: string, subject: string, body: string) {
    // Always log the email with clear formatting
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL NOTIFICATION');
    console.log('='.repeat(80));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(80));
    console.log(body);
    console.log('='.repeat(80) + '\n');

    if (!EMAIL_ENABLED) {
      logger.info(`⚠️ EMAIL_ENABLED=false - Email not sent`);
      return;
    }

    if (!resend) {
      logger.warn(`⚠️ Resend not configured - Email not sent`);
      return;
    }

    try {
      // Send real email via Resend to the actual user
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: to, // Send to actual user email
        subject: subject,
        text: body,
      });

      if (error) {
        logger.error(`❌ Failed to send email to ${to}:`, error);
        logger.warn(`⚠️ Note: Resend free tier only sends to verified emails. To send to all users, verify a domain at resend.com/domains`);
        return;
      }

      logger.info(`✅ REAL EMAIL SENT to ${to} (ID: ${data?.id})`);
      logger.info(`📧 User should check their inbox at ${to}!`);
    } catch (error: any) {
      logger.error(`❌ Email sending failed to ${to}:`, error.message);
      logger.warn(`⚠️ If using Resend free tier, you can only send to your verified email. Verify a domain to send to all users.`);
    }
  }

  /**
   * Send batch verification results
   */
  async sendBatchVerificationResults(results: any[]) {
    for (const result of results) {
      try {
        await this.sendVerificationResult(
          result.userEmail,
          result.influencerName,
          result.type,
          result.verified,
          result.reason
        );

        // Mark email as sent
        await prisma.communitySignal.update({
          where: { id: result.signalId },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });
      } catch (error: any) {
        logger.error(`Failed to send email for signal ${result.signalId}:`, error);
      }
    }

    logger.info(`Sent ${results.length} verification emails`);
  }

  /**
   * Get signal type label
   */
  private getSignalTypeLabel(type: string): string {
    switch (type) {
      case 'RATING': return 'rating';
      case 'DRAMA_REPORT': return 'drama report';
      case 'POSITIVE_ACTION': return 'positive action report';
      case 'COMMENT': return 'comment';
      default: return 'submission';
    }
  }
}

export default new EmailService();
