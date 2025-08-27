
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();
  const [hasProcessed, setHasProcessed] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    const processOAuthCallback = async () => {
      if (hasProcessed) return;
      
      try {
        // First try to extract code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        // If we have a code parameter but no session yet, try to exchange it
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Code exchange error:', error);
          }
          // Wait briefly for session to be established
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        setHasProcessed(true);
        
        if (session?.user) {
          toast.success('Welcome to CropGenius! 🌾');
          // Explicitly refresh the session to ensure it's up to date
          await supabase.auth.refreshSession();
          
          // Check onboarding status
          if (onboardingCompleted) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } else if (processingTime < 5000) {
          // If no session yet and we haven't waited too long, retry after delay
          setProcessingTime(prev => prev + 1000);
          setTimeout(() => setHasProcessed(false), 1000);
        } else {
          // After waiting long enough, give up and show error
          toast.error('Authentication failed. Please try again.');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Authentication error. Please try again.');
        navigate('/auth', { replace: true });
      }
    };

    if (!isLoading && !hasProcessed) {
      processOAuthCallback();
    }
  }, [isLoading, hasProcessed, navigate, onboardingCompleted, processingTime]);

  // Show minimal loading during processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
