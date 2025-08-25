import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

// 🎯 DIRECT OAUTH CALLBACK - NO FAKE PROCESSING SCREEN
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, refreshSession } = useAuthContext();

  useEffect(() => {
    // 🔥 IMMEDIATE REDIRECT - NO PROCESSING
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 🎯 NO FAKE LOADING SCREEN - DIRECT REDIRECT
  return null;
}
