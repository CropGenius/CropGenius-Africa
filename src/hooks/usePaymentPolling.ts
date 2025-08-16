import { useState, useEffect, useRef } from 'react';
import { usePaymentVerification } from './usePaymentVerification';
import { useUserPlan } from './useUserPlan';

interface PaymentPollingConfig {
  orderTrackingId?: string;
  maxAttempts?: number;
  intervalMs?: number;
  onSuccess?: () => void;
}

export const usePaymentPolling = ({
  orderTrackingId,
  maxAttempts = 10,
  intervalMs = 3000,
  onSuccess
}: PaymentPollingConfig) => {
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const { refetch: refetchUserPlan } = useUserPlan();
  
  const { verifyPayment, isVerifying, isVerified } = usePaymentVerification(
    undefined,
    () => {
      // Payment verified - stop polling and refresh user plan
      stopPolling();
      refetchUserPlan();
      onSuccess?.();
    }
  );

  const startPolling = (trackingId: string) => {
    if (!trackingId || isPolling) return;
    
    setIsPolling(true);
    setAttempts(0);
    
    intervalRef.current = setInterval(async () => {
      setAttempts(prev => {
        const newAttempts = prev + 1;
        
        if (newAttempts >= maxAttempts) {
          stopPolling();
          return newAttempts;
        }
        
        // Verify payment
        verifyPayment(trackingId);
        
        return newAttempts;
      });
    }, intervalMs);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsPolling(false);
  };

  // Auto-start polling when orderTrackingId is provided
  useEffect(() => {
    if (orderTrackingId && !isPolling && !isVerified) {
      startPolling(orderTrackingId);
    }
  }, [orderTrackingId]);

  // Stop polling when verified or component unmounts
  useEffect(() => {
    if (isVerified) {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [isVerified]);

  return {
    startPolling,
    stopPolling,
    isPolling,
    attempts,
    maxAttempts,
    isVerifying,
    isVerified
  };
};