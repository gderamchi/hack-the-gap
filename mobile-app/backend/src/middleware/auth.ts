import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import userSyncService from '../services/user-sync.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

// Create Supabase client for token validation
const supabase = SUPABASE_URL && SUPABASE_JWT_SECRET
  ? createClient(SUPABASE_URL, SUPABASE_JWT_SECRET)
  : null;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication middleware - requires valid JWT token
 * Supports both Supabase tokens and custom JWT tokens
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);

    // Try Supabase token first
    if (supabase && SUPABASE_JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
        
        // Sync user to local database (creates if doesn't exist)
        await userSyncService.getOrCreateUser(
          decoded.sub,
          decoded.email,
          decoded.user_metadata
        );
        
        // Supabase token structure
        (req as any).user = {
          userId: decoded.sub, // Supabase uses 'sub' for user ID
          email: decoded.email,
          role: decoded.user_metadata?.role || 'COMMUNITY',
        };
        
        return next();
      } catch (supabaseError) {
        // Not a Supabase token, try custom JWT
      }
    }

    // Try custom JWT token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      (req as any).user = decoded;
      return next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Try Supabase token first
      if (supabase && SUPABASE_JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
          
          // Sync user to local database
          await userSyncService.getOrCreateUser(
            decoded.sub,
            decoded.email,
            decoded.user_metadata
          );
          
          (req as any).user = {
            userId: decoded.sub,
            email: decoded.email,
            role: decoded.user_metadata?.role || 'COMMUNITY',
          };
          return next();
        } catch (supabaseError) {
          // Not a Supabase token, try custom JWT
        }
      }

      // Try custom JWT
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        (req as any).user = decoded;
      } catch (error) {
        // Ignore errors for optional auth
      }
    }

    next();
  } catch (error) {
    // Ignore errors, just continue without user
    next();
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};
