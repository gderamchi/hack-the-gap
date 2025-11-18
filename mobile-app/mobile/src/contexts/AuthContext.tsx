// Unified Auth Context - exports Supabase Auth with backward compatibility
export { 
  SupabaseAuthProvider as AuthProvider,
  useSupabaseAuth as useAuth,
  useSupabaseAuth,
  getSupabaseToken as getToken,
} from './SupabaseAuthContext';

// Re-export types
export type { User, Session } from '@supabase/supabase-js';
