
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import AuthResurrected from './AuthResurrected';

export default function Auth() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);

  console.log('Auth page state:', { isLoading, isAuthenticated, hasCheckedAuth, userId: user?.id });

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  // Only redirect if we are absolutely certain the user is authenticated
  if (isAuthenticated && user && hasCheckedAuth) {
    console.log('Auth page: redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthResurrected />;
}
