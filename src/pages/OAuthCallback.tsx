
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// 🚀 BULLETPROOF SUPABASE OAUTH CALLBACK - NO MORE INFINITE LOOPS!
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();
  const [hasProcessedCallback, setHasProcessedCallback] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const processOAuthCallback = async () => {
      if (hasProcessedCallback) return;
      
      console.log('🔍 Processing OAuth callback...');
      setHasProcessedCallback(true);
      
      // 🔍 Check for OAuth errors in URL first
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);
      
      const error = hashParams.get('error') || searchParams.get('error');
      const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
      
      if (error) {
        console.error('🚨 OAuth error detected:', error, errorDescription);
        toast.error(`Authentication failed: ${errorDescription || error}`);
        if (mounted) {
          navigate('/auth', { replace: true });
        }
        return;
      }
      
      // 🎯 Check if we have OAuth tokens in the URL
      const hasOAuthTokens = hashParams.has('access_token') || hashParams.has('refresh_token');
      
      if (hasOAuthTokens) {
        console.log('✅ OAuth tokens detected, waiting for Supabase to process...');
        
        // 🚀 Give Supabase time to process the OAuth tokens (detectSessionInUrl: true)
        // This is critical - Supabase needs time to extract tokens from URL and establish session
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 🔄 Trigger a session refresh to ensure we get the latest state
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('❌ Session refresh error:', sessionError);
            toast.error('Authentication failed. Please try again.');
            if (mounted) {
              navigate('/auth', { replace: true });
            }
            return;
          }
          
          if (session?.user) {
            console.log('🎉 OAuth successful! User authenticated:', session.user.id);
            toast.success('Welcome to CropGenius! 🌾');
            if (mounted) {
              navigate('/dashboard', { replace: true });
            }
            return;
          }
        } catch (error) {
          console.error('💥 Session processing failed:', error);
        }
      }
      
      console.log('⚠️ No OAuth tokens found or session not established');
    };
    
    processOAuthCallback();
    
    return () => {
      mounted = false;
    };
  }, [navigate, hasProcessedCallback]);

  // 🎯 Fallback: Monitor auth context changes
  useEffect(() => {
    if (!isLoading && hasProcessedCallback) {
      if (isAuthenticated) {
        console.log('🎉 Auth context updated - user authenticated, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (!processingTimeout) {
        // ⏱️ Longer timeout for OAuth processing (10 seconds)
        setProcessingTimeout(true);
        const timer = setTimeout(() => {
          console.log('⚠️ OAuth processing timeout - redirecting to auth');
          toast.error('Authentication timed out. Please try again.');
          navigate('/auth', { replace: true });
        }, 10000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, navigate, hasProcessedCallback, processingTimeout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">Completing Authentication</h2>
        <p className="text-green-600 font-medium mb-4">Processing your Google sign-in...</p>
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-gray-600 text-sm">🔐 Securing your session</p>
          <p className="text-gray-600 text-sm">🌾 Preparing your dashboard</p>
          <p className="text-gray-500 text-xs mt-2">This may take a few moments...</p>
        </div>
      </div>
    </div>
  );
}
