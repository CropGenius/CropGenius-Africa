-- VERIFICATION SCRIPT FOR USER REGISTRATION FIX
-- This script verifies that the user registration fix is working correctly

-- Check that only one trigger exists on auth.users (excluding constraint triggers)
SELECT 'Trigger Count Check' as test_name, 
       CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass 
  AND tgname NOT LIKE 'RI_ConstraintTrigger%';

-- Check that the correct trigger exists
SELECT 'Correct Trigger Check' as test_name,
       CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass 
  AND tgname = 'on_user_registration';

-- Check that conflicting functions have been removed
SELECT 'Function Cleanup Check' as test_name,
       CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'handle_new_user_credits', 'handle_new_user_optimized', 'handle_new_user_profile', 'handle_new_user_targeted');

-- Check that our new function exists
SELECT 'New Function Check' as test_name,
       CASE WHEN COUNT(*) = 1 THEN 'PASS' ELSE 'FAIL' END as result
FROM pg_proc 
WHERE proname = 'handle_new_user_registration';

-- Summary message
SELECT 'USER REGISTRATION FIX VERIFICATION COMPLETE' as status,
       'All tests should show PASS for the fix to be working correctly' as message;