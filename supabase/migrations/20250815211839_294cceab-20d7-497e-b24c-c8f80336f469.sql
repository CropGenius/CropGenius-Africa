-- Create payment sessions table for Flutterwave integration
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_data JSONB DEFAULT '{}',
  flutterwave_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create user_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  flutterwave_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_sessions
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_plans if not already enabled
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_sessions
CREATE POLICY "Users can view their own payment sessions" 
ON public.payment_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment sessions" 
ON public.payment_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_plans
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.user_plans;

CREATE POLICY "Users can view their own plans" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.user_plans 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to check if user has pro plan
CREATE OR REPLACE FUNCTION public.has_pro_plan(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_plans 
    WHERE user_id = user_uuid 
    AND plan_type = 'pro' 
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$;

-- Function to get user plan details
CREATE OR REPLACE FUNCTION public.get_user_plan(user_uuid UUID)
RETURNS TABLE(
  plan_type TEXT,
  status TEXT,
  billing_cycle TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.plan_type,
    up.status,
    up.billing_cycle,
    up.current_period_end,
    (up.plan_type = 'pro' AND up.status = 'active' AND (up.current_period_end IS NULL OR up.current_period_end > NOW())) as is_active
  FROM public.user_plans up
  WHERE up.user_id = user_uuid;
  
  -- If no plan exists, return default free plan
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'free'::TEXT as plan_type,
      'active'::TEXT as status, 
      'monthly'::TEXT as billing_cycle,
      NULL::TIMESTAMP WITH TIME ZONE as current_period_end,
      FALSE as is_active;
  END IF;
END;
$$;