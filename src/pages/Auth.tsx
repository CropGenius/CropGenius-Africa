
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import AuthResurrected from './AuthResurrected';

export default function Auth() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Give auth system time to initialize
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  console.log('Auth page state:', { isLoading, isAuthenticated, hasChecked, userId: user?.id });

  // Show loading until we've checked auth state
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    console.log('✅ User authenticated - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Show auth form for non-authenticated users
  return <AuthResurrected />;
}
