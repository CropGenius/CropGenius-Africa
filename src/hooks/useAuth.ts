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
    }, 15000); // Increased timeout to 15 seconds to accommodate network delays

    // SINGLE auth state listener - eliminates race conditions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check onboarding ONLY when we have a valid session
        if (session?.user) {
          // Try to get profile with retry logic
          let retries = 0;
          const maxRetries = 5; // Increased retries
          
          while (retries <= maxRetries) {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.log(`Profile lookup attempt ${retries + 1} failed:`, error.message);
                if (retries < maxRetries) {
                  // Wait before retry with exponential backoff
                  await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
                  retries++;
                  continue;
                }
              }
              
              // Even if there's an error on the last retry, we still need to set a value
              setOnboardingCompleted(data?.onboarding_completed || false);
              console.log('Profile lookup result:', data?.onboarding_completed || false);
              break;
            } catch (error) {
              console.log(`Profile lookup exception attempt ${retries + 1}:`, error);
              if (retries >= maxRetries) {
                console.log('No profile found after all retries, onboarding needed');
                setOnboardingCompleted(false);
                break;
              }
              
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
              retries++;
            }
          }
        } else {
          setOnboardingCompleted(false);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      if (session) {
        // Set session and user immediately
        setSession(session);
        setUser(session.user);
        
        // Check onboarding status with retry logic
        let retries = 0;
        const maxRetries = 5; // Increased retries
        
        while (retries <= maxRetries) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.log(`Initial profile lookup attempt ${retries + 1} failed:`, error.message);
              if (retries < maxRetries) {
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
                retries++;
                continue;
              }
            }
            
            // Even if there's an error on the last retry, we still need to set a value
            setOnboardingCompleted(data?.onboarding_completed || false);
            console.log('Initial profile lookup result:', data?.onboarding_completed || false);
            break;
          } catch (error) {
            console.log(`Initial profile lookup exception attempt ${retries + 1}:`, error);
            if (retries >= maxRetries) {
              console.log('No profile found after all retries in initial check, onboarding needed');
              setOnboardingCompleted(false);
              break;
            }
            
            // Wait before retry with exponential backoff
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
            retries++;
          }
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