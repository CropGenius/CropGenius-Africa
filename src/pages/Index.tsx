
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { OrbitalLoader } from '@/components/ui/orbital-loader';

export default function Index() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, onboardingCompleted } = useAuthContext();
  
  // Handle OAuth callback at root with ?code parameter
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // OAuth callback happened at root, redirect to proper callback handler
      navigate('/auth/callback' + window.location.search, { replace: true });
      return;
    }
  }, [searchParams, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <OrbitalLoader message="Loading CropGenius..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/auth', { replace: true });
    return null;
  }

  if (!onboardingCompleted) {
    navigate('/onboarding', { replace: true });
    return null;
  }

  return <Dashboard />;
}
