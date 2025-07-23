/**
 * 🛡️ SPECIALIZED FALLBACK COMPONENTS
 * -------------------------------------------------------------
 * Additional fallback components for specific CropGenius scenarios
 * - AI Service failures with graceful degradation
 * - Camera/media access failures
 * - Location service failures
 * - Real-time data stream failures
 * - Authentication state failures
 */

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Satellite,
  CloudOff,
  DatabaseX,
  UserX,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Microscope,
  Bot,
  Brain,
  Activity,
  TrendingDown,
  Server,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface FallbackProps {
  error?: Error | null;
  retry?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * AI Service Fallback - For when AI agents fail
 */
export const AIServiceFallback: React.FC<FallbackProps & {
  serviceName?: string;
  fallbackData?: any;
  showOfflineMode?: boolean;
}> = ({ 
  error, 
  retry, 
  serviceName = "AI Service",
  fallbackData,
  showOfflineMode = true,
  className = "" 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (!retry) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-amber-800 text-lg">
                {serviceName} Temporarily Unavailable
              </CardTitle>
              <p className="text-sm text-amber-700">
                AI intelligence is currently offline
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-700">
              Status: {isRetrying ? 'Reconnecting...' : 'Disconnected'}
            </span>
            <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
              Attempt {retryCount}/3
            </Badge>
          </div>

          {error && (
            <Alert className="bg-amber-100 border-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                {error.message || 'AI service connection failed'}
              </AlertDescription>
            </Alert>
          )}

          {fallbackData && showOfflineMode && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DatabaseX className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Using Cached Data
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Showing previously cached results while AI service reconnects
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying || retryCount >= 3}
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-amber-50"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRetrying ? 'Reconnecting...' : 'Retry Connection'}
            </Button>
            
            {showOfflineMode && (
              <Button 
                variant="secondary"
                size="sm"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <DatabaseX className="h-4 w-4 mr-2" />
                Offline Mode
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Camera Access Fallback - For camera permission/hardware failures
 */
export const CameraAccessFallback: React.FC<FallbackProps & {
  permissionDenied?: boolean;
  hardwareError?: boolean;
  onFileUpload?: () => void;
}> = ({ 
  error, 
  retry, 
  permissionDenied = false,
  hardwareError = false,
  onFileUpload,
  className = "" 
}) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const getErrorType = () => {
    if (permissionDenied) return 'permission';
    if (hardwareError) return 'hardware';
    return 'unknown';
  };

  const getErrorMessage = () => {
    switch (getErrorType()) {
      case 'permission':
        return 'Camera access was denied. Please allow camera permissions to use this feature.';
      case 'hardware':
        return 'Camera hardware is not available or is being used by another application.';
      default:
        return 'Unable to access camera. Please check your device settings.';
    }
  };

  const getInstructions = () => {
    switch (getErrorType()) {
      case 'permission':
        return [
          'Click the camera icon in your browser\'s address bar',
          'Select "Allow" for camera permissions',
          'Refresh the page and try again'
        ];
      case 'hardware':
        return [
          'Close other applications that might be using the camera',
          'Check if your camera is properly connected',
          'Restart your browser and try again'
        ];
      default:
        return [
          'Check your browser settings for camera permissions',
          'Ensure your device has a working camera',
          'Try refreshing the page'
        ];
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-800 text-lg">
                Camera Access Required
              </CardTitle>
              <p className="text-sm text-red-700">
                {getErrorMessage()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-100 border-red-300">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Technical details: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            {retry && (
              <Button 
                onClick={retry}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-red-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Try Camera Again
              </Button>
            )}
            
            {onFileUpload && (
              <Button 
                onClick={onFileUpload}
                variant="secondary"
                size="sm"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <Eye className="h-4 w-4 mr-2" />
                Upload Image Instead
              </Button>
            )}
            
            <Button 
              onClick={() => setShowInstructions(!showInstructions)}
              variant="ghost"
              size="sm"
            >
              {showInstructions ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showInstructions ? 'Hide' : 'Show'} Instructions
            </Button>
          </div>

          {showInstructions && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                How to fix this:
              </h4>
              <ol className="text-xs text-blue-700 space-y-1">
                {getInstructions().map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="font-medium mr-2">{index + 1}.</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Location Service Fallback - For GPS/location failures
 */
export const LocationServiceFallback: React.FC<FallbackProps & {
  permissionDenied?: boolean;
  timeout?: boolean;
  onManualEntry?: () => void;
}> = ({ 
  error, 
  retry, 
  permissionDenied = false,
  timeout = false,
  onManualEntry,
  className = "" 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!retry) return;
    
    setIsRetrying(true);
    try {
      await retry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorMessage = () => {
    if (permissionDenied) return 'Location access was denied';
    if (timeout) return 'Location request timed out';
    return 'Unable to get your location';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-orange-800 text-lg">
                Location Service Unavailable
              </CardTitle>
              <p className="text-sm text-orange-700">
                {getErrorMessage()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Location Required
              </span>
            </div>
            <p className="text-xs text-yellow-700">
              Weather and field data requires your location for accurate results
            </p>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="flex-1 bg-white hover:bg-orange-50"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4 mr-2" />
              )}
              {isRetrying ? 'Getting Location...' : 'Try Again'}
            </Button>
            
            {onManualEntry && (
              <Button 
                onClick={onManualEntry}
                variant="secondary"
                size="sm"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <Globe className="h-4 w-4 mr-2" />
                Enter Manually
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Real-time Data Stream Fallback - For WebSocket/SSE failures
 */
export const RealTimeStreamFallback: React.FC<FallbackProps & {
  streamType?: string;
  lastUpdate?: Date;
  usePolling?: boolean;
  onEnablePolling?: () => void;
}> = ({ 
  error, 
  retry, 
  streamType = "data stream",
  lastUpdate,
  usePolling = false,
  onEnablePolling,
  className = "" 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const handleRetry = async () => {
    if (!retry) return;
    
    setConnectionStatus('connecting');
    try {
      await retry();
      setConnectionStatus('connected');
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'connecting': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-50 border-green-200';
      case 'connecting': return 'bg-blue-50 border-blue-200';
      default: return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className={`border-2 ${getStatusColor()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-gray-800 text-lg">
                  Real-time {streamType} Disconnected
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Live updates are currently unavailable
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium capitalize">
                {connectionStatus}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastUpdate && (
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">Last Update</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}

          {error && (
            <Alert className="bg-red-100 border-red-300">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Connection error: {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleRetry}
              disabled={connectionStatus === 'connecting'}
              variant="outline"
              size="sm"
              className="flex-1 bg-white"
            >
              {connectionStatus === 'connecting' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reconnect
            </Button>
            
            {onEnablePolling && (
              <Button 
                onClick={onEnablePolling}
                variant="secondary"
                size="sm"
                className={usePolling ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                {usePolling ? 'Polling Active' : 'Use Polling'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Authentication State Fallback - For auth failures
 */
export const AuthStateFallback: React.FC<FallbackProps & {
  authState?: 'loading' | 'expired' | 'invalid' | 'network';
  onSignIn?: () => void;
  onRefresh?: () => void;
}> = ({ 
  error, 
  retry, 
  authState = 'invalid',
  onSignIn,
  onRefresh,
  className = "" 
}) => {
  const getAuthMessage = () => {
    switch (authState) {
      case 'loading': return 'Verifying your authentication...';
      case 'expired': return 'Your session has expired';
      case 'network': return 'Unable to verify authentication due to network issues';
      default: return 'Authentication required';
    }
  };

  const getAuthIcon = () => {
    switch (authState) {
      case 'loading': return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'expired': return <Clock className="h-5 w-5 text-orange-600" />;
      case 'network': return <WifiOff className="h-5 w-5 text-red-600" />;
      default: return <UserX className="h-5 w-5 text-red-600" />;
    }
  };

  const getBorderColor = () => {
    switch (authState) {
      case 'loading': return 'border-blue-200 bg-blue-50';
      case 'expired': return 'border-orange-200 bg-orange-50';
      case 'network': return 'border-red-200 bg-red-50';
      default: return 'border-red-200 bg-red-50';
    }
  };

  if (authState === 'loading') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Authenticating...
            </h3>
            <p className="text-blue-700">
              Please wait while we verify your credentials
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className={getBorderColor()}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              {getAuthIcon()}
            </div>
            <div>
              <CardTitle className="text-gray-800 text-lg">
                Authentication Required
              </CardTitle>
              <p className="text-sm text-gray-600">
                {getAuthMessage()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-100 border-red-300">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            {authState === 'expired' && onRefresh && (
              <Button 
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="flex-1 bg-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Session
              </Button>
            )}
            
            {onSignIn && (
              <Button 
                onClick={onSignIn}
                size="sm"
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            {retry && authState === 'network' && (
              <Button 
                onClick={retry}
                variant="outline"
                size="sm"
                className="bg-white"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Satellite Data Fallback - For satellite imagery failures
 */
export const SatelliteDataFallback: React.FC<FallbackProps & {
  dataType?: string;
  cloudCoverage?: number;
  lastImageDate?: Date;
  onUseAlternative?: () => void;
}> = ({ 
  error, 
  retry, 
  dataType = "satellite imagery",
  cloudCoverage,
  lastImageDate,
  onUseAlternative,
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Satellite className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-800 text-lg">
                Satellite Data Unavailable
              </CardTitle>
              <p className="text-sm text-purple-700">
                {dataType} is currently not accessible
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {cloudCoverage && cloudCoverage > 70 && (
            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <CloudOff className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  High Cloud Coverage
                </span>
              </div>
              <p className="text-xs text-gray-700">
                {cloudCoverage}% cloud coverage is affecting satellite visibility
              </p>
            </div>
          )}

          {lastImageDate && (
            <div className="flex items-center justify-between p-2 bg-blue-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Last Clear Image</span>
              </div>
              <span className="text-sm font-medium text-blue-900">
                {lastImageDate.toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex space-x-2">
            {retry && (
              <Button 
                onClick={retry}
                variant="outline"
                size="sm"
                className="flex-1 bg-white hover:bg-purple-50"
              >
                <Satellite className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            )}
            
            {onUseAlternative && (
              <Button 
                onClick={onUseAlternative}
                variant="secondary"
                size="sm"
                className="bg-blue-100 hover:bg-blue-200 text-blue-800"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Use Ground Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Network Quality Indicator - Shows connection quality
 */
export const NetworkQualityIndicator: React.FC<{
  quality?: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  speed?: number; // in Mbps
  className?: string;
}> = ({ 
  quality = 'good', 
  speed,
  className = "" 
}) => {
  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent': return <SignalHigh className="h-4 w-4 text-green-600" />;
      case 'good': return <SignalMedium className="h-4 w-4 text-blue-600" />;
      case 'fair': return <SignalLow className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <Signal className="h-4 w-4 text-red-600" />;
      default: return <WifiOff className="h-4 w-4 text-gray-600" />;
    }
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return 'bg-green-50 text-green-700 border-green-200';
      case 'good': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'fair': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getQualityColor()} ${className}`}>
      {getQualityIcon()}
      <span className="ml-1 capitalize">{quality}</span>
      {speed && (
        <span className="ml-1">({speed.toFixed(1)} Mbps)</span>
      )}
    </Badge>
  );
};

/**
 * Service Status Grid - Shows status of multiple services
 */
export const ServiceStatusGrid: React.FC<{
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded' | 'maintenance';
    icon?: React.ReactNode;
    lastCheck?: Date;
  }>;
  className?: string;
}> = ({ services, className = "" }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-50 text-green-700 border-green-200';
      case 'degraded': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'maintenance': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-3 w-3" />;
      case 'degraded': return <AlertTriangle className="h-3 w-3" />;
      case 'maintenance': return <Clock className="h-3 w-3" />;
      default: return <XCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${className}`}>
      {services.map((service, index) => (
        <div key={index} className="p-2 border rounded-lg bg-white">
          <div className="flex items-center space-x-2 mb-1">
            {service.icon || <Server className="h-4 w-4 text-gray-500" />}
            <span className="text-xs font-medium text-gray-800 truncate">
              {service.name}
            </span>
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(service.status)}`}
          >
            {getStatusIcon(service.status)}
            <span className="ml-1 capitalize">{service.status}</span>
          </Badge>
        </div>
      ))}
    </div>
  );
};