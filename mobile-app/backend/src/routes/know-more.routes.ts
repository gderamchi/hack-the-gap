import { Router, Request, Response } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

const router = Router();

const BLACKBOX_API_KEY = 'sk-8OyzCHGCmjs5uft_9NNl1w';
const BLACKBOX_API_URL = 'https://api.blackbox.ai/v1/chat/completions';
const MODEL = 'blackboxai/perplexity/sonar-pro';

/**
 * POST /api/influencers/know-more
 * Get detailed information about an influencer
 */
router.post('/know-more', async (req: Request, res: Response) => {
  try {
    const { name, niche } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required',
      });
    }
    
    logger.info(`Fetching detailed info for: ${name}`);
    
    const response = await axios.post(
      BLACKBOX_API_URL,
      {
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide detailed, factual information in markdown format. Be comprehensive but concise.'
          },
          {
            role: 'user',
            content: `Research French influencer "${name}" (${niche || 'General'}). Provide a detailed report with these sections:

## Recent Activity (2024-2025)
What has ${name} been doing recently? Latest projects, collaborations, announcements.

## Major Controversies & Dramas
List any significant controversies, scandals, or dramas involving ${name}. Be factual and cite what happened.

## Positive Actions & Contributions
What good things has ${name} done? Charity work, positive initiatives, community contributions.

## Reputation & Public Perception
How is ${name} perceived by the public and community? Overall reputation.

Format in markdown with headers (##), bullet points (-), and bold (**) for emphasis. Be detailed but factual.`
          }
        ],
        stream: false,
        webSearch: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000,
      }
    );
    
    let content = response.data.choices?.[0]?.message?.content || 'No information available.';
    
    // Remove citation numbers [1], [2], [10], etc.
    content = content.replace(/\[\d+\]/g, '');
    
    // Clean up extra whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    res.json({
      success: true,
      content,
    });
    
  } catch (error: any) {
    logger.error('Error fetching know more:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch information',
    });
  }
});

export default router;
