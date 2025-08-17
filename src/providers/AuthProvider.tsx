import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('🔧 [AUTH] AuthProvider rendering - timestamp:', Date.now());
  console.log('🔧 [AUTH] React useState available:', typeof useState);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const processReferralAttribution = useCallback(async (newUser: User) => {
    try {
      const referralCode = localStorage.getItem('referralCode');
      const referralTimestamp = localStorage.getItem('referralTimestamp');
      
      if (!referralCode) return;
      
      // Check if referral is still valid (within 30 days)
      if (referralTimestamp) {
        const referralDate = new Date(referralTimestamp);
        const now = new Date();
        const daysDiff = (now.getTime() - referralDate.getTime()) / (1000 * 3600 * 24);
        
        if (daysDiff > 30) {
          localStorage.removeItem('referralCode');
          localStorage.removeItem('referralTimestamp');
          return;
        }
      }
      
      // Find the referrer by matching the referral code to user ID prefix
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .like('id', `${referralCode.toLowerCase()}%`)
        .limit(1);
        
      if (usersError) {
        console.error('Error finding referrer:', usersError);
        return;
      }
      
      if (users && users.length > 0) {
        const referrerId = users[0].id;
        
        // Process the referral
        const { error: referralError } = await supabase.functions.invoke('referral-credit', {
          body: { referrerId, referredId: newUser.id }
        });
        
        if (referralError) {
          console.error('Error processing referral:', referralError);
        } else {
          toast.success('🎉 Welcome bonus applied!', {
            description: 'You and your friend both received 10 FREE credits!'
          });
        }
      }
      
      // Clean up referral data
      localStorage.removeItem('referralCode');
      localStorage.removeItem('referralTimestamp');
      
    } catch (error) {
      console.error('Error processing referral attribution:', error);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  }, []);

  const signInWithGoogle = useCallback(() => 
    supabase.auth.signInWithOAuth({ provider: 'google' }), []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Process referral attribution for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is a new user (created recently)
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const minutesDiff = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60);
          
          // If user was created within the last 5 minutes, consider it a new signup
          if (minutesDiff <= 5) {
            await processReferralAttribution(session.user);
          }
        }
      }
    );

    initAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [processReferralAttribution]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    isInitialized: true,
    signInWithGoogle,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;