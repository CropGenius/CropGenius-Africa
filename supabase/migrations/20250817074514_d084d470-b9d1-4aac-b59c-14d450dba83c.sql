-- Remove Flutterwave-specific columns and add Pesapal columns to payment_sessions
ALTER TABLE payment_sessions 
DROP COLUMN IF EXISTS flutterwave_data,
ADD COLUMN IF NOT EXISTS pesapal_data JSONB DEFAULT '{}';

-- Update user_plans table to replace Flutterwave columns with Pesapal columns
ALTER TABLE user_plans 
DROP COLUMN IF EXISTS flutterwave_customer_id,
ADD COLUMN IF NOT EXISTS pesapal_order_tracking_id TEXT;

-- Add comments to document the Pesapal integration
COMMENT ON COLUMN payment_sessions.pesapal_data IS 'Pesapal payment response data';
COMMENT ON COLUMN user_plans.pesapal_order_tracking_id IS 'Pesapal order tracking ID for subscription';