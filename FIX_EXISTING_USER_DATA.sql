-- BRUTAL CRASH INVESTIGATION: Fix existing user data inconsistencies
-- This script ensures all existing users have complete data records

-- Fix missing user credits
INSERT INTO public.user_credits (user_id, balance, last_updated_at)
SELECT p.id, 100, NOW()
FROM public.profiles p
LEFT JOIN public.user_credits uc ON p.id = uc.user_id
WHERE uc.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Fix missing user usage tracking
INSERT INTO public.user_usage (user_id, fields_count, scans_used_month, chat_used_day, month_anchor, day_anchor, created_at, updated_at)
SELECT p.id, 0, 0, 0, CURRENT_DATE, CURRENT_DATE, NOW(), NOW()
FROM public.profiles p
LEFT JOIN public.user_usage uu ON p.id = uu.user_id
WHERE uu.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Fix missing user plans
INSERT INTO public.user_plans (user_id, plan_type, status, created_at, updated_at)
SELECT p.id, 'free', 'active', NOW(), NOW()
FROM public.profiles p
LEFT JOIN public.user_plans up ON p.id = up.user_id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Fix missing user preferences
INSERT INTO public.user_preferences (user_id, primary_goal, primary_pain_point, has_irrigation, has_machinery, has_soil_test, budget_band, created_at, updated_at)
SELECT p.id, 'increase_yield', 'pests', FALSE, FALSE, FALSE, 'medium', NOW(), NOW()
FROM public.profiles p
LEFT JOIN public.user_preferences upref ON p.id = upref.user_id
WHERE upref.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verification query to confirm all users have complete data
SELECT 
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE uc.user_id IS NOT NULL) as profiles_with_credits,
  COUNT(*) FILTER (WHERE uu.user_id IS NOT NULL) as profiles_with_usage,
  COUNT(*) FILTER (WHERE up.user_id IS NOT NULL) as profiles_with_plans,
  COUNT(*) FILTER (WHERE upref.user_id IS NOT NULL) as profiles_with_preferences
FROM public.profiles p
LEFT JOIN public.user_credits uc ON p.id = uc.user_id
LEFT JOIN public.user_usage uu ON p.id = uu.user_id
LEFT JOIN public.user_plans up ON p.id = up.user_id
LEFT JOIN public.user_preferences upref ON p.id = upref.user_id;