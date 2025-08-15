-- Create user_plans table for Pesapal subscriptions
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  pesapal_order_id TEXT,
  pesapal_tracking_id TEXT,
  pesapal_merchant_reference TEXT,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'KES',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user_usage table for tracking limits
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scans_used_month INTEGER DEFAULT 0,
  chat_used_day INTEGER DEFAULT 0,
  month_anchor DATE DEFAULT CURRENT_DATE,
  day_anchor DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_plans
CREATE POLICY "Users can view their own plan" 
ON public.user_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan" 
ON public.user_plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert plans" 
ON public.user_plans FOR INSERT 
WITH CHECK (true);

-- RLS Policies for user_usage  
CREATE POLICY "Users can view their own usage" 
ON public.user_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.user_usage FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" 
ON public.user_usage FOR INSERT 
WITH CHECK (true);

-- Function to create initial records for new users
CREATE OR REPLACE FUNCTION public.create_initial_user_plan_and_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert initial plan
  INSERT INTO public.user_plans (user_id, plan_type, is_active)
  VALUES (NEW.id, 'free', true)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert initial usage
  INSERT INTO public.user_usage (user_id, scans_used_month, chat_used_day, month_anchor, day_anchor)
  VALUES (NEW.id, 0, 0, CURRENT_DATE, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create initial records for new users
DROP TRIGGER IF EXISTS on_auth_user_created_plan_usage ON auth.users;
CREATE TRIGGER on_auth_user_created_plan_usage
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_user_plan_and_usage();

-- Function to reset monthly/daily counters
CREATE OR REPLACE FUNCTION public.reset_usage_counters(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_month_anchor DATE;
  current_day_anchor DATE;
BEGIN
  SELECT month_anchor, day_anchor INTO current_month_anchor, current_day_anchor
  FROM public.user_usage WHERE user_id = p_user_id;
  
  -- Reset monthly counter if month changed
  IF DATE_TRUNC('month', current_month_anchor) < DATE_TRUNC('month', CURRENT_DATE) THEN
    UPDATE public.user_usage 
    SET scans_used_month = 0, month_anchor = CURRENT_DATE, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Reset daily counter if day changed  
  IF current_day_anchor < CURRENT_DATE THEN
    UPDATE public.user_usage 
    SET chat_used_day = 0, day_anchor = CURRENT_DATE, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has pro plan
CREATE OR REPLACE FUNCTION public.user_has_pro_plan(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_pro BOOLEAN := false;
BEGIN
  SELECT (plan_type = 'pro' AND is_active = true AND 
          (subscription_end_date IS NULL OR subscription_end_date > now()))
  INTO has_pro
  FROM public.user_plans 
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(has_pro, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION public.increment_usage_counter(p_user_id UUID, counter_type TEXT)
RETURNS VOID AS $$
BEGIN
  -- Reset counters first
  PERFORM public.reset_usage_counters(p_user_id);
  
  -- Increment the appropriate counter
  IF counter_type = 'scan' THEN
    UPDATE public.user_usage 
    SET scans_used_month = scans_used_month + 1, updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF counter_type = 'chat' THEN
    UPDATE public.user_usage 
    SET chat_used_day = chat_used_day + 1, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;