/**
 * 🔥 CROPGENIUS OFFLINE WRAPPER COMPONENTS
 * Smart offline-aware wrappers for components that need network access
 */

import React, { ReactNode } from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOfflineStatus, useOfflineFirst } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  showOfflineIndicator?: boolean;
  allowOfflineInteraction?: boolean;
  className?: string;
}

/**
 * Generic Offline Wrapper
 * Wraps components that require network access
 */
export const OfflineWrapper: React.FC<OfflineWrapperProps> = ({
  children,
  fallback,
  showOfflineIndicator = true,
  allowOfflineInteraction = false,
  className
}) => {
  const { isOnline, connectionQuality } = useOfflineStatus();
  
  if (!isOnline && !allowOfflineInteraction) {
    return (
      <div className={cn('relative', className)}>
        {fallback || (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                <WifiOff className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800 text-lg">Offline Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-orange-700 mb-4">
                This feature requires an internet connection. Please check your network and try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {showOfflineIndicator && !isOnline && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="destructive" className="text-xs">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        </div>
      )}
      
      {showOfflineIndicator && isOnline && connectionQuality === 'poor' && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
            <Wifi className="h-3 w-3 mr-1" />
            Slow
          </Badge>
        </div>
      )}
      
      <div className={cn(!isOnline && allowOfflineInteraction && 'opacity-75')}>
        {children}
      </div>
    </div>
  );
};

/**
 * Data Loading Wrapper with Offline Support
 */
interface OfflineDataWrapperProps<T> {
  fetchFn: () => Promise<T>;
  cacheKey: string;
  defaultValue: T;
  children: (data: T, loading: boolean, error: Error | null, isStale: boolean) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error, retry: () => void) => ReactNode;
  className?: string;
}

export function OfflineDataWrapper<T>({
  fetchFn,
  cacheKey,
  defaultValue,
  children,
  loadingFallback,
  errorFallback,
  className
}: OfflineDataWrapperProps<T>) {
  const { data, loading, error, refetch, isStale } = useOfflineFirst(
    fetchFn,
    cacheKey,
    defaultValue,
    { refetchOnReconnect: true }
  );
  
  const { isOnline } = useOfflineStatus();
  
  if (loading && data === defaultValue) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        {loadingFallback || (
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
        )}
      </div>
    );
  }
  
  if (error && data === defaultValue) {
    return (
      <div className={cn('p-4', className)}>
        {errorFallback ? errorFallback(error, refetch) : (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-800 text-lg">Failed to Load Data</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-700 mb-4">{error.message}</p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={refetch} variant="outline" className="border-red-300 text-red-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Stale data indicator */}
      {isStale && !loading && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="outline" className="text-xs bg-gray-50">
            <Database className="h-3 w-3 mr-1" />
            Cached
          </Badge>
        </div>
      )}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="destructive" className="text-xs">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        </div>
      )}
      
      {children(data, loading, error, isStale)}
    </div>
  );
}

/**
 * Form Wrapper with Offline Support
 */
interface OfflineFormWrapperProps {
  children: ReactNode;
  onSubmit: (data: any) => Promise<void>;
  enableOfflineQueue?: boolean;
  className?: string;
}

export const OfflineFormWrapper: React.FC<OfflineFormWrapperProps> = ({
  children,
  onSubmit,
  enableOfflineQueue = true,
  className
}) => {
  const { isOnline } = useOfflineStatus();
  
  const handleSubmit = async (data: any) => {
    if (!isOnline && enableOfflineQueue) {
      // Queue the form submission for when we're back online
      const queuedSubmissions = JSON.parse(
        localStorage.getItem('offline_form_queue') || '[]'
      );
      
      queuedSubmissions.push({
        id: Date.now().toString(),
        data,
        timestamp: new Date().toISOString(),
        type: 'form_submission'
      });
      
      localStorage.setItem('offline_form_queue', JSON.stringify(queuedSubmissions));
      
      // Show success message
      return Promise.resolve();
    }
    
    return onSubmit(data);
  };
  
  return (
    <div className={cn('relative', className)}>
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <WifiOff className="h-4 w-4 text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Offline Mode</p>
              <p className="text-xs text-yellow-700">
                {enableOfflineQueue 
                  ? 'Your submission will be saved and sent when you\'re back online.'
                  : 'You need an internet connection to submit this form.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className={cn(!isOnline && !enableOfflineQueue && 'opacity-50 pointer-events-none')}>
        {React.cloneElement(children as React.ReactElement, {
          onSubmit: handleSubmit
        })}
      </div>
    </div>
  );
};

/**
 * Image Wrapper with Offline Support
 */
interface OfflineImageWrapperProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  [key: string]: any;
}

export const OfflineImageWrapper: React.FC<OfflineImageWrapperProps> = ({
  src,
  alt,
  fallbackSrc,
  className,
  ...props
}) => {
  const { isOnline } = useOfflineStatus();
  const [imageError, setImageError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  const handleImageLoad = () => setLoading(false);
  const handleImageError = () => {
    setImageError(true);
    setLoading(false);
  };
  
  if (!isOnline || imageError) {
    return (
      <div className={cn(
        'bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center',
        className
      )}>
        <div className="text-center p-4">
          <WifiOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {!isOnline ? 'Image unavailable offline' : 'Failed to load image'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-md" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn('transition-opacity', loading && 'opacity-0')}
        {...props}
      />
    </div>
  );
};