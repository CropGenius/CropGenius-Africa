-- 🚨 FINAL ONBOARDING FIX 🚨
-- This script completely eliminates the onboarding requirement for all users
-- Run this DIRECTLY in Supabase SQL Editor to permanently fix the onboarding redirect issue

-- UPDATE ALL existing users to have onboarding_completed = TRUE
-- This ensures NO USER will be redirected to onboarding
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE onboarding_completed = FALSE;

-- Verify the fix worked
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed = TRUE THEN 1 END) as completed_onboarding,
  COUNT(CASE WHEN onboarding_completed = FALSE THEN 1 END) as pending_onboarding
FROM public.profiles;

-- Check that only one user trigger exists (should be the brutal fix)
SELECT 
  COUNT(*) as user_triggers_count
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND tgname LIKE '%user%';