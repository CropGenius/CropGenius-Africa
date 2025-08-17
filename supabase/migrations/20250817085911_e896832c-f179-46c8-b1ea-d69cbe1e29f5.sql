-- Create pesapal_ipn_urls table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pesapal_ipn_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id TEXT NOT NULL UNIQUE,
  ipn_url TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'live',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pesapal_ipn_urls ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Service role can manage IPN URLs" 
ON public.pesapal_ipn_urls 
FOR ALL 
USING (true);

-- Add unique constraint on environment (only one registration per environment)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pesapal_ipn_environment ON public.pesapal_ipn_urls(environment);

-- Add trigger for updated_at
CREATE TRIGGER update_pesapal_ipn_urls_updated_at
BEFORE UPDATE ON public.pesapal_ipn_urls
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();