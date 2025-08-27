
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();

  useEffect(() => {
    // Simple, direct redirect logic - no delays or complex processing
    if (!isLoading) {
      if (isAuthenticated) {
        toast.success('Welcome to CropGenius! 🌾');
        
        if (onboardingCompleted) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // If auth failed, go back to auth page
        navigate('/auth', { replace: true });
      }
    }
  }, [isAuthenticated, onboardingCompleted, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
