// FRONTEND ONBOARDING REDIRECT FIX
// This fix ensures users are properly redirected to onboarding when needed

// src/pages/Auth.tsx - FIXED VERSION
import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth/components/AuthPage';

export default function Auth() {
  const { isAuthenticated, user, isLoading, onboardingCompleted } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  // FIXED: Redirect to onboarding if authenticated but onboarding not completed
  if (isAuthenticated && user && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // FIXED: Redirect to dashboard if authenticated and onboarding completed
  if (isAuthenticated && user && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
}

// src/pages/OAuthCallback.tsx - FIXED VERSION
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted } = useAuthContext();

  useEffect(() => {
    // FIXED: Proper redirect based on auth state and onboarding completion
    if (isAuthenticated) {
      toast.success('Welcome to CropGenius! 🌾');
      
      // FIXED: Redirect to onboarding if onboarding not completed
      if (!onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        // FIXED: Redirect to dashboard if onboarding completed
        navigate('/dashboard', { replace: true });
      }
    } else {
      // If auth failed, go back to auth page
      toast.error('Authentication failed. Please try again.');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, onboardingCompleted, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}

// src/providers/AuthProvider.tsx - ENHANCED VERSION
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={useAuth()}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

// src/hooks/useAuth.ts - ENHANCED VERSION
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
            
            // FIXED: Properly set onboarding status
            setOnboardingCompleted(data?.onboarding_completed === true);
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
          
          // FIXED: Properly set onboarding status
          setOnboardingCompleted(data?.onboarding_completed === true);
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
  }, [isLoading]);

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