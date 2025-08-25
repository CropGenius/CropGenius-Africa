
import { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, CheckCircle, Users, TrendingUp } from 'lucide-react';

export default function AuthResurrected() {
  const { isAuthenticated, user, isLoading, signInWithGoogle } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // 🚀 PRODUCTION FIXED - USE PROPER useAuth HOOK
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      console.log('🔑 Starting Google OAuth with proper redirect handling...');
      
      // Use the correct signInWithGoogle from useAuth hook which handles redirects properly
      await signInWithGoogle();
      // The useAuth hook handles the redirect automatically
      
    } catch (error) {
      console.error('❌ Google OAuth failed:', error);
      toast.error('Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });
        
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Check your email to confirm your account');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          toast.error('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Email auth error:', error);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-2 pt-8">
            {/* CropGenius Logo */}
            <div className="mx-auto mb-4">
              <img 
                src="/lovable-uploads/cropgeniuslogo.png" 
                alt="CropGenius Logo" 
                className="w-20 h-20 mx-auto rounded-2xl shadow-lg"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CropGenius</h1>
            <p className="text-gray-600 font-medium text-lg">AI-Powered Agriculture for 100M+ Farmers</p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-semibold text-green-800">99.7% Accuracy</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-800">Boost Yields</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-semibold text-purple-800">AI Insights</p>
              </div>
            </div>

            {/* Google Sign In Button - OFFICIAL SUPABASE FLOW */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 font-semibold py-4 mb-6 text-lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-3 text-base"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-3 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg"
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Create one"
                }
              </button>
            </div>

            {/* Feature List */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                <span>Instant crop disease detection with AI</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                <span>Real-time weather and market insights</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                <span>Personalized farming recommendations</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
