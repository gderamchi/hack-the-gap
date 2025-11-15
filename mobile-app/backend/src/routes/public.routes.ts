import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import scoringService from '../services/scoring.service';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * PUBLIC API ROUTES
 * No authentication required - for website and public access
 */

/**
 * GET /api/public/influencers
 * Get all influencers with pagination and filters
 * Query params:
 *   - page: number (default: 1)
 *   - limit: number (default: 50, max: 100)
 *   - minTrustScore: number (0-100)
 *   - maxTrustScore: number (0-100)
 *   - niche: string
 *   - search: string
 *   - sortBy: 'trustScore' | 'name' | 'createdAt' (default: 'trustScore')
 *   - sortOrder: 'asc' | 'desc' (default: 'desc')
 */
router.get('/influencers', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;
    
    const minTrustScore = req.query.minTrustScore 
      ? parseFloat(req.query.minTrustScore as string) 
      : undefined;
    const maxTrustScore = req.query.maxTrustScore 
      ? parseFloat(req.query.maxTrustScore as string) 
      : undefined;
    const niche = req.query.niche as string | undefined;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'trustScore';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (minTrustScore !== undefined || maxTrustScore !== undefined) {
      where.trustScore = {};
      if (minTrustScore !== undefined) where.trustScore.gte = minTrustScore;
      if (maxTrustScore !== undefined) where.trustScore.lte = maxTrustScore;
    }
    
    if (niche) {
      where.niche = niche;
    }
    
    if (search && search.trim().length > 0) {
      where.name = {
        contains: search.trim(),
        mode: 'insensitive',
      };
    }
    
    // Get total count for pagination
    const total = await prisma.influencer.count({ where });
    
    // Get influencers
    const influencers = await prisma.influencer.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
        dramaCount: true,
        goodActionCount: true,
        neutralCount: true,
        avgSentiment: true,
        lastUpdated: true,
        createdAt: true,
        socialHandles: true,
      },
    });
    
    // Add computed fields
    const enriched = influencers.map((inf, index) => ({
      ...inf,
      rank: skip + index + 1,
      trustLevel: scoringService.getTrustLevel(inf.trustScore),
      trustColor: scoringService.getTrustColor(inf.trustScore),
    }));
    
    res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    logger.error('Error fetching public influencers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch influencers',
    });
  }
});

/**
 * GET /api/public/influencers/:id
 * Get single influencer by ID with full details
 */
router.get('/influencers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const influencer = await prisma.influencer.findUnique({
      where: { id },
      include: {
        mentions: {
          orderBy: { scrapedAt: 'desc' },
          take: 50,
          select: {
            id: true,
            source: true,
            sourceUrl: true,
            textExcerpt: true,
            sentimentScore: true,
            label: true,
            scrapedAt: true,
          },
        },
      },
    });
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }
    
    // Add computed fields
    const enriched = {
      ...influencer,
      trustLevel: scoringService.getTrustLevel(influencer.trustScore),
      trustColor: scoringService.getTrustColor(influencer.trustScore),
    };
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error fetching public influencer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch influencer',
    });
  }
});

/**
 * GET /api/public/influencers/slug/:name
 * Get influencer by name (URL-friendly)
 */
router.get('/influencers/slug/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);
    
    const influencer = await prisma.influencer.findFirst({
      where: {
        name: {
          equals: decodedName,
          mode: 'insensitive',
        },
      },
      include: {
        mentions: {
          orderBy: { scrapedAt: 'desc' },
          take: 50,
        },
      },
    });
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }
    
    const enriched = {
      ...influencer,
      trustLevel: scoringService.getTrustLevel(influencer.trustScore),
      trustColor: scoringService.getTrustColor(influencer.trustScore),
    };
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error fetching influencer by name:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch influencer',
    });
  }
});

/**
 * GET /api/public/stats
 * Get platform statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalInfluencers = await prisma.influencer.count();
    
    const avgTrustScore = await prisma.influencer.aggregate({
      _avg: { trustScore: true },
    });
    
    const topInfluencers = await prisma.influencer.findMany({
      orderBy: { trustScore: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
      },
    });
    
    const categoryDistribution = await prisma.influencer.groupBy({
      by: ['niche'],
      _count: { niche: true },
      orderBy: { _count: { niche: 'desc' } },
    });
    
    const trustScoreDistribution = {
      excellent: await prisma.influencer.count({ where: { trustScore: { gte: 80 } } }),
      good: await prisma.influencer.count({ where: { trustScore: { gte: 60, lt: 80 } } }),
      neutral: await prisma.influencer.count({ where: { trustScore: { gte: 40, lt: 60 } } }),
      poor: await prisma.influencer.count({ where: { trustScore: { gte: 20, lt: 40 } } }),
      bad: await prisma.influencer.count({ where: { trustScore: { lt: 20 } } }),
    };
    
    res.json({
      success: true,
      data: {
        totalInfluencers,
        avgTrustScore: avgTrustScore._avg.trustScore || 0,
        topInfluencers: topInfluencers.map((inf, index) => ({
          ...inf,
          rank: index + 1,
          trustLevel: scoringService.getTrustLevel(inf.trustScore),
          trustColor: scoringService.getTrustColor(inf.trustScore),
        })),
        categoryDistribution: categoryDistribution.map(cat => ({
          niche: cat.niche,
          count: cat._count.niche,
        })),
        trustScoreDistribution,
      },
    });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

/**
 * GET /api/public/niches
 * Get all available niches/categories
 */
router.get('/niches', async (req: Request, res: Response) => {
  try {
    const niches = await prisma.influencer.groupBy({
      by: ['niche'],
      _count: { niche: true },
      orderBy: { _count: { niche: 'desc' } },
    });
    
    res.json({
      success: true,
      data: niches
        .filter(n => n.niche)
        .map(n => ({
          name: n.niche,
          count: n._count.niche,
        })),
    });
  } catch (error) {
    logger.error('Error fetching niches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch niches',
    });
  }
});

/**
 * GET /api/public/search
 * Search influencers by name (autocomplete-friendly)
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    const influencers = await prisma.influencer.findMany({
      where: {
        name: {
          contains: query.trim(),
          mode: 'insensitive',
        },
      },
      orderBy: { trustScore: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
      },
    });
    
    const enriched = influencers.map(inf => ({
      ...inf,
      trustLevel: scoringService.getTrustLevel(inf.trustScore),
      trustColor: scoringService.getTrustColor(inf.trustScore),
    }));
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error searching influencers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search influencers',
    });
  }
});

/**
 * GET /api/public/trending
 * Get trending/recently updated influencers
 */
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    
    const influencers = await prisma.influencer.findMany({
      orderBy: { lastUpdated: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        niche: true,
        trustScore: true,
        lastUpdated: true,
      },
    });
    
    const enriched = influencers.map((inf, index) => ({
      ...inf,
      rank: index + 1,
      trustLevel: scoringService.getTrustLevel(inf.trustScore),
      trustColor: scoringService.getTrustColor(inf.trustScore),
    }));
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error fetching trending:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending influencers',
    });
  }
});

export default router;
