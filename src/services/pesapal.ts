// Pesapal Payment Integration for CropGenius
// Official Pesapal Documentation: https://developer.pesapal.com/

export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
}

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

class PesapalService {
  private config: PesapalConfig;
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(config: PesapalConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production' 
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3';
  }

  // Step 1: Get Access Token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await fetch(`${this.baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.token;
    return this.accessToken;
  }

  // Step 2: Register IPN URL (do this once)
  async registerIPN(url: string, ipn_notification_type: string = 'GET'): Promise<string> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        ipn_notification_type,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register IPN: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ipn_id;
  }

  // Step 3: Submit Order Request
  async submitOrderRequest(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const token = await this.getAccessToken();
    
    const orderData = {
      id: `CROP_${Date.now()}`, // Unique merchant reference
      currency: paymentRequest.currency,
      amount: paymentRequest.amount,
      description: paymentRequest.description,
      callback_url: paymentRequest.callback_url,
      notification_id: paymentRequest.notification_id,
      billing_address: paymentRequest.billing_address,
    };

    const response = await fetch(`${this.baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit order: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      order_tracking_id: data.order_tracking_id,
      merchant_reference: data.merchant_reference,
      redirect_url: data.redirect_url,
    };
  }

  // Step 4: Get Transaction Status
  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }

    return response.json();
  }
}

// Initialize Pesapal service
const pesapalConfig: PesapalConfig = {
  consumerKey: import.meta.env.VITE_PESAPAL_CONSUMER_KEY || '',
  consumerSecret: import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || '',
  environment: import.meta.env.VITE_PESAPAL_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
};

export const pesapalService = new PesapalService(pesapalConfig);

// Helper function to create payment for CropGenius subscription
export async function createCropGeniusPayment(
  plan: 'monthly' | 'annual',
  userEmail: string,
  userPhone?: string,
  firstName?: string,
  lastName?: string
): Promise<PaymentResponse> {
  const amount = plan === 'annual' ? 120 : 12;
  const description = `CropGenius ${plan === 'annual' ? 'Annual' : 'Monthly'} Subscription`;
  
  const paymentRequest: PaymentRequest = {
    amount,
    currency: 'USD',
    description,
    callback_url: `${window.location.origin}/payment/callback`,
    notification_id: import.meta.env.VITE_PESAPAL_IPN_ID || '',
    billing_address: {
      email_address: userEmail,
      phone_number: userPhone,
      country_code: 'KE', // Default to Kenya
      first_name: firstName,
      last_name: lastName,
    },
  };

  return pesapalService.submitOrderRequest(paymentRequest);
}