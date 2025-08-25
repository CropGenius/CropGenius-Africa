import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bapqlyvfwxsichlyjxpd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g';

// 🔒 SINGLETON PATTERN - Create a single instance of the Supabase client
// This prevents multiple GoTrueClient instances from being created
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Get or create the Supabase client singleton
const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  console.log('🔑 Creating Supabase client singleton...');
  
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // IMPORTANT: We handle this manually in OAuthCallback.tsx
      flowType: 'pkce',
      debug: true // Enable debug mode to log authentication issues
    }
  });
  
  return supabaseInstance;
};

// Export the singleton instance
export const supabase = getSupabaseClient();

export default supabase;