import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseAuthError } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import GoogleIcon from '@/components/icons/GoogleIcon';

interface SignupPageProps {
  onToggle: () => void;
}

export const SignupPage = ({ onToggle }: SignupPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        // You can add additional user metadata here if needed
        // data: { full_name: 'John Doe' }
      }
    });

    if (error) {
      setError(mapSupabaseAuthError(error));
    } else if (data.user && !data.session) {
      // This means email confirmation is required
      setMessage('Please check your email to confirm your account.');
    }
    // On success with auto-confirmation, the AuthProvider will handle the redirect.
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Force localhost in development to bypass DNS redirects
    const redirectUrl = import.meta.env.DEV 
      ? 'http://localhost:8081/auth/callback'
      : `${window.location.origin}/auth/callback`;
      
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      },
    });
    setLoading(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSignup}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert>
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
       <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <div>
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={loading}>
          <GoogleIcon className="mr-2 h-4 w-4" /> Google
        </Button>
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">
        Already a member?{' '}
        <button type="button" onClick={onToggle} className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </button>
      </p>
    </form>
  );
};
