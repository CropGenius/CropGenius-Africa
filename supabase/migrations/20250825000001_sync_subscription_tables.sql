-- Sync subscription data between tables and update all references

-- Create sync function for subscription tables
CREATE OR REPLACE FUNCTION sync_subscription_tables()
RETURNS VOID AS $$
BEGIN
  -- First ensure all user subscriptions have corresponding user_plans entries
  INSERT INTO public.user_plans (
    user_id,
    plan_type,
    is_active,
    subscription_start_date,
    subscription_end_date,
    updated_at
  )
  SELECT
    auth.users.id,
    CASE WHEN s.plan_type = 'annual' THEN 'pro' ELSE 'pro' END,
    s.status = 'active',
    s.activated_at,
    s.expires_at,
    NOW()
  FROM
    public.user_subscriptions s
  JOIN
    auth.users ON s.user_email = auth.users.email
  LEFT JOIN
    public.user_plans p ON auth.users.id = p.user_id
  WHERE
    p.user_id IS NULL;

  -- Update existing user_plans based on user_subscriptions
  UPDATE public.user_plans p
  SET
    plan_type = CASE WHEN s.plan_type = 'annual' THEN 'pro' ELSE 'pro' END,
    is_active = s.status = 'active' AND s.expires_at > NOW(),
    subscription_start_date = s.activated_at,
    subscription_end_date = s.expires_at,
    updated_at = NOW()
  FROM
    public.user_subscriptions s
  JOIN
    auth.users ON s.user_email = auth.users.email
  WHERE
    p.user_id = auth.users.id;

  -- Now, create user_subscriptions entries for any user_plans that don't have them
  INSERT INTO public.user_subscriptions (
    user_email,
    plan_type,
    status,
    activated_at,
    expires_at
  )
  SELECT
    auth.users.email,
    CASE WHEN p.plan_type = 'pro' THEN 'annual' ELSE 'monthly' END,
    CASE WHEN p.is_active THEN 'active' ELSE 'expired' END,
    COALESCE(p.subscription_start_date, NOW()),
    COALESCE(p.subscription_end_date, NOW() + interval '1 year')
  FROM
    public.user_plans p
  JOIN
    auth.users ON p.user_id = auth.users.id
  LEFT JOIN
    public.user_subscriptions s ON auth.users.email = s.user_email
  WHERE
    s.user_email IS NULL AND p.is_active = true;

END;
$$ LANGUAGE plpgsql;

-- Execute the sync function
SELECT sync_subscription_tables();

-- Create a trigger to keep tables in sync going forward
CREATE OR REPLACE FUNCTION sync_subscription_on_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'user_subscriptions' THEN
    -- When user_subscriptions changes, update user_plans
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      UPSERT INTO public.user_plans (
        user_id,
        plan_type,
        is_active,
        subscription_start_date,
        subscription_end_date,
        updated_at
      )
      SELECT
        auth.users.id,
        CASE WHEN NEW.plan_type = 'annual' THEN 'pro' ELSE 'pro' END,
        NEW.status = 'active',
        NEW.activated_at,
        NEW.expires_at,
        NOW()
      FROM
        auth.users
      WHERE
        auth.users.email = NEW.user_email;
    END IF;
  ELSIF TG_TABLE_NAME = 'user_plans' THEN
    -- When user_plans changes, update user_subscriptions
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      UPSERT INTO public.user_subscriptions (
        user_email,
        plan_type,
        status,
        activated_at,
        expires_at
      )
      SELECT
        auth.users.email,
        CASE WHEN NEW.plan_type = 'pro' THEN 'annual' ELSE 'monthly' END,
        CASE WHEN NEW.is_active THEN 'active' ELSE 'expired' END,
        COALESCE(NEW.subscription_start_date, NOW()),
        COALESCE(NEW.subscription_end_date, NOW() + interval '1 year')
      FROM
        auth.users
      WHERE
        auth.users.id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to user_subscriptions
DROP TRIGGER IF EXISTS sync_subscription_trigger_sub ON public.user_subscriptions;
CREATE TRIGGER sync_subscription_trigger_sub
AFTER INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION sync_subscription_on_change();

-- Add trigger to user_plans
DROP TRIGGER IF EXISTS sync_subscription_trigger_plan ON public.user_plans;
CREATE TRIGGER sync_subscription_trigger_plan
AFTER INSERT OR UPDATE ON public.user_plans
FOR EACH ROW EXECUTE FUNCTION sync_subscription_on_change();

-- Create function to check if user is pro
CREATE OR REPLACE FUNCTION user_is_pro(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_pro BOOLEAN := false;
BEGIN
  -- First check user_plans
  SELECT 
    is_active 
  INTO v_is_pro
  FROM 
    public.user_plans
  WHERE 
    user_id = p_user_id
    AND plan_type = 'pro' 
    AND is_active = true
    AND (subscription_end_date IS NULL OR subscription_end_date > NOW());
    
  IF v_is_pro THEN
    RETURN true;
  END IF;
  
  -- Then check user_subscriptions
  SELECT 
    EXISTS(
      SELECT 1 
      FROM public.user_subscriptions s
      JOIN auth.users u ON s.user_email = u.email
      WHERE 
        u.id = p_user_id
        AND s.status = 'active' 
        AND s.expires_at > NOW()
    )
  INTO v_is_pro;
  
  RETURN v_is_pro;
END;
$$ LANGUAGE plpgsql;