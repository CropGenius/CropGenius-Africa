import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted } = useAuthContext();

  useEffect(() => {
    // Direct redirect based on auth state and onboarding completion
    if (isAuthenticated) {
      toast.success('Welcome to CropGenius! 🌾');
      
      // Redirect to onboarding if onboarding not completed
      if (!onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        // Redirect to dashboard if onboarding completed
        navigate('/dashboard', { replace: true });
      }
    } else {
      // If auth failed, go back to auth page
      toast.error('Authentication failed. Please try again.');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, onboardingCompleted, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}