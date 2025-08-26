
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth callback started');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('OAuth callback error:', error);
          toast.error('Authentication failed');
          navigate('/auth', { replace: true });
          return;
        }

        if (session?.user) {
          console.log('User authenticated successfully:', session.user.id);
          toast.success('Welcome to CropGenius! 🌾');
          navigate('/dashboard', { replace: true });
        } else {
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error('OAuth callback exception:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600">Completing authentication...</p>
      </div>
    </div>
  );
}
