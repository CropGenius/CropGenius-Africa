import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * 🔒 FAIL-FAST ENVIRONMENT VALIDATION
 * Ensures all required environment variables are present before creating Supabase client
 */
function requireEnv(key: string): string {
  // Check multiple environment variable formats for compatibility
  const value = import.meta.env[key] || 
                import.meta.env[`VITE_${key}`] || 
                import.meta.env[`NEXT_PUBLIC_${key}`];
  
  if (!value || value === 'undefined' || value === '') {
    throw new Error(`❌ MISSING ENVIRONMENT VARIABLE: ${key}\n\n` +
      `Expected one of:\n` +
      `- ${key}\n` +
      `- VITE_${key}\n` +
      `- NEXT_PUBLIC_${key}\n\n` +
      `Check your .envs/ directory configuration!`);
  }
  
  return value;
}

// Validate required Supabase environment variables
const supabaseUrl = requireEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = requireEnv('VITE_SUPABASE_ANON_KEY');

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(`❌ INVALID SUPABASE URL: ${supabaseUrl}\n` +
    `Expected format: https://your-project.supabase.co`);
}

// Validate API key format
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error(`❌ INVALID SUPABASE ANON KEY: Invalid JWT format\n` +
    `Expected: JWT starting with 'eyJ'`);
}


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,   // Enable session detection from URL for proper OAuth handling
    flowType: 'pkce'  // Ensure PKCE flow for security
  }
});

export default supabase;