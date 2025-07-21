/**
 * 🛡️ INFINITY IQ FALLBACK COMPONENTS
 * -------------------------------------------------------------
 * PRODUCTION-READY graceful degradation UI components
 * - Intelligent fallback detection and switching
 * - Offline-capable skeleton loaders
 * - Network-aware component rendering
 * - Performance-optimized fallback states
 * - Accessibility-compliant error states
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, MapPin, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FallbackProps {
  error?: Error | null;
  retry?: () => void;
  isLoading?: boolean;
  offline?: boolean;
  className?: string;
}

/**
 * Map Fallback Component - For MapboxFieldMap failures
 */
export const MapFallback: React.FC<FallbackProps> = ({ 
  error, 
  retry, 
  offline = false, 
  className = "" 
}) => {
  return (
    <div className={`relative w-full h-full min-h-[400px] bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`}>
      <div className="text-center p-6 max-w-md">
        <div className="mb-4">
          {offline ? (
            <WifiOff className="h-16 w-16 text-gray-400 mx-auto" />
          ) : (
            <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {offline ? 'Map Offline' : 'Map Unavailable'}
        </h3>
        
        <p className="text-gray-500 mb-4 text-sm">
          {offline 
            ? 'Map functionality is limited while offline. Your field data is still accessible.'
            : 'Unable to load interactive map. You can still manage your field data.'
          }
        </p>

        <div className="space-y-2">
          {retry && (
            <Button 
              onClick={retry} 
              variant="outline" 
              size="sm"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          <div className="text-xs text-gray-400">
            Field boundaries and location data remain available
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dashboard Fallback Component - For dashboard data failures
 */
export const DashboardFallback: React.FC<FallbackProps> = ({ 
  error, 
  retry, 
  isLoading = false,
  className = "" 
}) => {
  if (isLoading) {
    return <DashboardSkeleton className={className} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load dashboard data. Some features may be limited.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score Fallback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Farm Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <p className="text-xs text-gray-500">Data unavailable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends Fallback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-2xl font-bold text-gray-400">--</div>
                <p className="text-xs text-gray-500">Data unavailable</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Fallback */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">Checking...</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {retry && (
        <div className="flex justify-center pt-4">
          <Button onClick={retry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      )}
    </div>
  );
};

/**
 * Dashboard Skeleton Loader
 */
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

/**
 * Field List Fallback Component
 */
export const FieldListFallback: React.FC<FallbackProps> = ({ 
  error, 
  retry, 
  isLoading = false,
  className = "" 
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">No Fields Available</h3>
      <p className="text-gray-500 mb-4">
        {error ? 'Unable to load your fields.' : 'You haven\'t added any fields yet.'}
      </p>
      
      {retry && (
        <Button onClick={retry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

/**
 * Network Status Indicator
 */
export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Back Online' : 'Offline Mode'}
        </span>
      </div>
    </div>
  );
};

/**
 * Loading Spinner with Message
 */
export const LoadingSpinner: React.FC<{ 
  message?: string; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  message = 'Loading...', 
  size = 'md',
  className = "" 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
};

/**
 * Data Table Fallback Component
 */
export const DataTableFallback: React.FC<FallbackProps & {
  columns?: number;
  rows?: number;
}> = ({
  error,
  retry,
  isLoading = false,
  columns = 4,
  rows = 5,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Table header skeleton */}
        <div className="border rounded-t-lg overflow-hidden">
          <div className="bg-gray-50 p-3 flex">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex-1 px-2">
                <Skeleton className="h-4 w-full max-w-[100px]" />
              </div>
            ))}
          </div>
          
          {/* Table rows skeleton */}
          <div className="bg-white">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div 
                key={rowIndex} 
                className={`flex p-3 ${rowIndex < rows - 1 ? 'border-b' : ''}`}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <div key={colIndex} className="flex-1 px-2">
                    <Skeleton className={`h-4 w-${Math.floor(Math.random() * 40) + 20}%`} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-20" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`border rounded-lg p-8 text-center ${className}`}>
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">
        Unable to Load Data
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {error 
          ? "We encountered an error while loading the data. Please try again later."
          : "No data is currently available to display."
        }
      </p>
      
      {error && (
        <details className="text-left mb-4 p-3 bg-gray-50 rounded-lg max-w-md mx-auto">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Error Details
          </summary>
          <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
      
      {retry && (
        <Button onClick={retry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
};

/**
 * Offline Mode Banner
 */
export const OfflineBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className={`bg-amber-50 border-l-4 border-amber-400 p-4 ${className}`}>
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-amber-400 mr-3" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            You're currently offline
          </p>
          <p className="text-sm text-amber-700">
            Some features may be limited. Your data will sync when connection is restored.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * API Error Fallback Component
 */
export const APIErrorFallback: React.FC<FallbackProps & {
  statusCode?: number;
  endpoint?: string;
}> = ({
  error,
  retry,
  statusCode,
  endpoint,
  className = ""
}) => {
  // Determine error type based on status code
  const getErrorTitle = () => {
    if (!statusCode) return "API Connection Error";
    
    switch (statusCode) {
      case 400: return "Bad Request";
      case 401: return "Authentication Required";
      case 403: return "Access Denied";
      case 404: return "Resource Not Found";
      case 406: return "Format Not Acceptable";
      case 429: return "Too Many Requests";
      case 500: return "Server Error";
      case 502: return "Gateway Error";
      case 503: return "Service Unavailable";
      case 504: return "Gateway Timeout";
      default: return statusCode >= 400 && statusCode < 500 
        ? "Client Error" 
        : "Server Error";
    }
  };
  
  // Get appropriate error message
  const getErrorMessage = () => {
    if (!statusCode) return "Unable to connect to the server. Please check your internet connection.";
    
    switch (statusCode) {
      case 400: return "The request was invalid. Please check your input and try again.";
      case 401: return "You need to be logged in to access this resource.";
      case 403: return "You don't have permission to access this resource.";
      case 404: return "The requested resource could not be found.";
      case 406: return "The server cannot produce a response in the format requested.";
      case 429: return "You've made too many requests. Please wait and try again later.";
      case 500: return "The server encountered an error. Our team has been notified.";
      case 502: return "The server received an invalid response from an upstream server.";
      case 503: return "The service is temporarily unavailable. Please try again later.";
      case 504: return "The server timed out waiting for a response. Please try again later.";
      default: return statusCode >= 400 && statusCode < 500 
        ? "There was an error with your request." 
        : "There was a server error. Please try again later.";
    }
  };
  
  // Get appropriate icon color
  const getIconColor = () => {
    if (!statusCode) return "text-amber-500";
    return statusCode >= 500 ? "text-red-500" : "text-amber-500";
  };
  
  return (
    <div className={`p-6 bg-gray-50 border rounded-lg ${className}`}>
      <div className="flex flex-col items-center text-center">
        <AlertTriangle className={`h-12 w-12 ${getIconColor()} mb-4`} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {getErrorTitle()}
        </h3>
        <p className="text-gray-600 mb-4">
          {getErrorMessage()}
        </p>
        
        {endpoint && (
          <div className="bg-gray-100 px-3 py-1 rounded text-xs text-gray-500 mb-4">
            Endpoint: {endpoint}
          </div>
        )}
        
        {error && (
          <details className="text-left mb-4 p-3 bg-gray-100 rounded-lg w-full">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}
        
        {retry && (
          <Button onClick={retry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Generic Error Fallback
 */
export const GenericErrorFallback: React.FC<FallbackProps & { 
  title?: string;
  description?: string;
}> = ({ 
  error, 
  retry, 
  title = "Something went wrong",
  description = "We encountered an unexpected error.",
  className = "" 
}) => {
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {error && (
        <details className="text-left mb-4 p-3 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Technical Details
          </summary>
          <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
            {error.message}
          </pre>
        </details>
      )}
      
      {retry && (
        <Button onClick={retry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};
/**

 * Chart Fallback Component
 */
export const ChartFallback: React.FC<FallbackProps & {
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
}> = ({
  error,
  retry,
  isLoading = false,
  chartType = 'line',
  height = 300,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div 
        className={`border rounded-lg p-4 ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="h-full flex flex-col">
          <Skeleton className="h-6 w-1/3 mb-4" />
          
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`border rounded-lg p-4 ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="h-full flex flex-col">
        <div className="mb-4">
          <Skeleton className="h-6 w-1/3" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Chart data unavailable
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {error 
                ? "We encountered an error loading the chart data."
                : "No data is currently available for this chart."
              }
            </p>
            
            {retry && (
              <Button onClick={retry} variant="outline" size="sm">
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Form Error Fallback Component
 */
export const FormErrorFallback: React.FC<FallbackProps & {
  formName?: string;
}> = ({
  error,
  retry,
  formName,
  className = ""
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-red-800">
            {formName ? `Error in ${formName}` : 'Form Error'}
          </h3>
          <p className="text-sm text-red-700 mt-1">
            {error?.message || "We encountered an error processing your request. Please try again."}
          </p>
          
          {retry && (
            <Button 
              onClick={retry} 
              variant="outline" 
              size="sm"
              className="mt-3 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};