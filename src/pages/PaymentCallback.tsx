import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { useSubscription } from '@/hooks/useSubscription';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [payment, setPayment] = useState<any>(null);
  const { refreshSession } = useSimpleAuthContext();
  
  // Force subscription refresh
  useSubscription();

  // Additional function to ensure subscription is properly created
  const verifySubscription = async (paymentData: any) => {
    try {
      // Check if subscription exists in user_subscriptions
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', paymentData.user_email)
        .single();
      
      // If not, create it manually as a fallback
      if (!subData) {
        console.log('No subscription found, creating one manually');
        const planType = paymentData.amount >= 5000 ? 'annual' : 'monthly';
        const expiryDays = planType === 'annual' ? 365 : 30;
        
        await supabase
          .from('user_subscriptions')
          .upsert({
            user_email: paymentData.user_email,
            plan_type: planType,
            status: 'active',
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
          });
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
    }
  };

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    
    if (!orderTrackingId) {
      console.error('No OrderTrackingId found in URL parameters');
      setStatus('failed');
      return;
    }

    console.log('Starting payment verification for:', orderTrackingId);
    let attempts = 0;
    const maxAttempts = 20; // 60 seconds total
    
    const checkPayment = async () => {
      try {
        console.log(`Payment check attempt ${attempts + 1} for order: ${orderTrackingId}`);
        
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_tracking_id', orderTrackingId)
          .single();

        if (error) {
          console.error('Database query error:', error);
          // Don't fail immediately on database errors, keep retrying
        } else if (data) {
          console.log('Payment record found:', data);
          
          // Check for any successful status variations
          if (data.status === 'COMPLETED' || data.status === 'SUCCESS' || data.status === 'SUCCESSFUL') {
            setPayment(data);
            setStatus('success');
            
            // Immediately update localStorage
            localStorage.setItem('plan_is_pro', 'true');
            
            // Force refresh user session to make sure all context is updated
            await refreshSession();
            
            // Trigger success celebration
            confetti({
              particleCount: 200,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
            });
            
            // Update subscription data
            await verifySubscription(data);
            
            return;
          } else if (data.status === 'FAILED' || data.status === 'CANCELLED' || data.status === 'INVALID') {
            console.log('Payment failed with status:', data.status);
            setStatus('failed');
            return;
          } else {
            console.log('Payment still pending with status:', data.status);
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 3000); // Check every 3 seconds
        } else {
          console.log('Maximum attempts reached, payment verification timeout');
          setStatus('failed');
        }
      } catch (error) {
        console.error('Payment check error:', error);
        attempts++;
        
        if (attempts < maxAttempts) {
          setTimeout(checkPayment, 3000);
        } else {
          setStatus('failed');
        }
      }
    };

    checkPayment();
  }, [searchParams, refreshSession]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Confirming Payment...</h2>
          <p className="text-muted-foreground">Please wait while we activate your subscription</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-green-800">Payment Successful! 🎉</h1>
            <p className="text-green-600">
              Welcome to CropGenius Pro! Your subscription is now active.
            </p>
          </div>
          
          {payment && (
            <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Amount:</span> KES {payment.amount}</p>
                <p><span className="font-medium">Status:</span> {payment.status}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => {
                // Double-check localStorage is set before proceeding
                localStorage.setItem('plan_is_pro', 'true');
                navigate('/dashboard');
              }} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')}
              className="w-full"
            >
              Manage Subscription
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <XCircle className="h-20 w-20 text-red-500 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-red-800">Payment Verification</h1>
          <p className="text-red-600">
            We're still processing your payment. Please wait a moment or contact support if you received a confirmation email.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/upgrade')} 
            className="w-full"
          >
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;