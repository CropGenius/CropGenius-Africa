/**
 * 🔥 OAUTH CALLBACK PAGE - HANDLES GOOGLE OAUTH RESPONSE
 * 
 * HANDLES:
 * - Google OAuth tokens from Supabase
 * - Proper session establishment
 * - Redirect to dashboard after successful auth
 * - Error handling for failed OAuth attempts
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, session } = useSimpleAuthContext();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for auth provider to finish loading
    if (isLoading) {
      console.log('🔍 OAuth Callback - Still loading auth state...');
      return;
    }

    // Prevent multiple checks
    if (hasChecked) {
      console.log('🔍 OAuth Callback - Already checked, skipping...');
      return;
    }
    setHasChecked(true);

    console.log('🔍 OAuth Callback - PRODUCTION DEBUG:', {
      isAuthenticated,
      userEmail: user?.email,
      userExists: !!user,
      timestamp: new Date().toISOString(),
      location: window.location.href,
      hasSession: !!session
    });

    if (isAuthenticated && user) {
      console.log('✅ OAuth successful - User authenticated, redirecting to dashboard');
      console.log('✅ User details:', { 
        id: user.id, 
        email: user.email, 
        confirmed_at: user.email_confirmed_at,
        last_sign_in: user.last_sign_in_at 
      });
      toast.success('🎉 Welcome to CropGenius!');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('⏳ OAuth Callback - Session not ready, waiting for Supabase processing...');
      console.log('⏳ Current state:', { 
        isAuthenticated, 
        hasUser: !!user, 
        isLoading,
        currentUrl: window.location.href 
      });

      // Wait longer for session to be processed from URL hash/params
      const timeout = setTimeout(async () => {
        try {
          console.log('🔍 Final session check - Attempting manual session retrieval...');
          
          // Force session refresh from URL
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('🔍 Manual session check results:', { 
            hasSession: !!session, 
            sessionUser: session?.user?.email,
            error: error?.message,
            accessToken: session?.access_token ? 'Present' : 'Missing',
            refreshToken: session?.refresh_token ? 'Present' : 'Missing'
          });
          
          if (session && session.user) {
            console.log('✅ Session found on retry - Success! Redirecting to dashboard');
            console.log('✅ Session user details:', {
              id: session.user.id,
              email: session.user.email,
              provider: session.user.app_metadata?.provider
            });
            toast.success('🎉 Welcome to CropGenius!');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('❌ PRODUCTION OAUTH FAILURE - No session found after timeout');
            console.log('❌ Debug info:', {
              error: error?.message,
              urlFragment: window.location.hash,
              urlSearch: window.location.search,
              currentPath: window.location.pathname,
              timestamp: new Date().toISOString()
            });
            
            // Instead of immediately redirecting back to auth (infinite loop),
            // try one more manual auth check with error recovery
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            
            if (currentUser) {
              console.log('✅ RECOVERY SUCCESS - Found user on final check');
              toast.success('🎉 Welcome to CropGenius!');
              navigate('/dashboard', { replace: true });
            } else {
              console.log('❌ COMPLETE OAUTH FAILURE - Redirecting to auth with detailed error');
              toast.error('OAuth sign-in failed. Please try again.');
              navigate('/auth', { 
                replace: true, 
                state: { oauthError: true, timestamp: Date.now() } 
              });
            }
          }
        } catch (error) {
          console.error('❌ FATAL OAuth callback error:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          toast.error('Authentication error occurred. Please try signing in again.');
          navigate('/auth', { 
            replace: true, 
            state: { oauthError: true, fatalError: true } 
          });
        }
      }, 3000); // Increased timeout to 3 seconds for better session processing

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated, user, navigate, hasChecked, session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-green-700">
          {isLoading ? 'Completing sign-in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}