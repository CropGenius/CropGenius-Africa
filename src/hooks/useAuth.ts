
import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializationRef.current) return;
    initializationRef.current = true;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Step 1: Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        // Step 2: Set up single auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('Auth event:', event, session?.user?.id);
            
            setSession(session);
            setUser(session?.user ?? null);
            
            // Handle onboarding status for authenticated users
            if (session?.user) {
              try {
                const { data } = await supabase
                  .from('profiles')
                  .select('onboarding_completed')
                  .eq('id', session.user.id)
                  .single();
                
                if (mounted) {
                  setOnboardingCompleted(data?.onboarding_completed || false);
                }
              } catch (error) {
                console.log('No profile found, onboarding needed');
                if (mounted) {
                  setOnboardingCompleted(false);
                }
              }
            } else {
              if (mounted) {
                setOnboardingCompleted(false);
              }
            }
            
            if (mounted) {
              setAuthInitialized(true);
              setIsLoading(false);
            }
          }
        );

        // Step 3: Process initial session
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          try {
            const { data } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', initialSession.user.id)
              .single();
            
            if (mounted) {
              setOnboardingCompleted(data?.onboarding_completed || false);
            }
          } catch (error) {
            console.log('No profile found, onboarding needed');
            if (mounted) {
              setOnboardingCompleted(false);
            }
          }
        }

        if (mounted) {
          setAuthInitialized(true);
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    // Initialize auth and set up cleanup
    const cleanup = initializeAuth();
    
    // Cleanup function
    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []); // Empty dependency array - run once only

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
      setOnboardingCompleted(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    session,
    isLoading,
    authInitialized,
    isAuthenticated: !!user && !!session && authInitialized,
    onboardingCompleted,
    signInWithGoogle,
    signOut,
  };
};
