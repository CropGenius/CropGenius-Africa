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

        // Method 1: If code is in query params (most likely scenario based on logs)
        const params = new URLSearchParams(window.location.search);
        const codeFromParams = params.get('code');

        // Method 2: If using hash-based flow (original Supabase approach)
        let authCode = codeFromParams;

        if (!authCode && window.location.hash) {
          try {
            // Try to exchange using the full hash as Supabase might handle it
            const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.hash);
            if (!error && data) {
              await refreshSession();
              console.log('✅ Hash-based OAuth successful!');
              navigate('/dashboard', { replace: true });
              return;
            }
          } catch (hashError) {
            console.warn('Hash-based exchange failed, trying code-only approach', hashError);
          }
        }

        if (!authCode) {
          console.error('❌ No auth code found in URL');
          navigate('/auth', { replace: true });
          return;
        }

        // Direct code exchange
        console.log('🔑 Exchanging auth code for session:', authCode);
        const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
          
        if (error) {
          console.error('❌ OAuth code exchange error:', error);
          navigate('/auth', { replace: true });
          return;
        }
          
        // Ensure we have a session
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
