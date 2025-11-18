export interface Influencer {
  id: string;
  name: string;
  imageUrl?: string;
  summary?: string;
  socialHandles?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  niche?: string;
  trustScore: number;
  dramaCount: number;
  goodActionCount: number;
  neutralCount: number;
  avgSentiment: number;
  language: string;
  lastUpdated: string;
  createdAt: string;
  isClaimed?: boolean;
  claimedBy?: string;
  claimedAt?: string;
  verificationStatus?: string;
  trustLevel?: string;
  trustColor?: string;
  rank?: number; // Ranking position
}

export interface Mention {
  id: string;
  influencerId: string;
  source: string;
  sourceUrl: string;
  textExcerpt: string;
  sentimentScore: number;
  label: 'drama' | 'good_action' | 'neutral';
  scrapedAt: string;
}

export interface InfluencerWithMentions extends Influencer {
  mentions: Mention[];
  Mention?: Mention[]; // For Prisma compatibility
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  isFromCache?: boolean;
  researchSummary?: {
    totalQueries: number;
    successfulQueries: number;
    errors: string[];
  };
}

export type RootStackParamList = {
  Ranking: undefined;
  Detail: { influencerId: string };
  Search: undefined;
  Leaderboard: undefined;
  UserProfile: { userId: string };
  Achievements: undefined;
  Login: undefined;
  Signup: undefined;
  Profile: undefined;
};
