import { VercelRequest, VercelResponse } from '@vercel/node';
import influencersData from '../../public/influencers-compact.json';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const { limit = '50', page = '1', minTrustScore, search } = req.query;
    
    let filtered = [...influencersData];
    
    // Filter by trust score
    if (minTrustScore) {
      const minScore = parseFloat(minTrustScore as string);
      filtered = filtered.filter(inf => inf.trustScore >= minScore);
    }
    
    // Search by name
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(inf => 
        inf.name.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    const limitNum = Math.min(parseInt(limit as string), 100);
    const pageNum = parseInt(page as string);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    
    const paginated = filtered.slice(start, end);
    
    // Add rank
    const withRank = paginated.map((inf, idx) => ({
      ...inf,
      rank: start + idx + 1,
      trustLevel: getTrustLevel(inf.trustScore),
      trustColor: getTrustColor(inf.trustScore),
    }));
    
    res.status(200).json({
      success: true,
      data: withRank,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum),
        hasMore: end < filtered.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch influencers',
    });
  }
}

function getTrustLevel(score: number): string {
  if (score >= 80) return 'Très fiable';
  if (score >= 60) return 'Fiable';
  if (score >= 40) return 'Neutre';
  if (score >= 20) return 'Peu fiable';
  return 'Non fiable';
}

function getTrustColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#ef4444';
  return '#dc2626';
}
