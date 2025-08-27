
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check onboarding status
        supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setOnboardingCompleted(data?.onboarding_completed || false);
          })
          .catch(() => setOnboardingCompleted(false));
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              setOnboardingCompleted(data?.onboarding_completed || false);
            })
            .catch(() => setOnboardingCompleted(false));
        } else {
          setOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Force localhost in development to bypass DNS redirects
      const redirectUrl = import.meta.env.DEV 
        ? 'http://localhost:8081/auth/callback'
        : `${window.location.origin}/auth/callback`;
        
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        toast.error('Google authentication failed');
      }
    } catch (error) {
      toast.error('Authentication service unavailable');
    }
  };

  const signOut = async () => {
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
  };

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
