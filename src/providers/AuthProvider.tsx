
import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  authInitialized: boolean;
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
