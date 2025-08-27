-- 🚨 EMERGENCY PROFILE CREATION FIX 🚨
-- Run this DIRECTLY in Supabase SQL Editor to bypass broken trigger

-- Step 1: Fix the broken handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with proper field access
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

-- Step 2: Create missing profiles for all existing users
-- (These insertions will now work because the trigger is fixed)

INSERT INTO public.profiles (id, full_name, avatar_url, created_at, updated_at, onboarding_completed)
VALUES 
  ('c06cbf7f-1982-4107-bc9f-5c92a8aa5850', 'Joy Makena', 'https://lh3.googleusercontent.com/a/ACg8ocIStzCU-Cl9lgt2zgJMzXCuyBzRbBtOf90eNTmBkjOqdgU8Ug=s96-c', '2025-08-20 17:49:03.40952+00', NOW(), false),
  ('390eb075-a58e-4279-afa3-e86b945fe554', 'Patrick Nkonge', 'https://lh3.googleusercontent.com/a/ACg8ocI_To_j6zqQdAQpSQ4hSNWx4HK6xJlq62mLt6ZUKZhCsUzhsA=s96-c', '2025-08-15 06:14:52.011781+00', NOW(), false),
  ('5e42fcc5-51d8-45dd-9598-1bd26d6c797b', 'Edwin Upane', 'https://lh3.googleusercontent.com/a/ACg8ocIVRED6jWujfREEFJNl4pQfcri8haPRuaY9FUe-iLN4b1C5ag=s96-c', '2025-08-13 15:37:37.758081+00', NOW(), false),
  ('9dd41122-b972-4e2a-b634-bc14aeefad6d', 'Ephantus Magoiya', 'https://lh3.googleusercontent.com/a/ACg8ocLKNUDcgMz_mXRrHBS8QpXvujp1QgYt_nwYtPrllw1bJxXYFg=s96-c', '2025-08-13 15:34:23.995649+00', NOW(), false),
  ('984ec6f1-6dcf-468d-b0bc-803c5315e5ca', 'Maingi Muriithi', 'https://lh3.googleusercontent.com/a/ACg8ocLDo3p-Dk-vXuaOXA1TarZHV04YByEOhJk8SZmsCFlWID_jqg=s96-c', '2025-08-12 15:19:03.059348+00', NOW(), false),
  ('7dc0ed5d-a65c-4e83-85d2-54287ccb435d', 'Mike Mutugi', 'https://lh3.googleusercontent.com/a/ACg8ocKgePWpnygQrhy7aWD-UK9wLO9hxAi26RZFxRZqBvLGSjfpQjU=s96-c', '2025-08-12 14:10:26.911362+00', NOW(), false),
  ('74b2f2a6-2dd2-4538-9275-c2c29889847e', 'CropGenius', 'https://lh3.googleusercontent.com/a/ACg8ocJlIYhNc-HmBFM8OSDPE8qcBvwknysxfo2sGGh003cevEdN0w=s96-c', '2025-08-07 15:36:46.901534+00', NOW(), false)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify the fix worked
SELECT 
  COUNT(*) as users_without_profiles,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;