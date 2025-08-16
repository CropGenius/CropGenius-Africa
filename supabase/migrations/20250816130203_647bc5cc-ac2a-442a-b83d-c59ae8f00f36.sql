-- Create table to store Pesapal IPN URL registrations
CREATE TABLE IF NOT EXISTS public.pesapal_ipn_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id TEXT NOT NULL UNIQUE,
  ipn_url TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'live')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pesapal_ipn_urls ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only (since this is system-wide configuration)
CREATE POLICY "Service role can manage IPN URLs" ON public.pesapal_ipn_urls
  FOR ALL USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_pesapal_ipn_urls_updated_at
  BEFORE UPDATE ON public.pesapal_ipn_urls
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add unique constraint on environment to ensure one IPN per environment
CREATE UNIQUE INDEX pesapal_ipn_urls_environment_unique ON public.pesapal_ipn_urls(environment);