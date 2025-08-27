-- 🚨 FINAL EMERGENCY AUTHENTICATION SYSTEM FIX 🚨
-- This fix addresses the ROOT CAUSE of the infinite redirect loop
-- Run this DIRECTLY in Supabase SQL Editor to permanently fix the authentication system

-- PROBLEM SUMMARY:
-- 1. FOUR conflicting triggers were firing on user creation
-- 2. The main handle_new_user() function was trying to insert into user_profiles table
-- 3. But the app expects profiles in the profiles table
-- 4. This caused ALL users to have missing profiles, leading to infinite redirect loops

-- SOLUTION:
-- 1. Drop all conflicting triggers
-- 2. Fix the handle_new_user() function to insert into the CORRECT profiles table
-- 3. Ensure proper field access from auth.users context
-- 4. Add missing profile for existing users
-- 5. Verify the fix works

-- STEP 1: Drop all conflicting triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_farmer_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_add_credits ON auth.users;
DROP TRIGGER IF EXISTS create_user_usage_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_user_credits_trigger ON profiles;

-- STEP 2: Fix the handle_new_user function to insert into the CORRECT profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into the CORRECT profiles table that the app actually uses
  INSERT INTO public.profiles (
    id, 
    full_name,
    avatar_url,
    created_at, 
    updated_at, 
    onboarding_completed
  )
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      'User'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(), 
    NOW(), 
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- STEP 3: Recreate ONLY the necessary trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Create missing profiles for all existing users (FIX CURRENT USERS)
INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at, onboarding_completed)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name', 
    u.raw_user_meta_data->>'name', 
    split_part(u.email, '@', 1)
  ) as full_name,
  u.raw_user_meta_data->>'avatar_url' as avatar_url,
  u.created_at,
  NOW() as updated_at,
  false as onboarding_completed
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Verify the fix worked
SELECT 
  COUNT(*) as users_without_profiles,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;