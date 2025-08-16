-- Remove any remaining Flutterwave references from user_plans table
ALTER TABLE public.user_plans 
DROP COLUMN IF EXISTS flutterwave_customer_id;

-- Clean up any indexes related to flutterwave in user_plans
DROP INDEX IF EXISTS idx_user_plans_flutterwave_customer_id;

-- Verify no more flutterwave columns exist anywhere
SELECT 
  table_name, 
  column_name 
FROM information_schema.columns 
WHERE column_name ILIKE '%flutter%' 
AND table_schema = 'public';