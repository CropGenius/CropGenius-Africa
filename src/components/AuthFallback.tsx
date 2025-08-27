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
 * Simple Authentication Fallback - Clean error handling for auth failures
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

export default AuthFallback;
