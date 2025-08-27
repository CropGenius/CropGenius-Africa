
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();

  useEffect(() => {
    // IMMEDIATE redirect - no artificial delays
    if (!isLoading) {
      if (isAuthenticated) {
        toast.success('Welcome to CropGenius! 🌾');
        if (onboardingCompleted) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // Auth failed, redirect to login
        navigate('/auth', { replace: true });
      }
    }
  }, [isAuthenticated, onboardingCompleted, isLoading, navigate]);

  // Silent redirect - no UI interference
  return null;
}
