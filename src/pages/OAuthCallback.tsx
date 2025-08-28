
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted } = useAuthContext();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth', { replace: true });
          return;
        }
        
        // Wait a bit for the auth context to update
        setTimeout(() => {
          setProcessing(false);
        }, 500);
      } catch (error) {
        console.error('OAuth callback exception:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    };

    // Handle the OAuth callback immediately
    handleCallback();
  }, [navigate]);

  useEffect(() => {
    // After processing is complete, redirect based on auth state
    if (!processing) {
      if (isAuthenticated) {
        toast.success('Welcome to CropGenius! 🌾');
        
        // Redirect based on onboarding status
        if (onboardingCompleted) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // If auth failed, go back to auth page
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    }
  }, [isAuthenticated, onboardingCompleted, processing, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
