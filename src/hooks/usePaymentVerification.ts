import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentVerificationResult {
  success: boolean;
  verified: boolean;
  transaction?: any;
  error?: string;
}

export const usePaymentVerification = (
  orderTrackingId?: string,
  onSuccess?: () => void
) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);

  const verifyPayment = useCallback(async (trackingId: string) => {
    if (!trackingId) return;

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('pesapal-verify-payment', {
        body: {
          order_tracking_id: trackingId
        }
      });

      if (error) {
        throw new Error(error.message || 'Verification failed');
      }

      setVerificationResult(data);

      if (data?.verified && data?.success) {
        toast.success('🎉 Payment verified successfully!', {
          description: 'Your CropGenius Pro features are now active.'
        });
        onSuccess?.();
        return true;
      } else {
        toast.error('Payment verification failed', {
          description: 'Please try again or contact support if payment was successful.'
        });
        return false;
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Verification error', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      setVerificationResult({
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [onSuccess]);

  // Auto-verify when orderTrackingId is provided
  useEffect(() => {
    if (orderTrackingId && !verificationResult) {
      verifyPayment(orderTrackingId);
    }
  }, [orderTrackingId, verifyPayment, verificationResult]);

  return {
    verifyPayment,
    isVerifying,
    verificationResult,
    isVerified: verificationResult?.verified || false
  };
};