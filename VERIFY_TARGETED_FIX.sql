-- 🧪 TARGETED TRIGGER CLEANUP VERIFICATION
-- Run this script to verify the targeted fix worked correctly

-- STEP 1: Count total triggers on auth.users (should be reduced)
SELECT 
  COUNT(*) as total_triggers_on_auth_users
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- STEP 2: List all user-related triggers (should show our targeted trigger only)
SELECT 
  tgname as user_trigger_name,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass
AND tgname LIKE '%user%'
ORDER BY tgname;

-- STEP 3: Verify our targeted trigger exists and is active
SELECT 
  tgname as our_targeted_trigger_exists,
  tgenabled as trigger_enabled
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname = 'on_auth_user_created_targeted';

-- STEP 4: Check that problematic triggers are gone
SELECT 
  tgname as problematic_triggers_still_exist
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname IN (
  'on_auth_user_created',
  'on_auth_user_created_add_credits', 
  'create_user_usage_trigger',
  'on_auth_user_created_farmer_profile',
  'on_auth_user_created_plan_usage'
);

-- STEP 5: Verify our targeted function exists
SELECT 
  proname as targeted_function_exists,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user_targeted';

-- STEP 6: Check constraint integrity (should still be intact)
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  condeferrable as deferrable,
  condeferred as deferred
FROM pg_constraint
WHERE conrelid = 'auth.users'::regclass
AND contype = 'f'  -- foreign key constraints
LIMIT 5;

-- STEP 7: Test that all necessary tables can be accessed
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
  'user_credits' as table_name,
  COUNT(*) as row_count
FROM public.user_credits
UNION ALL
SELECT 
  'user_usage' as table_name,
  COUNT(*) as row_count
FROM public.user_usage
UNION ALL
SELECT 
  'user_plans' as table_name,
  COUNT(*) as row_count
FROM public.user_plans;

-- SUCCESS CRITERIA:
-- ✅ Total triggers significantly reduced (< 50, was 153)
-- ✅ Our targeted trigger exists and is enabled
-- ✅ Problematic triggers are removed
-- ✅ Constraint triggers still intact
-- ✅ Targeted function exists with correct logic
-- ✅ All necessary tables accessible

-- EXPECTED RESULTS:
-- Before targeted fix: 153 total triggers, 5+ problematic user triggers
-- After targeted fix: < 30 total triggers, 1 targeted user trigger

-- PERFORMANCE IMPACT CHECK:
-- Run this query to see if user registration is faster:
-- SELECT NOW() as start_time; 
-- (Then create a test user and run:)
-- SELECT NOW() as end_time;

SELECT 
  'TARGETED FIX VERIFICATION COMPLETE' as status,
  'Check results above for success criteria' as instruction;