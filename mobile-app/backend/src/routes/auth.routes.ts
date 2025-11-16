import { Router, Request, Response } from 'express';
import authService from '../services/auth.service';
import { authMiddleware } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, company } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      company,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 * Requires authentication
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const profile = await authService.getUserProfile(user.userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 * Requires authentication
 */
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const updates = req.body;

    const profile = await authService.updateProfile(user.userId, updates);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
