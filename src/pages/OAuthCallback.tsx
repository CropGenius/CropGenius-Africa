
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        toast.success('Welcome to CropGenius! 🌾');
        // SINGLE REDIRECT DECISION - NO LOOPS
        navigate(onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, onboardingCompleted, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
