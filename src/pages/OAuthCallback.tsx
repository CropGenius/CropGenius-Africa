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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL fragments/params
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Successfully authenticated
          console.log('OAuth successful, redirecting to dashboard');
          toast.success('🎉 Welcome to CropGenius!');
          navigate('/dashboard');
        } else {
          // No session found, redirect back to auth
          console.log('No session found in OAuth callback');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in OAuth callback:', error);
        toast.error('Something went wrong. Please try signing in again.');
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    // Small delay to ensure URL params are processed
    const timer = setTimeout(handleAuthCallback, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="text-green-700">
          {isProcessing ? 'Completing sign-in...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}