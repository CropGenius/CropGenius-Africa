
import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import AuthResurrected from './AuthResurrected';

export default function Auth() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthResurrected />;
}
