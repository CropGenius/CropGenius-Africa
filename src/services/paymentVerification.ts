import { supabase } from '@/integrations/supabase/client';

export interface PaymentStatus {
  status: 'loading' | 'success' | 'failed' | 'pending';
  payment?: any;
  error?: string;
}

export class PaymentVerificationService {
  private static readonly MAX_RETRIES = 10;
  private static readonly RETRY_INTERVAL = 3000; // 3 seconds

  static async verifyPayment(orderTrackingId: string): Promise<PaymentStatus> {
    let retries = 0;
    
    while (retries < this.MAX_RETRIES) {
      try {
        const { data: payment, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_tracking_id', orderTrackingId)
          .single();

        if (error) {
          console.error(`Payment lookup failed (attempt ${retries + 1}):`, error);
          
          if (retries === this.MAX_RETRIES - 1) {
            return {
              status: 'failed',
              error: 'Payment record not found'
            };
          }
        } else if (payment) {
          if (payment.status === 'COMPLETED') {
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
            // Still pending, continue retrying
            console.log(`Payment still pending (attempt ${retries + 1}), retrying...`);
          }
        }

        retries++;
        
        if (retries < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_INTERVAL));
        }
      } catch (error) {
        console.error(`Payment verification error (attempt ${retries + 1}):`, error);
        retries++;
        
        if (retries < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_INTERVAL));
        }
      }
    }

    return {
      status: 'failed',
      error: 'Payment verification timeout'
    };
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