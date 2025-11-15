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

export default api;
