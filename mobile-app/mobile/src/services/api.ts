import axios from 'axios';
import Constants from 'expo-constants';
import { Influencer, InfluencerWithMentions, ApiResponse } from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds for Perplexity queries
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(async (config) => {
  try {
    const { getSupabaseToken } = await import('../contexts/SupabaseAuthContext');
    const token = await getSupabaseToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Token not available, continue without auth
  }
  return config;
});

export const influencerApi = {
  /**
   * Get all influencers with optional filters
   */
  getAll: async (params?: {
    minTrustScore?: number;
    niche?: string;
    limit?: number;
    search?: string;
  }): Promise<Influencer[]> => {
    const response = await api.get<ApiResponse<Influencer[]>>('/influencers', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch influencers');
    }
    return response.data.data;
  },

  /**
   * Get influencer by ID
   */
  getById: async (id: string): Promise<InfluencerWithMentions> => {
    const response = await api.get<ApiResponse<InfluencerWithMentions>>(`/influencers/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch influencer');
    }
    return response.data.data;
  },

  /**
   * Search for influencer by name
   */
  search: async (name: string, forceRefresh: boolean = false): Promise<{
    influencer: InfluencerWithMentions;
    isFromCache: boolean;
    researchSummary?: any;
  }> => {
    const response = await api.post<ApiResponse<InfluencerWithMentions>>('/influencers/search', {
      name,
      forceRefresh,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to search influencer');
    }
    return {
      influencer: response.data.data,
      isFromCache: response.data.isFromCache || false,
      researchSummary: response.data.researchSummary,
    };
  },

  /**
   * Refresh influencer data
   */
  refresh: async (id: string): Promise<InfluencerWithMentions> => {
    const response = await api.post<ApiResponse<InfluencerWithMentions>>(`/influencers/${id}/refresh`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to refresh influencer');
    }
    return response.data.data;
  },

  /**
   * Get available niches
   */
  getNiches: async (): Promise<string[]> => {
    const response = await api.get<ApiResponse<string[]>>('/influencers/niches/list');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch niches');
    }
    return response.data.data;
  },
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/register', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Registration failed');
    }
    return response.data.data;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/login', { email, password });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Login failed');
    }
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ user: any; accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Token refresh failed');
    }
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<any> => {
    const response = await api.get('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch profile');
    }
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates: any): Promise<any> => {
    const response = await api.put('/auth/profile', updates);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update profile');
    }
    return response.data.data;
  },
};

// ============================================
// COMMUNITY API
// ============================================

export const communityApi = {
  /**
   * Create a community signal (rating, report, comment)
   */
  createSignal: async (data: {
    influencerId: string;
    type: 'RATING' | 'DRAMA_REPORT' | 'POSITIVE_ACTION' | 'COMMENT';
    rating?: number;
    comment?: string;
    tags?: string[];
  }): Promise<any> => {
    const response = await api.post('/community/signals', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create signal');
    }
    return response.data.data;
  },

  /**
   * Get signals for an influencer
   */
  getSignals: async (influencerId: string, options?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> => {
    const response = await api.get(`/community/signals/${influencerId}`, { params: options });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch signals');
    }
    return response.data.data;
  },

  /**
   * Get current user's signals
   */
  getMySignals: async (options?: {
    influencerId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> => {
    const response = await api.get('/community/my-signals', { params: options });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch signals');
    }
    return response.data.data;
  },

  /**
   * Get user's specific signal for an influencer
   */
  getMySignal: async (influencerId: string, type: string): Promise<any> => {
    const response = await api.get(`/community/my-signal/${influencerId}/${type}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch signal');
    }
    return response.data.data;
  },

  /**
   * Delete a signal
   */
  deleteSignal: async (signalId: string): Promise<void> => {
    const response = await api.delete(`/community/signals/${signalId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete signal');
    }
  },

  /**
   * Get community trust score for an influencer
   */
  getTrustScore: async (influencerId: string): Promise<any> => {
    const response = await api.get(`/community/trust-score/${influencerId}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch trust score');
    }
    return response.data.data;
  },

  /**
   * Get community statistics for an influencer
   */
  getStats: async (influencerId: string): Promise<any> => {
    const response = await api.get(`/community/stats/${influencerId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch stats');
    }
    return response.data.data;
  },

  /**
   * Get current user's activity summary
   */
  getMyActivity: async (): Promise<any> => {
    const response = await api.get('/community/my-activity');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch activity');
    }
    return response.data.data;
  },
};

// ============================================
// TRANSPARENCY API
// ============================================

export const transparencyApi = {
  /**
   * Get score breakdown for an influencer
   */
  getScoreBreakdown: async (influencerId: string): Promise<any> => {
    const response = await api.get(`/transparency/breakdown/${influencerId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch score breakdown');
    }
    return response.data.data;
  },

  /**
   * Get event timeline for an influencer
   */
  getTimeline: async (influencerId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<any[]> => {
    const params: any = {};
    if (options?.startDate) params.startDate = options.startDate.toISOString();
    if (options?.endDate) params.endDate = options.endDate.toISOString();
    if (options?.limit) params.limit = options.limit;

    const response = await api.get(`/transparency/timeline/${influencerId}`, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch timeline');
    }
    return response.data.data;
  },

  /**
   * Create a claim request
   */
  createClaimRequest: async (data: {
    influencerId: string;
    proofType?: string;
    proofUrl?: string;
    proofText?: string;
  }): Promise<any> => {
    const response = await api.post('/transparency/claim', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create claim request');
    }
    return response.data.data;
  },

  /**
   * Get user's claim requests
   */
  getMyClaims: async (): Promise<any[]> => {
    const response = await api.get('/transparency/my-claims');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch claims');
    }
    return response.data.data;
  },

  /**
   * Get user's claimed influencers
   */
  getMyInfluencers: async (): Promise<any[]> => {
    const response = await api.get('/transparency/my-influencers');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch influencers');
    }
    return response.data.data;
  },

  /**
   * Create an influencer response
   */
  createResponse: async (data: {
    influencerId: string;
    mentionId?: string;
    signalId?: string;
    responseType: string;
    responseText: string;
    evidenceUrls?: string[];
  }): Promise<any> => {
    const response = await api.post('/transparency/response', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create response');
    }
    return response.data.data;
  },

  /**
   * Get responses for an event
   */
  getResponses: async (options: {
    mentionId?: string;
    signalId?: string;
    influencerId?: string;
  }): Promise<any[]> => {
    const response = await api.get('/transparency/responses', { params: options });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch responses');
    }
    return response.data.data;
  },

  /**
   * Vote on a response
   */
  voteOnResponse: async (responseId: string, isHelpful: boolean): Promise<any> => {
    const response = await api.post(`/transparency/responses/${responseId}/vote`, { isHelpful });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to vote');
    }
    return response.data.data;
  },

  /**
   * Create a review request
   */
  createReviewRequest: async (data: {
    influencerId: string;
    mentionId?: string;
    signalId?: string;
    requestType: string;
    reason: string;
    evidence?: any;
  }): Promise<any> => {
    const response = await api.post('/transparency/review-request', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create review request');
    }
    return response.data.data;
  },

  /**
   * Get user's review requests
   */
  getMyReviewRequests: async (): Promise<any[]> => {
    const response = await api.get('/transparency/my-review-requests');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch review requests');
    }
    return response.data.data;
  },
};

