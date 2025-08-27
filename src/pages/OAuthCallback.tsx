
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, onboardingCompleted, isLoading } = useAuthContext();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    const processOAuthCallback = async () => {
      if (hasProcessed) return;
      
      // Give Supabase time to process the OAuth session from URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to get session after processing time
      const { data: { session } } = await supabase.auth.getSession();
      
      setHasProcessed(true);
      
      if (session?.user) {
        toast.success('Welcome to CropGenius! 🌾');
        // Check onboarding from session or context
        if (onboardingCompleted) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } else {
        // Auth failed after processing time
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    };

    if (!isLoading && !hasProcessed) {
      processOAuthCallback();
    }
  }, [isLoading, hasProcessed, navigate, onboardingCompleted]);

  // Show minimal loading during processing
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}
