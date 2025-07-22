/**
 * 🔥 CROPGENIUS ERROR FALLBACK COMPONENTS
 * Production-ready fallback UI components for different error scenarios
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Database, Shield, Bug, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
}

/**
 * Generic Error Fallback Component
 */
export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  reset,
  title = "Something went wrong",
  description = "We encountered an unexpected error. Please try again.",
  showDetails = false
}) => {
  return (
    <Card className="border-red-200 bg-red-50 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-red-700 mb-4">{description}</p>
        {showDetails && error && (
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-red-600 mb-2">
              Technical Details
            </summary>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
              {error.message}
            </pre>
          </details>
        )}
      </CardContent>
      {reset && (
        <CardFooter className="justify-center">
          <Button 
            onClick={reset}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Network Error Fallback
 */
export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = ({ reset }) => {
  const isOnline = navigator.onLine;
  
  return (
    <Card className="border-orange-200 bg-orange-50 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          {isOnline ? <Wifi className="h-6 w-6 text-orange-600" /> : <WifiOff className="h-6 w-6 text-orange-600" />}
        </div>
        <CardTitle className="text-orange-800">
          {isOnline ? 'Connection Problem' : 'No Internet Connection'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-orange-700 mb-4">
          {isOnline 
            ? 'Unable to connect to our servers. Please check your connection and try again.'
            : 'Please check your internet connection and try again.'
          }
        </p>
      </CardContent>
      {reset && (
        <CardFooter className="justify-center">
          <Button 
            onClick={reset}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Database Error Fallback
 */
export const DatabaseErrorFallback: React.FC<ErrorFallbackProps> = ({ reset }) => {
  return (
    <Card className="border-blue-200 bg-blue-50 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-blue-800">Data Unavailable</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-blue-700 mb-4">
          We're having trouble accessing your farm data right now. This is usually temporary.
        </p>
      </CardContent>
      {reset && (
        <CardFooter className="justify-center">
          <Button 
            onClick={reset}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Data
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

/**
 * Authentication Error Fallback
 */
export const AuthErrorFallback: React.FC<ErrorFallbackProps> = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border-purple-200 bg-purple-50 max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-purple-600" />
        </div>
        <CardTitle className="text-purple-800">Authentication Required</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-purple-700 mb-4">
          You need to sign in to access this feature. Your session may have expired.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * Page Not Found Fallback
 */
export const PageNotFoundFallback: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="text-gray-400 mb-6">
        <AlertTriangle size={64} />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button onClick={() => navigate('/')}>
        <Home className="mr-2 h-4 w-4" />
        Go Home
      </Button>
    </div>
  );
};

/**
 * Component Loading Error Fallback
 */
export const ComponentLoadingErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  reset,
  title = "Component Error"
}) => {
  return (
    <div className="border border-yellow-300 bg-yellow-50 p-4 rounded-md">
      <div className="flex items-center mb-2">
        <Bug className="h-5 w-5 text-yellow-700 mr-2" />
        <h3 className="font-medium text-yellow-700">{title}</h3>
      </div>
      <p className="text-yellow-700 text-sm mb-3">
        This component failed to load properly.
      </p>
      {reset && (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={reset}
          className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          Reload Component
        </Button>
      )}
    </div>
  );
};

/**
 * Critical System Error Fallback
 */
export const CriticalErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <Card className="border-red-300 bg-white max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-800 text-xl">Critical System Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-700 mb-4">
            CropGenius encountered a critical error and needs to restart. 
            Your data is safe, but some features may be temporarily unavailable.
          </p>
          <p className="text-sm text-red-600 mb-4">
            Our team has been automatically notified and is working on a fix.
          </p>
          {error && (
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-sm text-red-600 mb-2">
                Error Details
              </summary>
              <pre className="text-xs bg-red-100 p-2 rounded overflow-auto max-h-32 text-red-800">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter className="justify-center space-x-2">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart App
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

/**
 * Offline Mode Fallback
 */
export const OfflineFallback: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-4">
      <div className="flex items-center">
        <WifiOff className="h-5 w-5 text-gray-400 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-gray-800">Offline Mode</h3>
          <p className="text-sm text-gray-600">
            You're currently offline. Some features may be limited.
          </p>
        </div>
      </div>
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};