// ============================================
// ENGAGEMENT & GAMIFICATION API
// ============================================

export const engagementApi = {
  /**
   * Get top rated influencers leaderboard
   */
  getTopRated: async (limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/top-rated', {
      params: { limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch top rated');
    }
    return response.data.data;
  },

  /**
   * Get most improved influencers leaderboard
   */
  getMostImproved: async (period?: string, limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/most-improved', {
      params: { period, limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch most improved');
    }
    return response.data.data;
  },

  /**
   * Get highest risk influencers leaderboard
   */
  getHighestRisk: async (period?: string, limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/highest-risk', {
      params: { period, limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch highest risk');
    }
    return response.data.data;
  },

  /**
   * Get trending influencers leaderboard
   */
  getTrending: async (limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/trending', {
      params: { limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch trending');
    }
    return response.data.data;
  },

  /**
   * Get most active users leaderboard
   */
  getActiveUsers: async (period?: string, limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/active-users', {
      params: { period, limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch active users');
    }
    return response.data.data;
  },

  /**
   * Get current user's stats
   */
  getMyStats: async (): Promise<any> => {
    const response = await api.get('/engagement/my-stats');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch stats');
    }
    return response.data.data;
  },

  /**
   * Get current user's achievements
   */
  getMyAchievements: async (): Promise<any[]> => {
    const response = await api.get('/engagement/my-achievements');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch achievements');
    }
    return response.data.data;
  },

  /**
   * Get top users by level/XP
   */
  getTopUsers: async (limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/top-users', {
      params: { limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch top users');
    }
    return response.data.data;
  },

  /**
   * Get top contributors (most accepted reports)
   */
  getTopContributors: async (period?: string, limit?: number): Promise<any[]> => {
    const response = await api.get('/engagement/leaderboard/top-contributors', {
      params: { period, limit },
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch top contributors');
    }
    return response.data.data;
  },

  /**
   * Get current user's subscription info
   */
  getMySubscription: async (): Promise<any> => {
    const response = await api.get('/engagement/my-subscription');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch subscription');
    }
    return response.data.data;
  },

  /**
   * Get subscription pricing
   */
  getPricing: async (): Promise<any> => {
    const response = await api.get('/engagement/pricing');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch pricing');
    }
    return response.data.data;
  },
};

export default api;
