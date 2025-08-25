
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth error:', error);
          toast.error('Authentication failed');
          navigate('/auth', { replace: true });
          return;
        }
        
        if (session?.user) {
          toast.success('Welcome to CropGenius! 🌾');
          // Always redirect to dashboard - simple and bulletproof
          navigate('/dashboard', { replace: true });
        } else {
          // Listen for auth state change with timeout
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              subscription.unsubscribe();
              toast.success('Welcome to CropGenius! 🌾');
              navigate('/dashboard', { replace: true });
            }
          });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            toast.error('Authentication timeout');
            navigate('/auth', { replace: true });
          }, 10000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Authentication failed');
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600">Completing authentication...</p>
      </div>
    </div>
  );
}
