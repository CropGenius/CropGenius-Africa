import { supabase } from '@/integrations/supabase/client';

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address: {
    email_address: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface PaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
}

class SecurePesapalService {
  async submitOrderRequest(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const orderData = {
      id: `CROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currency: paymentRequest.currency,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      callback_url: paymentRequest.callback_url,
      notification_id: paymentRequest.notification_id,
      billing_address: paymentRequest.billing_address,
    };

    const { data, error } = await supabase.functions.invoke('pesapal-proxy', {
      body: orderData,
    });

    if (error) {
      throw new Error(`Payment initiation failed: ${error.message}`);
    }

    await this.storePaymentRecord({
      order_tracking_id: data.order_tracking_id,
      merchant_reference: data.merchant_reference,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      email: paymentRequest.billing_address.email_address,
      status: 'PENDING'
    });

    return data;
  }

  private async storePaymentRecord(payment: any) {
    try {
      await supabase.from('payments').insert({
        order_tracking_id: payment.order_tracking_id,
        merchant_reference: payment.merchant_reference,
        amount: payment.amount,
        currency: payment.currency,
        user_email: payment.email,
        status: payment.status,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to store payment record:', error);
    }
  }
}

export const pesapalService = new SecurePesapalService();

export const CROPGENIUS_PRICING = {
  annual: {
    original: 11988,
    discounted: 5999,
    savings: 5989,
    currency: 'KES'
  },
  monthly: {
    price: 999,
    currency: 'KES'
  }
};

export async function createCropGeniusPayment(
  plan: 'monthly' | 'annual',
  userEmail: string,
  userPhone?: string,
  firstName?: string,
  lastName?: string
): Promise<PaymentResponse> {
  const pricing = CROPGENIUS_PRICING[plan];
  const amount = plan === 'annual' ? pricing.discounted : pricing.price;
  const description = plan === 'annual' 
    ? `CropGenius Annual Plan - SAVE 92% (KES ${CROPGENIUS_PRICING.annual.savings})`
    : 'CropGenius Monthly Subscription';
  
  const paymentRequest: PaymentRequest = {
    amount,
    currency: 'KES',
    description,
    callback_url: `${window.location.origin}/payment/callback`,
    notification_id: 'CROPGENIUS_IPN_2025',
    billing_address: {
      email_address: userEmail,
      phone_number: userPhone,
      country_code: 'KE',
      first_name: firstName,
      last_name: lastName,
    },
  };

  return pesapalService.submitOrderRequest(paymentRequest);
}