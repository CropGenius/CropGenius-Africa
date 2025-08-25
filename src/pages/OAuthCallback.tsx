
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
          // Check onboarding status before redirecting
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', session.user.id)
            .single();
          
          if (profile?.onboarding_completed) {
            toast.success('Welcome back to CropGenius! 🌾');
            navigate('/dashboard', { replace: true });
          } else {
            toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
            navigate('/onboarding', { replace: true });
          }
        } else {
          // Listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              subscription.unsubscribe();
              
              // Check onboarding status
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('onboarding_completed')
                .eq('user_id', session.user.id)
                .single();
              
              if (profile?.onboarding_completed) {
                toast.success('Welcome back to CropGenius! 🌾');
                navigate('/dashboard', { replace: true });
              } else {
                toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
                navigate('/onboarding', { replace: true });
              }
            }
          });
          
          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            navigate('/auth', { replace: true });
          }, 10000);
        }
      } catch (error) {
        console.error('Callback error:', error);
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
