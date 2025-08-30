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
    // Wait for auth provider to finish loading (now properly waits for OAuth processing)
    if (isLoading) {
      console.log('🔍 OAuth Callback - Waiting for Supabase to process OAuth tokens...');
      return;
    }

    // Prevent multiple redirects
    if (hasChecked) {
      return;
    }
    setHasChecked(true);

    console.log('🔍 OAuth Callback - Auth processing complete:', { 
      isAuthenticated, 
      userEmail: user?.email 
    });

    if (isAuthenticated && user) {
      console.log('✅ OAuth successful - Redirecting to dashboard');
      toast.success('🎉 Welcome to CropGenius!');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('❌ OAuth failed - Redirecting back to auth');
      toast.error('Authentication failed. Please try again.');
      navigate('/auth', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate, hasChecked]);

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