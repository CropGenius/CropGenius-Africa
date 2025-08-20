import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bapqlyvfwxsichlyjxpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcwODIzMiwiZXhwIjoyMDU3Mjg0MjMyfQ.hJqnOnNzWr7au_Ql_Ej_b-2uTmTCQjb1lQx-tZMxd7s'
);

export default async function handler(req, res) {
  const { OrderTrackingId, OrderMerchantReference } = req.query;
  
  if (!OrderTrackingId) {
    return res.status(400).send('Missing OrderTrackingId');
  }

  try {
    // Update payment to COMPLETED
    await supabase
      .from('payments')
      .update({ 
        status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('order_tracking_id', OrderTrackingId);

    // Activate subscription
    const { data: payment } = await supabase
      .from('payments')
      .select('user_email, amount')
      .eq('order_tracking_id', OrderTrackingId)
      .single();

    if (payment) {
      const planType = payment.amount >= 5000 ? 'annual' : 'monthly';
      const expiryDays = planType === 'annual' ? 365 : 30;

      await supabase
        .from('user_subscriptions')
        .upsert({
          user_email: payment.user_email,
          plan_type: planType,
          status: 'active',
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
        });
    }

    res.status(200).send(`pesapal_notification_type=CHANGE&pesapal_transaction_tracking_id=${OrderTrackingId}&pesapal_merchant_reference=${OrderMerchantReference || OrderTrackingId}`);
  } catch (error) {
    res.status(500).send('Error processing IPN');
  }
}