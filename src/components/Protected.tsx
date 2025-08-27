
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

interface ProtectedProps {
  children: ReactNode;
}

export default function Protected({ children }: ProtectedProps) {
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  // NOT authenticated → go to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but needs onboarding → go to onboarding
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // All good → render children
  return <>{children}</>;
}
