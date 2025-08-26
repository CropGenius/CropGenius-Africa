
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

interface ProtectedProps {
  children: ReactNode;
}

let redirectCount = 0;
const MAX_REDIRECTS = 3;

export default function Protected({ children }: ProtectedProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuthContext();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    redirectCount = 0;
  }, [location.pathname]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!isAuthenticated) {
        if (redirectCount < MAX_REDIRECTS) {
          redirectCount++;
          setShouldRedirect(true);
        } else {
          console.error('Too many auth redirects, stopping to prevent loop');
        }
      } else {
        setShouldRedirect(false);
      }
    }
  }, [isAuthenticated, isLoading, isInitialized]);

  console.log('Protected component state:', { 
    isLoading, 
    isAuthenticated, 
    isInitialized,
    redirectCount,
    shouldRedirect,
    pathname: location.pathname 
  });

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (shouldRedirect && redirectCount <= MAX_REDIRECTS) {
    console.log('Protected: redirecting unauthenticated user to auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (redirectCount > MAX_REDIRECTS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-6">
          <h1 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-red-600 mb-4">Too many redirects detected. Please refresh the page.</p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
