-- 🔍 BRUTAL AVIATION CRASH INVESTIGATION
-- Checking the EXACT current state of auth.users triggers

-- STEP 1: List ALL triggers on auth.users (the brutal truth)
SELECT 
  tgname as trigger_name,
  proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
ORDER BY tgname;

-- STEP 2: Count total triggers (brutal count)
SELECT 
  COUNT(*) as total_triggers_on_auth_users
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- STEP 3: Count user-related triggers specifically (brutal focus)
SELECT 
  COUNT(*) as user_triggers
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass 
AND (
  tgname LIKE '%user%' OR 
  tgname LIKE '%auth%' OR
  tgname LIKE '%create%'
);

-- STEP 4: Check for the EXACT problematic triggers (brutal identification)
SELECT 
  tgname as problematic_trigger
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname IN (
  'on_auth_user_created',
  'on_auth_user_created_add_credits', 
  'create_user_usage_trigger',
  'on_auth_user_created_farmer_profile',
  'on_auth_user_created_plan_usage'
);

-- STEP 5: Check the EXACT handle_new_user function (brutal examination)
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- STEP 6: Check if handle_new_user_credits exists (brutal verification)
SELECT 
  proname as credits_function_exists
FROM pg_proc 
WHERE proname = 'handle_new_user_credits';

-- STEP 7: Check if create_user_usage exists (brutal confirmation)
SELECT 
  proname as usage_function_exists
FROM pg_proc 
WHERE proname = 'create_user_usage';

-- STEP 8: Check if create_farmer_profile exists (brutal validation)
SELECT 
  proname as farmer_function_exists
FROM pg_proc 
WHERE proname = 'create_farmer_profile';

-- STEP 9: Brutally test if user registration works
-- This would create a test user (but we'll comment it out for safety)
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'test-brutal@cropgenius.africa',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW(),
  '{"full_name": "Brutal Test User", "preferred_language": "en"}'
);
*/

-- STEP 10: Check constraint triggers (brutal constraint analysis)
SELECT 
  conname as constraint_name,
  tgname as constraint_trigger
FROM pg_constraint c
JOIN pg_trigger t ON c.oid = t.tgconstraint
WHERE c.conrelid = 'auth.users'::regclass
ORDER BY conname;

-- BRUTAL CONCLUSION:
-- This will show us EXACTLY what's in the database right now
-- No assumptions, no hallucinations - just the brutal truth