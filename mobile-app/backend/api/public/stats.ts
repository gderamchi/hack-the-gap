import { VercelRequest, VercelResponse } from '@vercel/node';
import statsData from '../../public/stats.json';
import influencersData from '../../public/influencers-compact.json';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const top10 = influencersData.slice(0, 10).map((inf, idx) => ({
      ...inf,
      rank: idx + 1,
      trustLevel: getTrustLevel(inf.trustScore),
      trustColor: getTrustColor(inf.trustScore),
    }));
    
    res.status(200).json({
      success: true,
      data: {
        ...statsData,
        topInfluencers: top10,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

function getTrustLevel(score: number): string {
  if (score >= 80) return 'Très fiable';
  if (score >= 60) return 'Fiable';
  return 'Neutre';
}

function getTrustColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#3b82f6';
  return '#f59e0b';
}
