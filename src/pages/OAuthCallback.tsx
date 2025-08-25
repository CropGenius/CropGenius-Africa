
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// 🚀 ULTRA-SIMPLE OFFICIAL SUPABASE OAUTH CALLBACK
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // 🔍 Check for OAuth errors in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      console.error('🚨 OAuth error:', error, errorDescription);
      toast.error(`Authentication failed: ${errorDescription || error}`);
      navigate('/auth', { replace: true });
      return;
    }
    
    console.log('✅ OAuth callback: No errors detected');
  }, [navigate]);

  // 🎯 Use auth context to handle authentication state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('🎉 User authenticated, redirecting to dashboard');
        toast.success('Welcome to CropGenius! 🌾');
        navigate('/dashboard', { replace: true });
      } else {
        // ⏱️ Timeout after 5 seconds
        const timer = setTimeout(() => {
          console.log('⚠️ Authentication timeout');
          toast.error('Authentication failed. Please try again.');
          navigate('/auth', { replace: true });
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Completing authentication...</p>
        <p className="text-gray-500 text-sm mt-2">Almost there! 🚀</p>
      </div>
    </div>
  );
}
