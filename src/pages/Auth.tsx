import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { simpleAuth } from '@/lib/simpleAuth';
import { mapSupabaseAuthError } from '@/features/auth/services/authService';
import { Sprout, Satellite, TrendingUp, Users, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { isAuthenticated, user, isLoading, signInWithGoogle } = useAuthContext();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isAuthenticated && user && !checkingOnboarding) {
        setCheckingOnboarding(true);

        try {
          const { data } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('user_id', user.id)
            .single();
          
          setNeedsOnboarding(!data?.onboarding_completed);
        } catch (error) {
          setNeedsOnboarding(true);
        } finally {
          setCheckingOnboarding(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, checkingOnboarding]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (isSignUp) {
        result = await simpleAuth.signUp(email, password);
        if (!result.error && result.data.user && !result.data.session) {
          toast.success('Please check your email to confirm your account.');
          setIsSignUp(false);
          setLoading(false);
          return;
        }
      } else {
        result = await simpleAuth.signIn(email, password);
      }

      if (result.error) {
        setError(mapSupabaseAuthError(result.error));
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? "/onboarding" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🌾</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              <span className="text-green-600">CROP</span>GENIUS
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-Powered Agricultural Intelligence Platform for African Farmers
            </p>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto">
              Transform your farming with satellite insights, crop disease detection, 
              weather intelligence, and market data - all in your pocket.
            </p>
          </div>

          {/* Problem Statement & Value Props */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Satellite className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Satellite Field Intelligence</h3>
              <p className="text-sm text-gray-600">NDVI analysis and yield prediction using real satellite data</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Sprout className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Disease Detection</h3>
              <p className="text-sm text-gray-600">99.7% accurate crop disease identification with treatment plans</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Market Intelligence</h3>
              <p className="text-sm text-gray-600">Real-time crop prices and optimal selling recommendations</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Support</h3>
              <p className="text-sm text-gray-600">24/7 agricultural expertise via WhatsApp integration</p>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="max-w-md mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {showEmailAuth 
                    ? (isSignUp ? 'Create Your Account' : 'Welcome Back') 
                    : 'Get Started Today'
                  }
                </CardTitle>
                <p className="text-gray-600">
                  {showEmailAuth 
                    ? (isSignUp ? 'Join thousands of farmers using CropGenius' : 'Sign in to access your farm intelligence') 
                    : 'Join thousands of farmers transforming their yields'
                  }
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!showEmailAuth ? (
                  <>
                    {/* Primary Google Sign In */}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 text-lg shadow-lg"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Continue with Google
                        </div>
                      )}
                    </Button>
                    
                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">or</span>
                      </div>
                    </div>
                    
                    {/* Email Option */}
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-300 hover:border-green-500 py-6 text-lg"
                      onClick={() => setShowEmailAuth(true)}
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" />
                        Continue with Email
                      </div>
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email address</Label>
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 py-3"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 py-3 pr-10"
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            {isSignUp ? 'Creating account...' : 'Signing in...'}
                          </div>
                        ) : (
                          isSignUp ? 'Create Account' : 'Sign In'
                        )}
                      </Button>
                    </form>
                    
                    {/* Toggle Sign Up/Sign In */}
                    <p className="text-center text-sm text-gray-600">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                      <button
                        type="button"
                        onClick={() => {setIsSignUp(!isSignUp); setError(null);}}
                        className="font-medium text-green-600 hover:text-green-500"
                      >
                        {isSignUp ? 'Sign in' : 'Sign up'}
                      </button>
                    </p>
                    
                    {/* Back to Google Option */}
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {setShowEmailAuth(false); setError(null);}}
                    >
                      ← Back to Google Sign In
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Trusted by over <span className="font-semibold text-green-600">10,000+</span> farmers across Africa
            </p>
            <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
              <span>🔒 Enterprise Security</span>
              <span>📱 Offline-First Design</span>
              <span>🌍 Available in Multiple Languages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}