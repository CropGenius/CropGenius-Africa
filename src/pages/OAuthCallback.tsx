
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();
  const [processingAuth, setProcessingAuth] = useState(true);

  // ACTIVE SESSION EXTRACTION - Explicitly process the auth code
  useEffect(() => {
    async function processAuthCode() {
      try {
        // 1. Get the URL hash or query parameters containing auth info
        const url = window.location.href;
        const hasAuthCode = url.includes('code=');
        
        if (hasAuthCode) {
          // 2. Explicitly exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(url);
          
          if (error) {
            console.error('Auth code exchange error:', error);
            toast.error('Authentication failed. Please try again.');
            navigate('/auth', { replace: true });
            return;
          }

          if (data.session) {
            // Force session refresh
            await supabase.auth.getSession();
            toast.success('Welcome to CropGenius! 🌾');
            // Short timeout to ensure auth state updates
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 100);
            return;
          }
        }

        // Fallback to standard auth state check
        setProcessingAuth(false);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setProcessingAuth(false);
      }
    }

    processAuthCode();
  }, [navigate]);

  // Fallback to standard auth check if direct code processing didn't work
  useEffect(() => {
    if (!isLoading && !processingAuth) {
      if (isAuthenticated) {
        toast.success('Welcome to CropGenius! 🌾');
        // SINGLE REDIRECT DECISION - NO LOOPS
        navigate(onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, onboardingCompleted, navigate, processingAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
