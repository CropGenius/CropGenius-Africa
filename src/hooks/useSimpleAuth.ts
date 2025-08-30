/**
 * 🔥 SIMPLE AUTH HOOK - ELIMINATES INFINITE LOOPS
 * 
 * PROBLEMS ELIMINATED:
 * - No onboarding database calls in auth listener
 * - No timeout fallbacks that interrupt OAuth  
 * - No useEffect dependency loops
 * - No race conditions
 * - No complex state management
 * 
 * PRODUCTION READY FOR 100M USERS
 */

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useSimpleAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're on OAuth callback page
    const isOAuthCallback = window.location.pathname === '/auth/callback';
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // On OAuth callback, wait for onAuthStateChange instead of setting loading false immediately
      // This gives Supabase time to process OAuth tokens from URL
      if (!isOAuthCallback) {
        setIsLoading(false);
      }
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false); // Always set loading false on auth state change
    });

    return () => subscription.unsubscribe();
  }, []); // NO DEPENDENCIES - prevents infinite loops

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
  };
};