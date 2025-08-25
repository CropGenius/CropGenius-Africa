import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// 🎯 PRODUCTION OAUTH CALLBACK - MANUAL HANDLING TO PREVENT LOOPS
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    // 🔥 CRITICAL FIX: Manually handle the hash fragment ourselves
    const handleOAuthCallback = async () => {
      try {
        // 1. Manually extract the session from URL
        const { data, error } = await supabase.auth.getSessionFromUrl();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth', { replace: true });
          return;
        }
        
        if (data?.session) {
          // Session found in URL, go to dashboard
          navigate('/dashboard', { replace: true });
        } else if (isAuthenticated) {
          // Already authenticated but no session in URL
          navigate('/dashboard', { replace: true });
        } else {
          // No session found anywhere
          navigate('/auth', { replace: true });
        }
      } catch (err) {
        console.error('Failed to process OAuth callback:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, isAuthenticated]);

  // No middleman loading screen
  return null;
}
