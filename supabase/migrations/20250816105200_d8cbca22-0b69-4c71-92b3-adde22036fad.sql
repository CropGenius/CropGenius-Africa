-- Remove Flutterwave column and references completely from payment_sessions table
ALTER TABLE public.payment_sessions 
DROP COLUMN IF EXISTS flutterwave_data;

-- Check if there are any indexes or constraints related to flutterwave and remove them
DROP INDEX IF EXISTS idx_payment_sessions_flutterwave_data;

-- Update any existing payment sessions that might have had flutterwave data to ensure clean state
UPDATE public.payment_sessions 
SET payment_data = COALESCE(pesapal_data, payment_data)
WHERE pesapal_data IS NOT NULL AND payment_data IS NULL;

-- Comment for audit trail
COMMENT ON TABLE public.payment_sessions IS 'Payment sessions table - Flutterwave integration completely removed on 2024-12-16';

-- Verify the column is removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payment_sessions' 
AND table_schema = 'public' 
AND column_name ILIKE '%flutter%';