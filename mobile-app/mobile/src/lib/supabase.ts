import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase project credentials
const SUPABASE_URL = 'https://ffvgvjymkiaiasfrhqih.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdmd2anlta2lhaWFzZnJocWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjc4MzYsImV4cCI6MjA3ODgwMzgzNn0.XGvMtqMXozWP2r6MIHX9Tok9LUScPk2cuGVV16_f5aY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface CommunityRating {
  id: string;
  user_id: string;
  influencer_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}
