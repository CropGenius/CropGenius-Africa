import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentVerificationService, PaymentStatus } from '@/services/paymentVerification';
import confetti from 'canvas-confetti';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' });
  const [verificationMessage, setVerificationMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');
    
    if (!orderTrackingId) {
      setPaymentStatus({ 
        status: 'failed', 
        error: 'Missing payment tracking ID' 
      });
      return;
    }

    const verifyPayment = async () => {
      setVerificationMessage('Connecting to payment system...');
      
      try {
        const result = await PaymentVerificationService.verifyPayment(orderTrackingId);
        
        setPaymentStatus(result);
        
        if (result.status === 'success') {
          setVerificationMessage('Payment confirmed! 🎉');
          confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
          });
        } else if (result.status === 'failed') {
          setVerificationMessage(result.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setPaymentStatus({ 
          status: 'failed', 
          error: 'Verification system error' 
        });
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (paymentStatus.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="text-center space-y-4 max-w-md mx-auto p-8">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <Clock className="h-6 w-6 text-primary/60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold">Verifying Payment</h2>
          <p className="text-muted-foreground">{verificationMessage}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">What's happening?</p>
            <p>We're confirming your payment with Pesapal and activating your subscription. This usually takes 10-30 seconds.</p>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus.status === 'success') {
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
          
          {paymentStatus.payment && (
            <div className="bg-white rounded-lg p-4 border border-green-200 text-left">
              <h3 className="font-semibold mb-2">Payment Details:</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Amount:</span> KES {paymentStatus.payment.amount}</p>
                {paymentStatus.payment.payment_method && (
                  <p><span className="font-medium">Method:</span> {paymentStatus.payment.payment_method}</p>
                )}
                {paymentStatus.payment.confirmation_code && (
                  <p><span className="font-medium">Reference:</span> {paymentStatus.payment.confirmation_code}</p>
                )}
                <p><span className="font-medium">Status:</span> {paymentStatus.payment.status}</p>
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
          <h1 className="text-3xl font-bold text-red-800">Payment Issue</h1>
          <p className="text-red-600">
            {paymentStatus.error || 'We couldn\'t verify your payment. Please try again.'}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <p className="font-medium mb-1">Need help?</p>
            <p>If you received a payment confirmation email from Pesapal, please contact our support team with your transaction reference.</p>
          </div>
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