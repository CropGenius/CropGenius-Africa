import { useEffect, useState } from 'react';
import { enhancedAuth } from '@/services/EnhancedAuthService';

export const useAuthRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const session = await enhancedAuth.refreshSession();
      if (!session) {
        setError('Authentication expired. Please sign in again.');
        // Redirect to login or show sign-in modal
        window.location.href = '/auth';
      }
      return session;
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