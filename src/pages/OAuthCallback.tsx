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
        
        // Check if there's a code in the URL query parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          console.error('❌ No auth code found in URL');
          navigate('/auth', { replace: true });
          return;
        }

        // Explicitly construct the full URL that Supabase needs for PKCE flow
        // This ensures both code and code_verifier are properly provided
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
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
          console.error('❌ OAuth token exchange failed:', err);
          navigate('/auth', { replace: true });
        }
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
