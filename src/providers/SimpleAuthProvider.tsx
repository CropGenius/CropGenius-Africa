/**
 * 🔥 SIMPLE AUTH PROVIDER - ZERO COMPLEXITY
 * 
 * ELIMINATES:
 * - Onboarding dependencies in auth flow
 * - Complex redirect logic
 * - Multiple auth contexts
 * - Race conditions
 * 
 * PROVIDES:
 * - Clean auth state
 * - Simple sign in/out methods
 * - Production-ready for 100M users
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function useSimpleAuthContext() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuthContext must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const authState = useSimpleAuth();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const value: SimpleAuthContextType = {
    ...authState,
    signOut,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}