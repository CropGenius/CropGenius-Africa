import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '@/services/pesapal';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    
    if (!orderTrackingId) {
      setStatus('failed');
      return;
    }

    const verifyPayment = async () => {
      try {
        const result = await checkPaymentStatus(orderTrackingId);
        setPaymentDetails(result);
        
        if (result.status === 'COMPLETED') {
          setStatus('success');
          // Trigger celebration
          confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
          });
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <h2 className="text-2xl font-bold">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
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
          
          {paymentDetails && (
            <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Amount:</span> KES {paymentDetails.amount}</p>
                <p><span className="font-medium">Method:</span> {paymentDetails.payment_method}</p>
                <p><span className="font-medium">Reference:</span> {paymentDetails.confirmation_code}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
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
          <h1 className="text-3xl font-bold text-red-800">Payment Failed</h1>
          <p className="text-red-600">
            We couldn't process your payment. Please try again.
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