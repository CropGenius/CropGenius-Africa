
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const checkOnboardingStatus = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();
      
      setOnboardingCompleted(data?.onboarding_completed || false);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setOnboardingCompleted(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkOnboardingStatus(session.user.id);
        } else {
          setOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [checkOnboardingStatus]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast.error('Google authentication failed');
      }
    } catch (error) {
      toast.error('Authentication service unavailable');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setOnboardingCompleted(false);
    } catch (error) {
      console.error('Sign out error:', error);
      setSession(null);
      setUser(null);
      setOnboardingCompleted(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    onboardingCompleted,
    signInWithGoogle,
    signOut,
  };
};
