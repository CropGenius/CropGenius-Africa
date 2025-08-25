import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
          console.log('✅ Auth state initialized:', { hasSession: !!session, userId: session?.user?.id });
        }
      } catch (error) {
        console.error('💥 Failed to initialize auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, { hasSession: !!session, userId: session?.user?.id });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    initAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🚀 OFFICIAL SUPABASE OAUTH - SIMPLE AND PRODUCTION READY
  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Starting Google OAuth (Official Supabase Method)...');
      
      // OFFICIAL METHOD - Let Supabase handle everything!
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      });
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
        throw error;
      }
      
      console.log('✅ OAuth initiated successfully');
      return data;
    } catch (error) {
      console.error('💥 Google OAuth failed:', error);
      throw error;
    }
  };

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    isInitialized: true,
    signInWithGoogle,
    signOut,
    refreshSession,
  };
};

export default useAuth;