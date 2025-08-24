import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent double processing
    if (hasProcessed) return;
    setHasProcessed(true);

    const handleCallback = async () => {
      try {
        // Extract error from URL params first
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
          console.error('OAuth URL error:', error, errorDescription);
          toast.error(`Authentication failed: ${errorDescription || error}`);
          navigate('/auth', { replace: true });
          return;
        }

        // Check if we have access token in the hash
        const hash = window.location.hash;
        if (!hash.includes('access_token')) {
          console.warn('No access token found in callback URL');
          toast.error('Authentication incomplete. Please try again.');
          navigate('/auth', { replace: true });
          return;
        }

        // Wait briefly for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed');
          navigate('/auth', { replace: true });
          return;
        }
        
        if (session?.user) {
          console.log('User authenticated successfully:', session.user.email);
          
          // Check onboarding status before redirecting
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('onboarding_completed')
              .eq('user_id', session.user.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Profile fetch error:', profileError);
            }
            
            if (profile?.onboarding_completed) {
              toast.success('Welcome back to CropGenius! 🌾');
              navigate('/dashboard', { replace: true });
            } else {
              toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
              navigate('/onboarding', { replace: true });
            }
          } catch (profileError) {
            console.error('Profile check failed:', profileError);
            // Default to onboarding if profile check fails
            toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
            navigate('/onboarding', { replace: true });
          }
        } else {
          console.log('No session found, listening for auth state change...');
          
          // Listen for auth state change with timeout
          let timeoutId: NodeJS.Timeout;
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('Auth state changed - user signed in:', session.user.email);
              subscription.unsubscribe();
              clearTimeout(timeoutId);
              
              try {
                // Check onboarding status
                const { data: profile, error: profileError } = await supabase
                  .from('user_profiles')
                  .select('onboarding_completed')
                  .eq('user_id', session.user.id)
                  .single();
                  
                if (profileError && profileError.code !== 'PGRST116') {
                  console.error('Profile fetch error:', profileError);
                }
                
                if (profile?.onboarding_completed) {
                  toast.success('Welcome back to CropGenius! 🌾');
                  navigate('/dashboard', { replace: true });
                } else {
                  toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
                  navigate('/onboarding', { replace: true });
                }
              } catch (profileError) {
                console.error('Profile check failed:', profileError);
                // Default to onboarding if profile check fails
                toast.success('Welcome to CropGenius! Let\'s get you set up 🌾');
                navigate('/onboarding', { replace: true });
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out during callback');
              subscription.unsubscribe();
              clearTimeout(timeoutId);
              navigate('/auth', { replace: true });
            }
          });
          
          // Timeout after 15 seconds
          timeoutId = setTimeout(() => {
            console.log('Auth callback timeout reached');
            subscription.unsubscribe();
            toast.error('Authentication timed out. Please try again.');
            navigate('/auth', { replace: true });
          }, 15000);
        }
      } catch (error) {
        console.error('Callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, hasProcessed]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 text-lg mb-2">Completing authentication...</p>
        <p className="text-gray-600 text-sm">This should only take a moment</p>
      </div>
    </div>
  );
}