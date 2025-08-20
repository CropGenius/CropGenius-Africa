-- Create payment_logs table for debugging and monitoring
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_type ON payment_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_payment_logs_timestamp ON payment_logs(timestamp);

-- Enable RLS (only service role can access)
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage payment logs" ON payment_logs
  FOR ALL USING (auth.role() = 'service_role');