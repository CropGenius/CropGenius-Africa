import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth/components/AuthPage';

export default function Auth() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  // Only redirect authenticated users who have completed onboarding
  // Allow users who want to see login options to stay
  if (isAuthenticated && user) {
    // Check if user has completed onboarding to decide where to redirect
    // For now, redirect to dashboard but this could be enhanced later
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPage />;
}