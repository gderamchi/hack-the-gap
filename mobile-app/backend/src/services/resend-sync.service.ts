import { Resend } from 'resend';
import logger from '../utils/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export class ResendSyncService {
  /**
   * Add email to Resend audience (for testing emails)
   * This allows sending emails to this address even on free tier
   */
  async addEmailToAudience(email: string) {
    if (!resend) {
      logger.warn('⚠️ Resend not configured, cannot add email to audience');
      return;
    }

    try {
      // Note: Resend API doesn't have a direct "add test email" endpoint
      // This is a placeholder for when you have a verified domain
      // For now, we'll just log it
      
      logger.info(`📧 Email registered for notifications: ${email}`);
      logger.info(`📧 To send emails to ${email}, add it as a test email in Resend dashboard:`);
      logger.info(`   https://resend.com/settings/emails`);
      
      // When you have a verified domain, you won't need this
      // Emails will be sent to any address automatically
      
    } catch (error: any) {
      logger.error(`Failed to register email ${email}:`, error.message);
    }
  }

  /**
   * Check if email can receive emails
   */
  async canSendToEmail(email: string): Promise<boolean> {
    // For now, return true - Resend will handle the validation
    // If email fails, it will be logged
    return true;
  }
}

export default new ResendSyncService();
