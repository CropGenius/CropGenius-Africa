/**
 * 🛡️ ENHANCED OFFLINE WRAPPER
 * -------------------------------------------------------------
 * Advanced offline-first component wrapper with intelligent fallbacks
 * - Automatic fallback component selection
 * - Progressive enhancement support
 * - Smart caching integration
 * - Error recovery mechanisms
 * - Performance monitoring
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  Zap,
  Shield,
  Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { 
  MapFallback, 
  DashboardFallback, 
  FieldListFallback,
  LoadingSpinner,
  NetworkStatus,
  APIErrorFallback,
  GenericErrorFallback
} from '@/components/fallback/FallbackComponents';
import {
  AIServiceFallback,
  CameraAccessFallback,
  LocationServiceFallback,
  RealTimeStreamFallback,
  AuthStateFallback,
  SatelliteDataFallback,
  NetworkQualityIndicator
} from '@/components/fallback/SpecializedFallbacks';

interface OfflineWrapperProps {
  children: React.ReactNode;
  componentName: string;
  fallbackType?: 'auto' | 'map' | 'dashboard' | 'list' | 'camera' | 'ai' | 'auth' | 'satellite' | 'stream';
  enableProgressiveEnhancement?: boolean;
  enableSmartCaching?: boolean;
  enableErrorRecovery?: boolean;
  retryAttempts?: number;
  cacheKey?: string;
  className?: string;
  onError?: (error: Error) => void;
  onRecovery?: () => void;
  onOfflineMode?: (isOffline: boolean) => void;
}

interface ComponentState {
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  hasCache: boolean;
  retryCount: number;
  lastUpdate: Date | null;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  progressiveEnhancement: boolean;
}

export const EnhancedOfflineWrapper: React.FC<OfflineWrapperProps> = ({
  children,
  componentName,
  fallbackType = 'auto',
  enableProgressiveEnhancement = true,
  enableSmartCaching = true,
  enableErrorRecovery = true,
  retryAttempts = 3,
  cacheKey,
  className = '',
  onError,
  onRecovery,
  onOfflineMode
}) => {
  const { isOnline } = useOfflineStatus();
  
  const [state, setState] = useState<ComponentState>({
    isLoading: false,
    error: null,
    isOffline: !isOnline,
    hasCache: false,
    retryCount: 0,
    lastUpdate: null,
    networkQuality: isOnline ? 'good' : 'offline',
    progressiveEnhancement: false
  });

  const effectiveCacheKey = cacheKey || `component_${componentName}`;

  // Check for cached data and progressive enhancement
  useEffect(() => {
    const checkCacheAndEnhancement = async () => {
      if (!enableSmartCaching) return;

      try {
        const hasCache = offlineDataManager.hasData(effectiveCacheKey);
        
        let progressiveEnhancement = false;
        if (enableProgressiveEnhancement) {
          progressiveEnhancement = await offlineDataManager.enableProgressiveEnhancement?.(componentName) || false;
        }

        setState(prev => ({
          ...prev,
          hasCache,
          progressiveEnhancement
        }));
      } catch (error) {
        console.error(`Failed to check cache for ${componentName}:`, error);
      }
    };

    checkCacheAndEnhancement();
  }, [componentName, effectiveCacheKey, enableSmartCaching, enableProgressiveEnhancement]);

  // Monitor network status
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isOffline: !isOnline,
      networkQuality: isOnline ? 'good' : 'offline'
    }));

    if (onOfflineMode) {
      onOfflineMode(!isOnline);
    }

    // Show network status change
    if (prev => prev.isOffline !== !isOnline) {
      if (isOnline) {
        toast.success('Back online!', {
          description: 'Full functionality restored'
        });
      } else {
        toast.warning('You\'re offline', {
          description: 'Limited functionality available'
        });
      }
    }
  }, [isOnline, onOfflineMode]);

  // Network quality monitoring
  useEffect(() => {
    if (!isOnline) return;

    const checkNetworkQuality = () => {
      // Simple network quality check based on connection type
      const connection = (navigator as any).connection;
      if (connection) {
        const { effectiveType, downlink } = connection;
        
        let quality: ComponentState['networkQuality'] = 'good';
        
        if (effectiveType === '4g' && downlink > 10) {
          quality = 'excellent';
        } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 5)) {
          quality = 'good';
        } else if (effectiveType === '3g' || downlink > 1) {
          quality = 'fair';
        } else {
          quality = 'poor';
        }

        setState(prev => ({ ...prev, networkQuality: quality }));
      }
    };

    checkNetworkQuality();
    const interval = setInterval(checkNetworkQuality, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [isOnline]);

  // Error recovery mechanism
  const handleError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      error,
      retryCount: prev.retryCount + 1
    }));

    if (onError) {
      onError(error);
    }

    // Record error for recovery learning
    if (enableErrorRecovery) {
      offlineDataManager.recordErrorRecovery?.(componentName, error.name, {
        message: error.message,
        timestamp: Date.now(),
        networkStatus: isOnline ? 'online' : 'offline',
        retryCount: state.retryCount
      });
    }

    console.error(`[${componentName}] Error:`, error);
  }, [componentName, enableErrorRecovery, isOnline, onError, state.retryCount]);

  // Retry mechanism
  const handleRetry = useCallback(async () => {
    if (state.retryCount >= retryAttempts) {
      toast.error('Maximum retry attempts reached', {
        description: 'Please refresh the page or try again later'
      });
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Simulate retry delay with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Clear error state
      setState(prev => ({
        ...prev,
        error: null,
        isLoading: false,
        lastUpdate: new Date()
      }));

      if (onRecovery) {
        onRecovery();
      }

      toast.success('Recovered successfully!', {
        description: 'Component is working normally'
      });

    } catch (error) {
      handleError(error as Error);
    }
  }, [state.retryCount, retryAttempts, onRecovery, handleError]);

  // Smart fallback selection
  const getFallbackComponent = useCallback(() => {
    const commonProps = {
      error: state.error,
      retry: handleRetry,
      isLoading: state.isLoading,
      offline: state.isOffline,
      className: 'w-full'
    };

    // Auto-detect fallback type based on component name
    if (fallbackType === 'auto') {
      if (componentName.toLowerCase().includes('map')) {
        return <MapFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('dashboard')) {
        return <DashboardFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('list') || componentName.toLowerCase().includes('field')) {
        return <FieldListFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('camera')) {
        return <CameraAccessFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('ai') || componentName.toLowerCase().includes('intelligence')) {
        return <AIServiceFallback {...commonProps} serviceName={componentName} />;
      }
      if (componentName.toLowerCase().includes('auth')) {
        return <AuthStateFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('satellite')) {
        return <SatelliteDataFallback {...commonProps} />;
      }
      if (componentName.toLowerCase().includes('stream') || componentName.toLowerCase().includes('realtime')) {
        return <RealTimeStreamFallback {...commonProps} streamType={componentName} />;
      }
      
      // Default generic fallback
      return <GenericErrorFallback {...commonProps} />;
    }

    // Specific fallback types
    switch (fallbackType) {
      case 'map':
        return <MapFallback {...commonProps} />;
      case 'dashboard':
        return <DashboardFallback {...commonProps} />;
      case 'list':
        return <FieldListFallback {...commonProps} />;
      case 'camera':
        return <CameraAccessFallback {...commonProps} />;
      case 'ai':
        return <AIServiceFallback {...commonProps} serviceName={componentName} />;
      case 'auth':
        return <AuthStateFallback {...commonProps} />;
      case 'satellite':
        return <SatelliteDataFallback {...commonProps} />;
      case 'stream':
        return <RealTimeStreamFallback {...commonProps} streamType={componentName} />;
      default:
        return <GenericErrorFallback {...commonProps} />;
    }
  }, [fallbackType, componentName, state, handleRetry]);

  // Progressive enhancement indicator
  const ProgressiveEnhancementBadge = useMemo(() => {
    if (!enableProgressiveEnhancement || !state.progressiveEnhancement) return null;

    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Zap className="h-3 w-3 mr-1" />
        Enhanced
      </Badge>
    );
  }, [enableProgressiveEnhancement, state.progressiveEnhancement]);

  // Cache status indicator
  const CacheStatusBadge = useMemo(() => {
    if (!enableSmartCaching) return null;

    return (
      <Badge variant="outline" className={state.hasCache ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}>
        <Database className="h-3 w-3 mr-1" />
        {state.hasCache ? 'Cached' : 'No Cache'}
      </Badge>
    );
  }, [enableSmartCaching, state.hasCache]);

  // Error boundary for children
  const ErrorBoundaryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    try {
      return <>{children}</>;
    } catch (error) {
      handleError(error as Error);
      return getFallbackComponent();
    }
  };

  // Show fallback if there's an error or if offline without cache
  const shouldShowFallback = state.error || (state.isOffline && !state.hasCache && !state.progressiveEnhancement);

  return (
    <div className={`relative ${className}`}>
      {/* Status indicators */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <NetworkQualityIndicator quality={state.networkQuality} />
          {ProgressiveEnhancementBadge}
          {CacheStatusBadge}
        </div>
        
        {state.lastUpdate && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Updated {state.lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Network status banner */}
      {state.isOffline && (
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You're currently offline. {state.hasCache ? 'Using cached data.' : 'Limited functionality available.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Error alert */}
      {state.error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{state.error.message}</span>
              <Button
                onClick={handleRetry}
                disabled={state.retryCount >= retryAttempts}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry ({state.retryCount}/{retryAttempts})
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {state.isLoading && (
        <div className="mb-4">
          <LoadingSpinner message="Recovering component..." />
        </div>
      )}

      {/* Main content or fallback */}
      <AnimatePresence mode="wait">
        {shouldShowFallback ? (
          <motion.div
            key="fallback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getFallbackComponent()}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorBoundaryWrapper>
              {children}
            </ErrorBoundaryWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network status indicator (floating) */}
      <NetworkStatus />
    </div>
  );
};

export default EnhancedOfflineWrapper;

// Convenience wrapper for common use cases
export const OfflineMapWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <EnhancedOfflineWrapper
    componentName="MapComponent"
    fallbackType="map"
    enableProgressiveEnhancement={true}
    enableSmartCaching={true}
    className={className}
  >
    {children}
  </EnhancedOfflineWrapper>
);

export const OfflineDashboardWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <EnhancedOfflineWrapper
    componentName="DashboardComponent"
    fallbackType="dashboard"
    enableProgressiveEnhancement={true}
    enableSmartCaching={true}
    className={className}
  >
    {children}
  </EnhancedOfflineWrapper>
);

export const OfflineAIWrapper: React.FC<{ children: React.ReactNode; serviceName?: string; className?: string }> = ({ 
  children, 
  serviceName = "AI Service",
  className 
}) => (
  <EnhancedOfflineWrapper
    componentName={serviceName}
    fallbackType="ai"
    enableProgressiveEnhancement={true}
    enableSmartCaching={true}
    enableErrorRecovery={true}
    className={className}
  >
    {children}
  </EnhancedOfflineWrapper>
);

export const OfflineCameraWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <EnhancedOfflineWrapper
    componentName="CameraComponent"
    fallbackType="camera"
    enableProgressiveEnhancement={false}
    enableSmartCaching={false}
    className={className}
  >
    {children}
  </EnhancedOfflineWrapper>
);