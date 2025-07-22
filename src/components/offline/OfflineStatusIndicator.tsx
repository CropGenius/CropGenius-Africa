/**
 * 🔥 CROPGENIUS OFFLINE STATUS INDICATOR
 * Beautiful offline status indicator for African farmers
 */

import React from 'react';
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { cn } from '@/lib/utils';

interface OfflineStatusIndicatorProps {
  variant?: 'badge' | 'card' | 'minimal';
  showText?: boolean;
  className?: string;
}

/**
 * Offline Status Indicator Component
 */
export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  variant = 'badge',
  showText = true,
  className
}) => {
  const { 
    isOnline, 
    isChecking, 
    connectionQuality, 
    lastOnline,
    refresh,
    getConnectionIcon,
    getConnectionText
  } = useOfflineStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'poor': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <Signal className="h-3 w-3 animate-pulse" />;
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    
    switch (connectionQuality) {
      case 'excellent': return <SignalHigh className="h-3 w-3" />;
      case 'good': return <SignalMedium className="h-3 w-3" />;
      case 'poor': return <SignalLow className="h-3 w-3" />;
      default: return <Wifi className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (!isOnline) {
      if (lastOnline) {
        const timeSince = Math.floor((Date.now() - lastOnline.getTime()) / 1000 / 60);
        return `Offline (${timeSince}m ago)`;
      }
      return 'Offline';
    }
    return getConnectionText();
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        <div className={cn('w-2 h-2 rounded-full', getStatusColor())} />
        {showText && (
          <span className="text-xs text-muted-foreground">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn('w-3 h-3 rounded-full', getStatusColor())} />
              <div>
                <h3 className="font-medium text-sm">Connection Status</h3>
                <p className="text-xs text-muted-foreground">{getStatusText()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Refresh'}
              </Button>
            </div>
          </div>
          
          {!isOnline && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-md">
              <p className="text-xs text-yellow-700">
                📱 Working offline with cached data. Some features may be limited.
              </p>
            </div>
          )}
          
          {isOnline && connectionQuality === 'poor' && (
            <div className="mt-3 p-2 bg-orange-50 rounded-md">
              <p className="text-xs text-orange-700">
                ⚠️ Slow connection detected. Consider switching to a better network.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default badge variant
  return (
    <Badge 
      variant={isOnline ? 'default' : 'destructive'}
      className={cn(
        'flex items-center space-x-1 cursor-pointer transition-all hover:scale-105',
        className
      )}
      onClick={refresh}
    >
      {getStatusIcon()}
      {showText && <span className="text-xs">{getStatusText()}</span>}
      <span className="ml-1">{getConnectionIcon()}</span>
    </Badge>
  );
};

/**
 * Floating Offline Status Indicator
 */
export const FloatingOfflineIndicator: React.FC = () => {
  const { isOnline } = useOfflineStatus();
  
  // Only show when offline
  if (isOnline) return null;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <OfflineStatusIndicator variant="badge" className="bg-red-500 text-white animate-pulse" />
    </div>
  );
};

/**
 * Offline Banner Component
 */
export const OfflineBanner: React.FC<{ className?: string }> = ({ className }) => {
  const { isOnline, connectionQuality } = useOfflineStatus();
  
  if (isOnline && connectionQuality !== 'poor') return null;
  
  return (
    <div className={cn(
      'w-full p-2 text-center text-sm',
      isOnline 
        ? 'bg-yellow-100 text-yellow-800 border-b border-yellow-200'
        : 'bg-red-100 text-red-800 border-b border-red-200',
      className
    )}>
      {isOnline ? (
        <>
          ⚠️ Slow connection - Some features may be delayed
        </>
      ) : (
        <>
          📵 You're offline - Using cached data where available
        </>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;