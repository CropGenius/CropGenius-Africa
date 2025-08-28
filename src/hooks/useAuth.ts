
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
    // Timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Auth timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout

    // SINGLE auth state listener - eliminates race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check onboarding ONLY when we have a valid session
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();
            
            setOnboardingCompleted(data?.onboarding_completed || false);
          } catch (error) {
            console.log('No profile found, onboarding needed');
            setOnboardingCompleted(false);
          }
        } else {
          setOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Set session and user immediately
        setSession(session);
        setUser(session.user);
        
        // Check onboarding status
        try {
          const { data } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();
          
          setOnboardingCompleted(data?.onboarding_completed || false);
        } catch (error) {
          console.log('No profile found, onboarding needed');
          setOnboardingCompleted(false);
        }
      }
      
      // Always set loading to false after initial check
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array to run only once

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Google auth error:', error);
        toast.error('Google authentication failed');
      }
    } catch (error) {
      console.error('Auth service error:', error);
      toast.error('Authentication service unavailable');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
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
