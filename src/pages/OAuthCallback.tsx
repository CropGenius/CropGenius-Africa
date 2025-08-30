import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Loader2 } from 'lucide-react';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSimpleAuthContext();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Session is valid, redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session, redirect to auth
          navigate('/auth');
        }
      } catch (err) {
        console.error('Error handling OAuth callback:', err);
        navigate('/auth');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  // Show loading spinner while handling callback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-green-700">Completing authentication...</p>
      </div>
    </div>
  );
}