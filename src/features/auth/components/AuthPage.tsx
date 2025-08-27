
import { useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const AuthPage = () => {
  const { signInWithGoogle } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">🌾</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">Welcome to CropGenius</CardTitle>
          <p className="text-gray-600 mt-2">AI-Powered Farming Intelligence</p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 text-lg"
          >
            {loading ? 'Signing in...' : '🚀 Continue with Google'}
          </Button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Join thousands of farmers using AI to maximize their harvest
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
