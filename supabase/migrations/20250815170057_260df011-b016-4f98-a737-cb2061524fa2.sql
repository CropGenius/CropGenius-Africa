-- Create user_plans table for subscription management
CREATE TABLE public.user_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create user_usage table for tracking usage limits
CREATE TABLE public.user_usage (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fields_count INTEGER NOT NULL DEFAULT 0,
    scans_used_month INTEGER NOT NULL DEFAULT 0,
    chat_used_day INTEGER NOT NULL DEFAULT 0,
    month_anchor DATE NOT NULL DEFAULT CURRENT_DATE,
    day_anchor DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for user_plans
CREATE POLICY "Users can view their own plan" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plan" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plan" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user_usage
CREATE POLICY "Users can view their own usage" 
ON public.user_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.user_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
ON public.user_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user usage record
CREATE OR REPLACE FUNCTION public.create_user_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_usage (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_plans (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create usage and plan records
CREATE TRIGGER create_user_usage_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_usage();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_plans_updated_at
    BEFORE UPDATE ON public.user_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at
    BEFORE UPDATE ON public.user_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX idx_user_plans_stripe_customer_id ON public.user_plans(stripe_customer_id);
CREATE INDEX idx_user_plans_stripe_subscription_id ON public.user_plans(stripe_subscription_id);
CREATE INDEX idx_user_usage_user_id ON public.user_usage(user_id);

-- Create Stripe webhook handler function
CREATE OR REPLACE FUNCTION public.handle_stripe_webhook(
    event_type TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT DEFAULT NULL,
    stripe_price_id TEXT DEFAULT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_plan_record RECORD;
BEGIN
    -- Handle different webhook events
    CASE event_type
        WHEN 'customer.subscription.created', 'customer.subscription.updated' THEN
            -- Update or create subscription
            INSERT INTO public.user_plans (
                user_id, 
                plan_type, 
                stripe_customer_id, 
                stripe_subscription_id, 
                stripe_price_id,
                status,
                current_period_start,
                current_period_end
            )
            SELECT 
                u.id,
                'pro',
                stripe_customer_id,
                stripe_subscription_id,
                stripe_price_id,
                'active',
                current_period_start,
                current_period_end
            FROM auth.users u
            WHERE u.email = (
                SELECT email FROM auth.users 
                WHERE id IN (
                    SELECT user_id FROM public.user_plans 
                    WHERE user_plans.stripe_customer_id = handle_stripe_webhook.stripe_customer_id
                    LIMIT 1
                )
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                plan_type = 'pro',
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                stripe_price_id = EXCLUDED.stripe_price_id,
                status = 'active',
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                updated_at = now();
                
        WHEN 'customer.subscription.deleted' THEN
            -- Cancel subscription
            UPDATE public.user_plans 
            SET 
                plan_type = 'free',
                status = 'canceled',
                updated_at = now()
            WHERE stripe_customer_id = handle_stripe_webhook.stripe_customer_id;
            
        WHEN 'invoice.payment_failed' THEN
            -- Handle failed payment
            UPDATE public.user_plans 
            SET 
                status = 'past_due',
                updated_at = now()
            WHERE stripe_customer_id = handle_stripe_webhook.stripe_customer_id;
    END CASE;
    
    result := '{"success": true}'::JSON;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;