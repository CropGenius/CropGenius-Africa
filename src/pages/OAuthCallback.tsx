import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have an OAuth code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // The session should be automatically handled by Supabase auth state listener
          // We just need to wait for the auth context to update
          console.log('OAuth callback received, waiting for auth context update');
          
          // Wait for auth context to update
          setTimeout(() => {
            setProcessing(false);
          }, 1000);
        } else {
          // No code in URL, skip processing
          setProcessing(false);
        }
      } catch (error) {
        console.error('OAuth callback exception:', error);
        toast.error('Authentication failed. Please try again.');
        setProcessing(false);
      }
    };

    // Handle OAuth callback when component mounts
    handleOAuthCallback();
  }, []);

  useEffect(() => {
    // Redirect based on auth state after processing is complete
    if (!processing) {
      // Wait for auth context to finish loading
      if (isLoading) return;
      
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
  }, [isAuthenticated, onboardingCompleted, isLoading, processing, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}