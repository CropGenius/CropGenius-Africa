
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

// OFFICIAL Supabase OAuth Callback Handler
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Handle OAuth callback with official Supabase method
    const handleAuthCallback = () => {
      console.log('OAuth callback: Processing authentication state...');
      
      // Check for error in URL hash (Supabase error format)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        toast.error(`Authentication failed: ${errorDescription || error}`);
        navigate('/auth', { replace: true });
        return;
      }
      
      // If no error, the auth state will be handled by useAuth hook
      console.log('OAuth callback: No errors detected, waiting for auth state...');
    };

    handleAuthCallback();
  }, [navigate]);

  // Use the auth context to handle authentication state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('OAuth callback: User authenticated, redirecting to dashboard');
        toast.success('Welcome to CropGenius! 🌾');
        navigate('/dashboard', { replace: true });
      } else {
        // If not authenticated after loading, redirect to auth
        const timer = setTimeout(() => {
          console.log('OAuth callback: Authentication timeout, redirecting to auth');
          toast.error('Authentication failed. Please try again.');
          navigate('/auth', { replace: true });
        }, 5000); // 5 second timeout
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">Completing authentication...</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we sign you in</p>
      </div>
    </div>
  );
}
