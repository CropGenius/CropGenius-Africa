import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized } = useAuthContext();

  useEffect(() => {
    // Wait for auth to be fully initialized before making decisions
    if (!authInitialized) return;

    if (isAuthenticated) {
      toast.success('Welcome to CropGenius! 🌾');
      
      // Zero-friction access - always redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // If auth failed after initialization, go back to auth page
      toast.error('Authentication failed. Please try again.');
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authInitialized, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
    </div>
  );
}