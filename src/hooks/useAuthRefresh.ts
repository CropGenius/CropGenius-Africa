import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAuthRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      const refreshedSession = session;
      if (!refreshedSession) {
        setError('Authentication expired. Please sign in again.');
        // Redirect to login or show sign-in modal
        window.location.href = '/auth';
      }
      return refreshedSession;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setError(message);
      console.error('Auth refresh failed:', error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAuthError = async (error: any) => {
    if (error?.message?.includes('Authentication') || error?.status === 401) {
      console.log('Detected auth error, attempting refresh...');
      return await refreshAuth();
    }
    return null;
  };

  return {
    refreshAuth,
    handleAuthError,
    isRefreshing,
    error
  };
};