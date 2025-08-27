
import { useAuthContext } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const { isAuthenticated, onboardingCompleted, isLoading, signInWithGoogle } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  // Already authenticated → redirect based on onboarding status
  if (isAuthenticated) {
    if (onboardingCompleted) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to CropGenius</h2>
          <p className="mt-2 text-gray-600">AI-Powered Farming for Africa</p>
        </div>
        
        <Button 
          onClick={signInWithGoogle}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
