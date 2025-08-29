import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Direct redirect based on auth state - no processing delays
    if (isAuthenticated) {
      toast.success('Welcome to CropGenius! 🌾');
      
      // Bypass onboarding completely - redirect all authenticated users directly to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // If auth failed, go back to auth page
      toast.error('Authentication failed. Please try again.');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}