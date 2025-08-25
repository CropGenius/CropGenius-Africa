
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('OAuth callback: Processing authentication...');
        
        // Check for error in URL params
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (error) {
          console.error('OAuth error in URL:', error, errorDescription);
          toast.error('Authentication failed: ' + (errorDescription || error));
          navigate('/auth', { replace: true });
          return;
        }
        
        // Wait for Supabase to process the OAuth callback
        console.log('Waiting for session to be established...');
        
        // Give Supabase a moment to process the URL fragments
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          toast.error('Authentication failed');
          navigate('/auth', { replace: true });
          return;
        }
        
        if (session?.user) {
          console.log('OAuth callback: User authenticated successfully:', session.user.id);
          toast.success('Welcome to CropGenius! 🌾');
          
          // Use React Router navigation instead of window.location
          navigate('/dashboard', { replace: true });
          return;
        }
        
        // If no session yet, set up a one-time listener
        console.log('No session found, setting up auth state listener...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change in callback:', event, !!session);
            
            if (event === 'SIGNED_IN' && session?.user) {
              subscription.unsubscribe();
              console.log('OAuth callback: User signed in via listener:', session.user.id);
              toast.success('Welcome to CropGenius! 🌾');
              navigate('/dashboard', { replace: true });
            } else if (event === 'SIGNED_OUT') {
              subscription.unsubscribe();
              console.log('OAuth callback: User signed out');
              navigate('/auth', { replace: true });
            }
          }
        );
        
        // Timeout after 8 seconds to prevent hanging
        setTimeout(() => {
          subscription.unsubscribe();
          console.log('OAuth callback: Timeout reached');
          
          // Check one more time for session
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              navigate('/dashboard', { replace: true });
            } else {
              toast.error('Authentication timeout. Please try again.');
              navigate('/auth', { replace: true });
            }
          });
        }, 8000);
        
      } catch (error) {
        console.error('OAuth callback exception:', error);
        toast.error('Authentication failed');
        navigate('/auth', { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  if (!isProcessing) {
    return null; // Component will be unmounted due to navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Completing authentication...</p>
        <p className="text-gray-500 text-sm mt-2">This should only take a moment</p>
      </div>
    </div>
  );
}
