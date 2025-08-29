
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { OrbitalLoader } from '@/components/ui/orbital-loader';

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Check for OAuth callback parameters (code, state, error)
    const searchParams = new URLSearchParams(location.search);
    const hasOAuthCode = searchParams.has('code') || searchParams.has('error');
    
    if (hasOAuthCode) {
      // Redirect OAuth responses to proper callback handler
      navigate(`/auth/callback${location.search}`, { replace: true });
      return;
    }

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, isAuthenticated, navigate]);

  // Show loading while determining authentication state or handling OAuth
  if (isLoading || new URLSearchParams(location.search).has('code')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <OrbitalLoader message="Loading CropGenius..." />
      </div>
    );
  }

  // Unauthenticated users see the auth page
  if (!isAuthenticated) {
    navigate('/auth', { replace: true });
    return null;
  }

  return null;
}
