
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();

  useEffect(() => {
    // Give Supabase a moment to process the callback
    const timer = setTimeout(() => {
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
    }, 1000); // 1 second delay to allow auth processing

    return () => clearTimeout(timer);
  }, [isAuthenticated, onboardingCompleted, isLoading, navigate]);

  // NO FAKE LOADING SCREEN - just return null for silent redirect
  return null;
}
