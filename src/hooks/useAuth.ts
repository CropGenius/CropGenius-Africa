
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Check onboarding ONLY if user exists
      if (session?.user) {
        supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setOnboardingCompleted(data?.onboarding_completed || false);
            setIsLoading(false);
          })
          .catch(() => {
            setOnboardingCompleted(false);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes - NO NESTED CALLS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Defer onboarding check to prevent race condition
          setTimeout(() => {
            supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single()
              .then(({ data }) => {
                setOnboardingCompleted(data?.onboarding_completed || false);
              })
              .catch(() => setOnboardingCompleted(false));
          }, 100);
        } else {
          setOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session?.user,
    onboardingCompleted,
    signInWithGoogle,
    signOut,
  };
};
