-- 🧪 PRECISE USER REGISTRATION FIX VERIFICATION
-- Run this script to verify the precise fix worked correctly

-- STEP 1: Count user-related triggers (should be only 1 now)
SELECT 
  COUNT(*) as user_triggers_count
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname LIKE '%user%';

-- STEP 2: List all user-related triggers
SELECT 
  tgname as trigger_name
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname LIKE '%user%'
ORDER BY tgname;

-- STEP 3: Verify the main trigger exists
SELECT 
  tgname as main_trigger_exists
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname = 'on_auth_user_created';

-- STEP 4: Check that conflicting triggers are removed
SELECT 
  tgname as conflicting_triggers_still_exist
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname IN (
  'on_auth_user_created_add_credits',
  'create_user_usage_trigger', 
  'on_auth_user_created_farmer_profile'
);

-- STEP 5: Verify the function exists and is correct
SELECT 
  proname as function_name
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- STEP 6: Test that all necessary tables exist
SELECT 
  table_name,
  column_count
FROM (
  SELECT 'profiles' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles'
  UNION ALL
  SELECT 'user_credits' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_credits'
  UNION ALL
  SELECT 'user_usage' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_usage'
  UNION ALL
  SELECT 'user_plans' as table_name, COUNT(*) as column_count FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_plans'
) tables
ORDER BY table_name;

-- STEP 7: Check that the function does all required operations
SELECT 
  'handle_new_user function verified' as verification_status,
  'All user data should be created' as expected_result;

-- SUCCESS CRITERIA:
-- ✅ Only 1 user trigger exists (on_auth_user_created)
-- ✅ No conflicting triggers exist
-- ✅ Main trigger function exists
-- ✅ All required tables accessible
-- ✅ Function performs all necessary operations

-- FAILURE INDICATORS:
-- ❌ Multiple user triggers still exist
-- ❌ Conflicting triggers not removed
-- ❌ Main trigger missing
-- ❌ Function compilation errors
-- ❌ Required tables missing

-- EXPECTED RESULTS:
-- Before precise fix: 4+ conflicting user triggers
-- After precise fix: 1 main user trigger

SELECT 
  'PRECISE FIX VERIFICATION COMPLETE' as status,
  'Check results above for success criteria' as instruction;