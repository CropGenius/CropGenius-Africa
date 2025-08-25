import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// 🎯 PRODUCTION OAUTH CALLBACK - FIXED IMPLEMENTATION
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshSession } = useAuthContext();

  useEffect(() => {
    // 🔥 CRITICAL FIX: Use the correct Supabase exchange process
    const handleOAuthCallback = async () => {
      try {
        // Log the current URL for debugging
        console.log('🔍 OAuthCallback processing URL:', window.location.href);
        
        // 1. Exchange the auth code for a session
        // This method does multiple things:
        // - Extracts code from URL
        // - Exchanges code for session
        // - Sets the session in the client
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.hash);
        
        if (error) {
          console.error('❌ OAuth code exchange error:', error);
          navigate('/auth', { replace: true });
          return;
        }
        
        // Ensure we have a session by refreshing it
        await refreshSession();
        
        console.log('✅ OAuth authentication successful!');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('💥 Failed to process OAuth callback:', err);
        navigate('/auth', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, refreshSession]);

  // No loading screen - we redirect immediately
  return null;
}
