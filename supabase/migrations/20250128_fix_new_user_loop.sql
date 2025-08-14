-- NUCLEAR FIX: Eliminate new user OAuth loop
-- Set all existing users with incomplete onboarding to completed
UPDATE public.profiles 
SET onboarding_completed = TRUE 
WHERE onboarding_completed = FALSE;

-- Update trigger to create profiles with onboarding completed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    avatar_url,
    preferred_language,
    onboarding_completed,
    phone_number,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    TRUE, -- NEW USERS SKIP ONBOARDING LOOP
    NEW.phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    preferred_language = EXCLUDED.preferred_language,
    onboarding_completed = TRUE, -- FORCE COMPLETION
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;