/**
 * 🌾 CROPGENIUS – SIMPLE AUTHENTICATION FALLBACK
 * Simple, clean error handling for auth failures
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthFallbackProps {
  error?: Error | string | null;
  resetError?: () => void;
}

/**
 * Simple Authentication Fallback - No Silicon Valley Bullshit
 */
export function AuthFallback({ error, resetError }: AuthFallbackProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleSignIn = () => {
    navigate('/auth', { replace: true });
  };

  const errorMessage = error instanceof Error ? error.message : String(error || 'Authentication failed');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="flex flex-col space-y-3">
          <Button onClick={handleRetry} className="w-full" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          
          <Button onClick={handleSignIn} className="w-full">
            Go to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
      default:
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
    }
  };

  const getErrorTitle = () => {
    if (!classifiedError) return 'Authentication Error';

    switch (classifiedError.type) {
      case AuthErrorType.NETWORK_ERROR:
        return 'Connection Problem';
      case AuthErrorType.SESSION_EXPIRED:
        return 'Session Expired';
      case AuthErrorType.OAUTH_ERROR:
        return 'Sign-in Failed';
      case AuthErrorType.RATE_LIMITED:
        return 'Too Many Requests';
      default:
        return 'Authentication Error';
    }
  };

  const shouldShowRetry = () => {
    return classifiedError?.retryable !== false;
  };

  const shouldShowSignIn = () => {
    return classifiedError?.type === AuthErrorType.SESSION_EXPIRED || 
           classifiedError?.type === AuthErrorType.OAUTH_ERROR ||
           !classifiedError?.retryable;
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="mx-auto max-w-lg w-full">
         <CardHeader>
          <div className="flex items-center gap-3">
            {getErrorIcon()}
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {getErrorTitle()}
                {classifiedError && (
                  <Badge variant={classifiedError.retryable ? 'secondary' : 'destructive'}>
                    {classifiedError.retryable ? 'Retryable' : 'Action Required'}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {classifiedError?.userMessage || 'We encountered a problem with your account access'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Status */}
          <Alert className={isOnline ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
              <AlertDescription>
                {isOnline ? 'Connected to network' : 'No network connection detected'}
              </AlertDescription>
            </div>
          </Alert>

          {/* Health Status */}
          {showHealthCheck && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertDescription className="flex items-center gap-2">
                  Authentication Service: 
                  {healthStatus === 'checking' && (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                    </span>
                  )}
                  {healthStatus === 'healthy' && (
                    <span className="text-green-600 font-medium">Operational</span>
                  )}
                  {healthStatus === 'unhealthy' && (
                    <span className="text-red-600 font-medium">Service Disruption</span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Auto-retry Status */}
          {enableAutoRetry && classifiedError?.retryable && autoRetryCount > 0 && (
            <div className="text-sm text-muted-foreground">
              Auto-retry attempt {autoRetryCount} of {maxAutoRetries}
              {isRetrying && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          {shouldShowRetry() && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleManualRetry}
              disabled={isRetrying}
            >
              <RefreshCw className="h-4 w-4" />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}

          {shouldShowSignIn() && (
            <Button 
              variant="default" 
              className="w-full sm:w-auto"
              onClick={handleSignIn}
            >
              Sign In Again
            </Button>
          )}

          <Button 
            variant="ghost" 
            className="w-full sm:w-auto flex items-center gap-2"
            onClick={handleContactSupport}
          >
            <ExternalLink className="h-4 w-4" />
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthFallback;
