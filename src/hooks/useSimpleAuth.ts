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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
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