/**
 * 🔥 CROPGENIUS OFFLINE STATUS HOOK
 * Advanced offline detection and management for African farmers
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineStatusConfig {
  checkInterval?: number;
  pingUrl?: string;
  showToasts?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
}

interface OfflineStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastOnline: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
}

/**
 * Advanced offline status hook with connection quality detection
 */
export function useOfflineStatus(config: OfflineStatusConfig = {}) {
  const {
    checkInterval = 30000, // Check every 30 seconds
    pingUrl = '/api/health',
    showToasts = true,
    onOnline,
    onOffline
  } = config;

  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isChecking: false,
    lastOnline: navigator.onLine ? new Date() : null,
    connectionQuality: navigator.onLine ? 'good' : 'offline'
  });

  // Test connection quality by measuring response time
  const testConnectionQuality = useCallback(async (): Promise<'excellent' | 'good' | 'poor' | 'offline'> => {
    if (!navigator.onLine) return 'offline';
    
    try {
      const startTime = Date.now();
      const response = await fetch(pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (!response.ok) return 'poor';
      
      const responseTime = Date.now() - startTime;
      
      if (responseTime < 500) return 'excellent';
      if (responseTime < 1500) return 'good';
      return 'poor';
    } catch (error) {
      console.warn('Connection quality test failed:', error);
      return 'offline';
    }
  }, [pingUrl]);

  // Update online status
  const updateStatus = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    const wasOnline = status.isOnline;
    const isCurrentlyOnline = navigator.onLine;
    const quality = await testConnectionQuality();
    const isActuallyOnline = quality !== 'offline';
    
    setStatus(prev => ({
      ...prev,
      isOnline: isActuallyOnline,
      isChecking: false,
      lastOnline: isActuallyOnline ? new Date() : prev.lastOnline,
      connectionQuality: quality
    }));

    // Handle status changes
    if (!wasOnline && isActuallyOnline) {
      if (showToasts) {
        toast.success('Back Online! 🌐', {
          description: 'Your connection has been restored. Syncing data...'
        });
      }
      onOnline?.();
    } else if (wasOnline && !isActuallyOnline) {
      if (showToasts) {
        toast.warning('Connection Lost 📡', {
          description: 'Working offline with cached data.'
        });
      }
      onOffline?.();
    }
  }, [status.isOnline, testConnectionQuality, showToasts, onOnline, onOffline]);

  // Set up event listeners and periodic checks
  useEffect(() => {
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connection quality check
    const interval = setInterval(updateStatus, checkInterval);

    // Initial check
    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [updateStatus, checkInterval]);

  return {
    ...status,
    refresh: updateStatus,
    getConnectionIcon: () => {
      switch (status.connectionQuality) {
        case 'excellent': return '📶';
        case 'good': return '📶';
        case 'poor': return '📶';
        case 'offline': return '📵';
        default: return '📶';
      }
    },
    getConnectionText: () => {
      switch (status.connectionQuality) {
        case 'excellent': return 'Excellent Connection';
        case 'good': return 'Good Connection';
        case 'poor': return 'Poor Connection';
        case 'offline': return 'Offline';
        default: return 'Unknown';
      }
    }
  };
}

/**
 * Hook for managing offline data caching
 */
export function useOfflineCache<T>(key: string, defaultValue: T) {
  const [cachedData, setCachedData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(`offline_cache_${key}`);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updateCache = useCallback((data: T) => {
    setCachedData(data);
    try {
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    setCachedData(defaultValue);
    try {
      localStorage.removeItem(`offline_cache_${key}`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [key, defaultValue]);

  return {
    data: cachedData,
    updateCache,
    clearCache,
    hasCache: cachedData !== defaultValue
  };
}

/**
 * Hook for offline-first data fetching
 */
export function useOfflineFirst<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  defaultValue: T,
  options: {
    refetchOnReconnect?: boolean;
    cacheTimeout?: number; // in milliseconds
  } = {}
) {
  const { refetchOnReconnect = true, cacheTimeout = 5 * 60 * 1000 } = options; // 5 minutes default
  const { isOnline } = useOfflineStatus();
  const { data: cachedData, updateCache } = useOfflineCache(cacheKey, defaultValue);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isOnline && !forceRefresh) {
      return cachedData;
    }

    // Check if cache is still fresh
    if (!forceRefresh && lastFetch && cacheTimeout > 0) {
      const timeSinceLastFetch = Date.now() - lastFetch.getTime();
      if (timeSinceLastFetch < cacheTimeout) {
        return cachedData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const freshData = await fetchFn();
      updateCache(freshData);
      setLastFetch(new Date());
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Fetch failed');
      setError(error);
      
      // Return cached data if available, otherwise throw
      if (cachedData !== defaultValue) {
        console.warn('Using cached data due to fetch error:', error);
        return cachedData;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isOnline, cachedData, fetchFn, updateCache, lastFetch, cacheTimeout, defaultValue]);

  // Auto-refetch when coming back online
  useEffect(() => {
    if (isOnline && refetchOnReconnect && lastFetch) {
      fetchData();
    }
  }, [isOnline, refetchOnReconnect, fetchData, lastFetch]);

  return {
    data: cachedData,
    loading,
    error,
    refetch: () => fetchData(true),
    isStale: lastFetch ? Date.now() - lastFetch.getTime() > cacheTimeout : true
  };
}