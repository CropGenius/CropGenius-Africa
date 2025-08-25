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
    console.log('🔄 Refreshing session...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('❌ Error refreshing session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      console.log('✅ Session refreshed:', { hasSession: !!session, userId: session?.user?.id });
    } catch (error) {
      console.error('💥 Failed to refresh session:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth state...');
        
        // 🔄 Wait a moment for any URL processing (important for OAuth callbacks)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
          console.log('✅ Auth state initialized:', { 
            hasSession: !!session, 
            userId: session?.user?.id,
            isOAuth: !!session?.user?.app_metadata?.provider 
          });
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
        console.log('🔄 Auth state change:', event, { 
          hasSession: !!session, 
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          // 🎯 Special handling for OAuth sign-in events
          if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider) {
            console.log('🎉 OAuth sign-in completed successfully!');
          }
        }
      }
    );

    initAuth();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 🚀 PRODUCTION FIXED - EXPLICIT REDIRECT URL FOR CROPGENIUS.AFRICA
  const signInWithGoogle = async () => {
    try {
      console.log('🔑 Starting Google OAuth (Production Fix - Explicit Redirect)...');
      
      // 🎯 CRITICAL FIX: Use explicit redirect URL for production domain
      const redirectURL = window.location.hostname === 'localhost' 
        ? `${window.location.origin}/auth/callback`
        : 'https://cropgenius.africa/auth/callback';
      
      console.log('🔗 Using redirect URL:', redirectURL);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
        throw error;
      }
      
      console.log('✅ OAuth initiated successfully with explicit redirect');
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