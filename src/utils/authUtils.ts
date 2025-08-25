
import { supabase } from '@/integrations/supabase/client';

// 🚀 OFFICIAL SUPABASE OAUTH - NO CUSTOM REDIRECTS!
export const signInWithGoogle = async () => {
  console.log('🔑 Starting OFFICIAL Google OAuth (No Custom Redirects)...');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google'
    // NO redirectTo option - let Supabase use SITE_URL from dashboard!
  });
  
  if (error) {
    console.error('❌ Google OAuth error:', error);
    throw error;
  }
  
  console.log('✅ OAuth initiated - Supabase handling redirect to SITE_URL');
  return data;
};

// 📧 Email/Password Authentication
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  
  if (error) throw error;
  return data;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
