import { supabase } from '@/integrations/supabase/client';

export interface PaymentResponse {
  order_tracking_id: string;
  merchant_reference: string;
  redirect_url: string;
}

class OfficialPesapalService {
  private token: string | null = null;
  private ipnId: string | null = null;

  async getToken(): Promise<string> {
    if (this.token) return this.token;

    const { data, error } = await supabase.functions.invoke('pesapal-payment', {
      body: { action: 'get_token' },
    });

    if (error) throw new Error(`Token request failed: ${error.message}`);
    
    this.token = data.token;
    return this.token;
  }

  async registerIPN(): Promise<string> {
    if (this.ipnId) return this.ipnId;

    const token = await this.getToken();
    const ipnUrl = `${window.location.origin.replace('www.cropgenius.africa', 'bapqlyvfwxsichlyjxpd.supabase.co')}/functions/v1/pesapal-ipn`;

    const { data, error } = await supabase.functions.invoke('pesapal-payment', {
      body: { 
        action: 'register_ipn',
        token,
        ipn_url: ipnUrl
      },
    });

    if (error) throw new Error(`IPN registration failed: ${error.message}`);
    
    this.ipnId = data.ipn_id;
    return this.ipnId;
  }

  async createPayment(
    amount: number,
    userEmail: string,
    userPhone?: string,
    firstName?: string,
    lastName?: string
  ): Promise<PaymentResponse> {
    const token = await this.getToken();
    const notificationId = await this.registerIPN();

    const orderData = {
      id: `CROP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currency: 'KES',
      amount,
      description: amount >= 5000 ? 'CropGenius Annual Plan' : 'CropGenius Monthly Plan',
      callback_url: `${window.location.origin}/payment/callback`,
      notification_id: notificationId,
      billing_address: {
        email_address: userEmail,
        phone_number: userPhone,
        country_code: 'KE',
        first_name: firstName,
        last_name: lastName,
      },
    };

    const { data, error } = await supabase.functions.invoke('pesapal-payment', {
      body: { 
        action: 'submit_order',
        token,
        orderData
      },
    });

    if (error) throw new Error(`Payment creation failed: ${error.message}`);
    
    // Store payment record
    await supabase.from('payments').insert({
      order_tracking_id: data.order_tracking_id,
      merchant_reference: data.merchant_reference,
      amount,
      currency: 'KES',
      user_email: userEmail,
      status: 'PENDING'
    });

    return data;
  }
}

export const pesapalService = new OfficialPesapalService();

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

  return pesapalService.createPayment(
    amount,
    userEmail,
    userPhone,
    firstName,
    lastName
  );
}