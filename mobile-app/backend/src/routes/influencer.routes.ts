import { Router, Request, Response } from 'express';
import influencerService from '../services/influencer.service';
import scoringService from '../services/scoring.service';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/influencers
 * Get all influencers with optional filters and ranking positions
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const minTrustScore = req.query.minTrustScore 
      ? parseFloat(req.query.minTrustScore as string) 
      : undefined;
    const niche = req.query.niche as string | undefined;
    const limit = req.query.limit 
      ? parseInt(req.query.limit as string, 10) 
      : 50;
    const search = req.query.search as string | undefined;
    
    let influencers = await influencerService.getAllInfluencers(
      minTrustScore,
      niche,
      limit
    );
    
    // Apply search filter if provided
    if (search && search.trim().length > 0) {
      const searchLower = search.trim().toLowerCase();
      influencers = influencers.filter(inf => 
        inf.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Add trust level, color, and ranking position to each influencer
    const enriched = influencers.map((inf, index) => ({
      ...inf,
      rank: index + 1, // Ranking position
      trustLevel: scoringService.getTrustLevel(inf.trustScore),
      trustColor: scoringService.getTrustColor(inf.trustScore),
    }));
    
    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error) {
    logger.error('Error fetching influencers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch influencers',
    });
  }
});

/**
 * GET /api/influencers/:id
 * Get influencer by ID with mentions
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const influencer = await influencerService.getInfluencerById(id);
    
    if (!influencer) {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }
    
    // Add trust level and color, and transform Mention to mentions for backward compatibility
    const enriched = {
      ...influencer,
      mentions: influencer.Mention, // Transform Mention to mentions for backward compatibility
      Mention: undefined, // Remove the capital M version
      trustLevel: scoringService.getTrustLevel(influencer.trustScore),
      trustColor: scoringService.getTrustColor(influencer.trustScore),
    };
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error fetching influencer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch influencer',
    });
  }
});

/**
 * POST /api/influencers/search
 * Search for influencer by name
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { name, forceRefresh } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }
    
    const result = await influencerService.searchInfluencer(
      name.trim(),
      forceRefresh === true
    );
    
    // Add trust level and color, and transform Mention to mentions for backward compatibility
    const enriched = {
      ...result.influencer,
      mentions: result.influencer.Mention, // Transform Mention to mentions for backward compatibility
      Mention: undefined, // Remove the capital M version
      trustLevel: scoringService.getTrustLevel(result.influencer.trustScore),
      trustColor: scoringService.getTrustColor(result.influencer.trustScore),
    };
    
    res.json({
      success: true,
      data: enriched,
      isFromCache: result.isFromCache,
      researchSummary: result.researchSummary,
    });
  } catch (error) {
    logger.error('Error searching influencer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search influencer',
    });
  }
});

/**
 * POST /api/influencers/:id/refresh
 * Refresh influencer data
 */
router.post('/:id/refresh', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const influencer = await influencerService.refreshInfluencer(id);
    
    // Add trust level and color, and transform Mention to mentions for backward compatibility
    const enriched = {
      ...influencer,
      mentions: influencer.Mention, // Transform Mention to mentions for backward compatibility
      Mention: undefined, // Remove the capital M version
      trustLevel: scoringService.getTrustLevel(influencer.trustScore),
      trustColor: scoringService.getTrustColor(influencer.trustScore),
    };
    
    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    logger.error('Error refreshing influencer:', error);
    
    if (error instanceof Error && error.message === 'Influencer not found') {
      return res.status(404).json({
        success: false,
        error: 'Influencer not found',
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to refresh influencer',
    });
  }
});

/**
 * GET /api/influencers/niches/list
 * Get available niches
 */
router.get('/niches/list', async (req: Request, res: Response) => {
  try {
    const niches = await influencerService.getNiches();
    
    res.json({
      success: true,
      data: niches,
    });
  } catch (error) {
    logger.error('Error fetching niches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch niches',
    });
  }
});

export default router;
