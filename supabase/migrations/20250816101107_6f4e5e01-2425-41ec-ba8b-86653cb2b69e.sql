-- Add Pesapal-specific fields to payment_sessions table
ALTER TABLE public.payment_sessions 
ADD COLUMN IF NOT EXISTS pesapal_data jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id text;

-- Add Pesapal-specific fields to user_plans table  
ALTER TABLE public.user_plans
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id text,
ADD COLUMN IF NOT EXISTS pesapal_customer_id text;

-- Create index for faster Pesapal lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_pesapal_order_tracking_id 
ON public.payment_sessions(pesapal_order_tracking_id);

CREATE INDEX IF NOT EXISTS idx_user_plans_pesapal_order_tracking_id 
ON public.user_plans(pesapal_order_tracking_id);