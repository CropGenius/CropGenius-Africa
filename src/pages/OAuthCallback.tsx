
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

// 🚀 SIMPLIFIED CALLBACK - Official Supabase OAuth Flow
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    console.log('🔄 OAuth Callback - Official Supabase Flow');
    
    // In the official flow, user lands on SITE_URL (homepage)
    // Auth context will detect the session and redirect appropriately
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        console.log('✅ OAuth successful - redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('⚠️ No auth detected - redirecting to auth page');
        navigate('/auth', { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">Completing Authentication</h2>
        <p className="text-green-600 font-medium mb-4">Processing your Google sign-in...</p>
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-gray-600 text-sm">🔐 Official Supabase OAuth Flow</p>
          <p className="text-gray-600 text-sm">🌾 Redirecting to Dashboard</p>
        </div>
      </div>
    </div>
  );
}
