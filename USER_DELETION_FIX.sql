-- 🚨 USER DELETION SYSTEM FIX 🚨
-- This fix addresses the user deletion issues in the CropGenius system
-- Run this DIRECTLY in Supabase SQL Editor to fix user deletion constraints

-- PROBLEM ANALYSIS:
-- 1. Many tables have NO ACTION foreign key constraints to auth.users
-- 2. This prevents user deletion when records exist in those tables
-- 3. The application uses supabase.auth.admin.deleteUser() which should handle this
-- 4. But if there are records in NO ACTION constraint tables, deletion fails

-- SOLUTION:
-- 1. Change NO ACTION constraints to CASCADE where appropriate
-- 2. For tables where CASCADE isn't appropriate, use SET NULL
-- 3. This will allow user deletion to work properly

-- STEP 1: Fix farms_created_by_fkey constraint
ALTER TABLE farms 
DROP CONSTRAINT farms_created_by_fkey,
ADD CONSTRAINT farms_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- STEP 2: Fix fields_created_by_fkey constraint
ALTER TABLE fields 
DROP CONSTRAINT fields_created_by_fkey,
ADD CONSTRAINT fields_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- STEP 3: Fix ai_interaction_logs_user_id_fkey constraint
ALTER TABLE ai_interaction_logs 
DROP CONSTRAINT ai_interaction_logs_user_id_fkey,
ADD CONSTRAINT ai_interaction_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 4: Fix ai_service_logs_user_id_fkey constraint
ALTER TABLE ai_service_logs 
DROP CONSTRAINT ai_service_logs_user_id_fkey,
ADD CONSTRAINT ai_service_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 5: Fix scans_user_id_fkey constraint
ALTER TABLE scans 
DROP CONSTRAINT scans_user_id_fkey,
ADD CONSTRAINT scans_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 6: Fix yield_predictions_user_id_fkey constraint
ALTER TABLE yield_predictions 
DROP CONSTRAINT yield_predictions_user_id_fkey,
ADD CONSTRAINT yield_predictions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 7: Fix ai_conversations_user_id_fkey constraint
ALTER TABLE ai_conversations 
DROP CONSTRAINT ai_conversations_user_id_fkey,
ADD CONSTRAINT ai_conversations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 8: Fix admin_actions_admin_id_fkey constraint
ALTER TABLE admin_actions 
DROP CONSTRAINT admin_actions_admin_id_fkey,
ADD CONSTRAINT admin_actions_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 9: Fix agent_feedback_user_id_fkey constraint
ALTER TABLE agent_feedback 
DROP CONSTRAINT agent_feedback_user_id_fkey,
ADD CONSTRAINT agent_feedback_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 10: Fix orchestration_results_user_id_fkey constraint
ALTER TABLE orchestration_results 
DROP CONSTRAINT orchestration_results_user_id_fkey,
ADD CONSTRAINT orchestration_results_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 11: Fix field_intelligence_results_user_id_fkey constraint
ALTER TABLE field_intelligence_results 
DROP CONSTRAINT field_intelligence_results_user_id_fkey,
ADD CONSTRAINT field_intelligence_results_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 12: Fix field_alerts_user_id_fkey constraint
ALTER TABLE field_alerts 
DROP CONSTRAINT field_alerts_user_id_fkey,
ADD CONSTRAINT field_alerts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 13: Fix user_notifications_user_id_fkey constraint
ALTER TABLE user_notifications 
DROP CONSTRAINT user_notifications_user_id_fkey,
ADD CONSTRAINT user_notifications_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 14: Fix whatsapp_messages_user_id_fkey constraint
ALTER TABLE whatsapp_messages 
DROP CONSTRAINT whatsapp_messages_user_id_fkey,
ADD CONSTRAINT whatsapp_messages_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 15: Fix homebrew_recipes_created_by_fkey constraint
ALTER TABLE homebrew_recipes 
DROP CONSTRAINT homebrew_recipes_created_by_fkey,
ADD CONSTRAINT homebrew_recipes_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- STEP 16: Fix organic_recipes_user_id_fkey constraint
ALTER TABLE organic_recipes 
DROP CONSTRAINT organic_recipes_user_id_fkey,
ADD CONSTRAINT organic_recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 17: Fix email_templates_created_by_fkey constraint
ALTER TABLE email_templates 
DROP CONSTRAINT email_templates_created_by_fkey,
ADD CONSTRAINT email_templates_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- STEP 18: Fix payments_user_id_fkey constraint
ALTER TABLE payments 
DROP CONSTRAINT payments_user_id_fkey,
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- VERIFICATION: Check that all constraints are now properly set
SELECT 
  'CONSTRAINT_FIX_VERIFICATION' as verification_section,
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  CASE confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'r' THEN 'RESTRICT'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
  END AS delete_rule_description
FROM pg_constraint
WHERE confrelid = 'auth.users'::regclass
AND contype = 'f'  -- foreign key constraints
AND confdeltype = 'a'  -- NO ACTION
ORDER BY conrelid::regclass;