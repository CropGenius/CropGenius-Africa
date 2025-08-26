
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth callback started');
        
        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Session check result:', { session: !!session, error });
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast.error('Authentication failed');
          navigate('/auth', { replace: true });
          return;
        }
        
        if (session?.user) {
          console.log('User authenticated successfully:', session.user.id);
          toast.success('Welcome to CropGenius! 🌾');
          
          // Force a complete page refresh to clear any auth state issues
          window.location.href = '/dashboard';
          return;
        }
        
        // If no session yet, wait for auth state change
        console.log('No session found, waiting for auth state change...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change in callback:', event, !!session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            subscription.unsubscribe();
            toast.success('Welcome to CropGenius! 🌾');
            
            // Force complete page refresh to dashboard
            window.location.href = '/dashboard';
          }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          console.log('OAuth callback timeout');
          toast.error('Authentication timeout');
          navigate('/auth', { replace: true });
        }, 10000);
        
      } catch (error) {
        console.error('OAuth callback exception:', error);
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
