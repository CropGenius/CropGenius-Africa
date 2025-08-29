import { supabase } from '@/integrations/supabase/client';

export interface PaymentStatus {
  status: 'loading' | 'success' | 'failed' | 'pending';
  payment?: any;
  error?: string;
}

export class PaymentVerificationService {
  private static readonly MAX_RETRIES = 15;
  private static readonly INITIAL_RETRY_INTERVAL = 2000; // 2 seconds initially
  private static readonly MAX_RETRY_INTERVAL = 5000; // Max 5 seconds
  
  static async verifyPayment(orderTrackingId: string): Promise<PaymentStatus> {
    let retries = 0;
    let currentInterval = this.INITIAL_RETRY_INTERVAL;
    
    // Starting payment verification
    
    while (retries < this.MAX_RETRIES) {
      try {
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_tracking_id', orderTrackingId)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no data

        if (error) {
          console.error(`Payment lookup failed (attempt ${retries + 1}):`, error);
          
          if (retries === this.MAX_RETRIES - 1) {
            return {
              status: 'failed',
              error: 'Payment record not found after multiple attempts'
            };
          }
        } else if (payment) {
          // Payment found
          
          if (payment.status === 'COMPLETED') {
            // Payment completed successfully
            return {
              status: 'success',
              payment
            };
          } else if (payment.status === 'FAILED' || payment.status === 'CANCELLED') {
            return {
              status: 'failed',
              payment,
              error: `Payment ${payment.status.toLowerCase()}`
            };
          } else {
            // Still pending, continue retrying with shorter intervals initially
            // Payment still pending, retrying
          }
        } else {
          // Payment record not yet created, retrying
        }

        retries++;
        
        if (retries < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, currentInterval));
          // Gradually increase retry interval but cap at MAX_RETRY_INTERVAL
          currentInterval = Math.min(currentInterval * 1.2, this.MAX_RETRY_INTERVAL);
        }
      } catch (error) {
        console.error(`Payment verification error (attempt ${retries + 1}):`, error);
        retries++;
        
        if (retries < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, currentInterval));
          currentInterval = Math.min(currentInterval * 1.2, this.MAX_RETRY_INTERVAL);
        }
      }
    }

    // Payment verification timeout, trying manual verification
    
    // Try manual verification as fallback
    try {
      const manualResult = await this.manualVerifyPayment(orderTrackingId);
      if (manualResult.success) {
        return {
          status: manualResult.payment.status === 'COMPLETED' ? 'success' : 'failed',
          payment: manualResult.payment,
          error: manualResult.payment.status !== 'COMPLETED' ? `Payment ${manualResult.payment.status.toLowerCase()}` : undefined
        };
      }
    } catch (manualError) {
      console.error('Manual verification also failed:', manualError);
    }
    
    return {
      status: 'failed',
      error: 'Payment verification timeout - please check your payment status manually or contact support'
    };
  }

  static async manualVerifyPayment(orderTrackingId: string): Promise<any> {
    // Attempting manual payment verification
    
    const { data, error } = await supabase.functions.invoke('verify-payment-status', {
      body: { orderTrackingId }
    });

    if (error) {
      console.error('Manual verification error:', error);
      throw error;
    }

    return data;
  }

  static async checkSubscriptionStatus(userEmail: string): Promise<boolean> {
    try {
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', userEmail)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Subscription check failed:', error);
        return false;
      }

      if (subscription) {
        const expiryDate = new Date(subscription.expires_at);
        const now = new Date();
        return expiryDate > now;
      }

      return false;
    } catch (error) {
      console.error('Subscription status check error:', error);
      return false;
    }
  }
}