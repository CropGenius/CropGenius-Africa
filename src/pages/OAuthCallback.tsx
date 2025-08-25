import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

// 🎯 PRODUCTION OAUTH CALLBACK - FIXED FOR CROPGENIUS.AFRICA
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    console.log('🔄 OAuth Callback - Production Fixed for cropgenius.africa');
    
    // 🔧 PRODUCTION FIX: Handle OAuth callback properly for custom domain
    const handleOAuthCallback = async () => {
      try {
        // Give a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (isAuthenticated) {
          console.log('✅ OAuth successful - User authenticated, redirecting to dashboard');
          // 🎯 Direct redirect to dashboard for successful OAuth
          navigate('/dashboard', { replace: true });
        } else {
          console.log('⚠️ OAuth callback processed but no authentication detected');
          // Wait a bit more for auth state to update
          setTimeout(() => {
            if (isAuthenticated) {
              navigate('/dashboard', { replace: true });
            } else {
              console.log('❌ Authentication failed - redirecting to auth page');
              navigate('/auth', { replace: true });
            }
          }, 1000);
        }
      } catch (error) {
        console.error('💥 OAuth callback error:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">Completing Authentication</h2>
        <p className="text-green-600 font-medium mb-4">Processing your Google sign-in...</p>
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-gray-600 text-sm">🔐 Production OAuth - cropgenius.africa</p>
          <p className="text-gray-600 text-sm">🌾 Redirecting to Dashboard</p>
        </div>
      </div>
    </div>
  );
}
