import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import resendSyncService from './resend-sync.service';

const prisma = new PrismaClient();

export class UserSyncService {
  /**
   * Sync Supabase user to local database
   * Creates user if doesn't exist, updates if exists
   */
  async syncUser(supabaseUser: {
    userId: string;
    email: string;
    role?: string;
    firstName?: string;
    lastName?: string;
  }) {
    try {
      // Check if user exists by ID or email
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: supabaseUser.userId },
            { email: supabaseUser.email },
          ],
        },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            id: supabaseUser.userId,
            email: supabaseUser.email,
            passwordHash: 'supabase-managed', // Password managed by Supabase
            role: supabaseUser.role || 'COMMUNITY',
            firstName: supabaseUser.firstName,
            lastName: supabaseUser.lastName,
            status: 'ACTIVE',
            emailVerified: true, // Supabase handles verification
          },
        });

        logger.info(`Synced new user from Supabase: ${user.email}`);
        
        // Register email with Resend for notifications
        await resendSyncService.addEmailToAudience(user.email);
      } else {
        // Update existing user (in case ID changed or data updated)
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: supabaseUser.email,
            firstName: supabaseUser.firstName || user.firstName,
            lastName: supabaseUser.lastName || user.lastName,
            lastLoginAt: new Date(),
          },
        });

        logger.info(`Updated user from Supabase: ${user.email}`);
      }

      return user;
    } catch (error: any) {
      logger.error('Error syncing user:', error);
      // Don't throw error, just log it and continue
      // Return a minimal user object to allow request to proceed
      return null;
    }
  }

  /**
   * Get or create user from Supabase token
   */
  async getOrCreateUser(userId: string, email: string, metadata?: any) {
    return this.syncUser({
      userId,
      email,
      role: metadata?.role,
      firstName: metadata?.firstName,
      lastName: metadata?.lastName,
    });
  }
}

export default new UserSyncService();
