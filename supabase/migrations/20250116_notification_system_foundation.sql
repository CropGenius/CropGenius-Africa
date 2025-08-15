-- 🚀 CROPGENIUS NOTIFICATION SYSTEM FOUNDATION
-- Building the REAL notification infrastructure to replace the lies
-- Date: 2025-01-16
-- Status: PRODUCTION READY FOUNDATION

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NOTIFICATION QUEUE - THE HEART OF THE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification type and channel
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'whatsapp', 'sms')),
  channel TEXT NOT NULL CHECK (channel IN ('weather', 'market', 'task', 'system', 'emergency')),
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Scheduling and delivery
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'retry')),
  
  -- Retry logic
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Metadata
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 5), -- 1=critical, 5=low
  expires_at TIMESTAMPTZ,
  template_id TEXT,
  
  -- Indexes for performance
  CONSTRAINT valid_retry_logic CHECK (
    (status = 'retry' AND next_retry_at IS NOT NULL) OR 
    (status != 'retry')
  )
);

-- ============================================================================
-- PUSH NOTIFICATION SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Push subscription data
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device info
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  
  -- Status tracking
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  failure_count INTEGER DEFAULT 0,
  
  -- Prevent duplicate subscriptions
  CONSTRAINT unique_user_endpoint UNIQUE (user_id, endpoint)
);

-- ============================================================================
-- NOTIFICATION DELIVERY LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notification_queue(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Delivery details
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'bounced', 'clicked', 'opened')),
  
  -- Timing
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Error handling
  error_code TEXT,
  error_message TEXT,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  external_id TEXT, -- ID from external service (SendGrid, WhatsApp, etc.)
  
  -- Performance tracking
  delivery_duration_ms INTEGER,
  response_time_ms INTEGER
);

-- ============================================================================
-- NOTIFICATION TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Template content
  type TEXT NOT NULL CHECK (type IN ('email', 'push', 'whatsapp', 'sms')),
  subject_template TEXT, -- For email
  title_template TEXT,   -- For push notifications
  message_template TEXT NOT NULL,
  
  -- Template variables
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names
  
  -- Localization
  language TEXT DEFAULT 'en',
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Version control
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- NOTIFICATION PREFERENCES (ENHANCED)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  
  -- Category preferences
  weather_alerts BOOLEAN DEFAULT TRUE,
  market_alerts BOOLEAN DEFAULT TRUE,
  task_reminders BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  emergency_alerts BOOLEAN DEFAULT TRUE,
  weekly_reports BOOLEAN DEFAULT FALSE,
  
  -- Timing preferences
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'UTC',
  
  -- Frequency limits
  max_daily_notifications INTEGER DEFAULT 10,
  reminder_frequency TEXT DEFAULT 'once' CHECK (reminder_frequency IN ('never', 'once', 'twice', 'hourly')),
  
  -- Contact info
  whatsapp_phone TEXT,
  sms_phone TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- ============================================================================
-- NOTIFICATION ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour BETWEEN 0 AND 23),
  
  -- Aggregated metrics
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  
  -- By type
  email_sent INTEGER DEFAULT 0,
  email_delivered INTEGER DEFAULT 0,
  push_sent INTEGER DEFAULT 0,
  push_delivered INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  whatsapp_delivered INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_delivery_time_ms INTEGER,
  avg_response_time_ms INTEGER,
  
  -- Unique constraint for aggregation
  CONSTRAINT unique_analytics_period UNIQUE (date, hour)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Notification queue indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_id ON public.notification_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_for ON public.notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_type_channel ON public.notification_queue(type, channel);
CREATE INDEX IF NOT EXISTS idx_notification_queue_retry ON public.notification_queue(status, next_retry_at) WHERE status = 'retry';

-- Push subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON public.push_subscriptions(active) WHERE active = TRUE;

-- Notification log indexes
CREATE INDEX IF NOT EXISTS idx_notification_log_user_id ON public.notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_notification_id ON public.notification_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_delivered_at ON public.notification_log(delivered_at);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON public.notification_log(status);

-- Templates indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_key ON public.notification_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(active) WHERE active = TRUE;

-- Preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_notification_analytics_date ON public.notification_analytics(date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- Notification queue policies
CREATE POLICY "Users can view their own notifications" ON public.notification_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications" ON public.notification_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Push subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification log policies
CREATE POLICY "Users can view their own notification logs" ON public.notification_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all logs" ON public.notification_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Templates policies (public read, admin write)
CREATE POLICY "Anyone can view active templates" ON public.notification_templates
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Service role can manage templates" ON public.notification_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Preferences policies
CREATE POLICY "Users can manage their own preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies (admin only)
CREATE POLICY "Service role can view analytics" ON public.notification_analytics
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- FUNCTIONS FOR NOTIFICATION MANAGEMENT
-- ============================================================================

-- Function to queue a notification
CREATE OR REPLACE FUNCTION public.queue_notification(
  p_user_id UUID,
  p_type TEXT,
  p_channel TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  p_priority INTEGER DEFAULT 2,
  p_template_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notification_queue (
    user_id, type, channel, title, message, data, 
    scheduled_for, priority, template_id
  ) VALUES (
    p_user_id, p_type, p_channel, p_title, p_message, p_data,
    p_scheduled_for, p_priority, p_template_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION public.get_notification_preferences(p_user_id UUID)
RETURNS public.notification_preferences AS $$
DECLARE
  prefs public.notification_preferences;
BEGIN
  SELECT * INTO prefs 
  FROM public.notification_preferences 
  WHERE user_id = p_user_id;
  
  -- Create default preferences if none exist
  IF NOT FOUND THEN
    INSERT INTO public.notification_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update notification status
CREATE OR REPLACE FUNCTION public.update_notification_status(
  p_notification_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notification_queue 
  SET 
    status = p_status,
    sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END,
    error_message = p_error_message,
    attempts = attempts + 1
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log notification delivery
CREATE OR REPLACE FUNCTION public.log_notification_delivery(
  p_notification_id UUID,
  p_user_id UUID,
  p_type TEXT,
  p_status TEXT,
  p_error_code TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_external_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.notification_log (
    notification_id, user_id, type, status, error_code, 
    error_message, external_id, metadata
  ) VALUES (
    p_notification_id, p_user_id, p_type, p_status, p_error_code,
    p_error_message, p_external_id, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT NOTIFICATION TEMPLATES
-- ============================================================================

-- Weather alert templates
INSERT INTO public.notification_templates (template_key, name, type, title_template, message_template, variables) VALUES
('weather_critical', 'Critical Weather Alert', 'push', 'Weather Alert: {{weather_type}}', 'Critical {{weather_type}} expected in {{location}}. Take immediate action to protect your crops.', '["weather_type", "location", "action_required"]'),
('weather_warning', 'Weather Warning', 'push', 'Weather Warning', 'Weather conditions changing in {{location}}. {{forecast_summary}}', '["location", "forecast_summary"]'),
('weather_email', 'Weather Alert Email', 'email', 'Weather Alert for {{farm_name}}', 'Weather conditions are changing for your farm. Check the app for detailed forecast and recommendations.', '["farm_name", "weather_summary"]');

-- Task reminder templates
INSERT INTO public.notification_templates (template_key, name, type, title_template, message_template, variables) VALUES
('task_reminder', 'Task Reminder', 'push', 'Task Due: {{task_title}}', 'Your task "{{task_title}}" is due {{due_time}}. Tap to view details.', '["task_title", "due_time"]'),
('task_overdue', 'Overdue Task', 'push', 'Overdue: {{task_title}}', 'Task "{{task_title}}" is overdue. Complete it now to stay on track.', '["task_title"]');

-- Market alert templates
INSERT INTO public.notification_templates (template_key, name, type, title_template, message_template, variables) VALUES
('market_price_up', 'Price Increase Alert', 'push', '{{crop_name}} Price Up {{percentage}}%', '{{crop_name}} prices increased {{percentage}}% to {{new_price}}. Consider selling now!', '["crop_name", "percentage", "new_price"]'),
('market_opportunity', 'Market Opportunity', 'push', 'Market Opportunity', 'Great selling opportunity for {{crop_name}} in {{location}}. Price: {{price}}', '["crop_name", "location", "price"]');

-- System templates
INSERT INTO public.notification_templates (template_key, name, type, title_template, message_template, variables) VALUES
('welcome', 'Welcome to CropGenius', 'push', 'Welcome to CropGenius!', 'Thanks for joining CropGenius! Enable notifications to get weather alerts, task reminders, and market updates.', '[]'),
('system_update', 'System Update', 'push', 'CropGenius Updated', 'CropGenius has been updated with new features. Tap to see what\'s new!', '["version", "features"]');

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT ON public.notification_templates TO anon, authenticated;
GRANT ALL ON public.notification_queue TO authenticated;
GRANT ALL ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.notification_log TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.queue_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_notification_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_notification_status TO service_role;
GRANT EXECUTE ON FUNCTION public.log_notification_delivery TO service_role;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for notification updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;

-- Set replica identity for realtime
ALTER TABLE public.notification_queue REPLICA IDENTITY FULL;
ALTER TABLE public.notification_log REPLICA IDENTITY FULL;
ALTER TABLE public.notification_preferences REPLICA IDENTITY FULL;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.notification_queue IS 'Central queue for all outbound notifications with retry logic and scheduling';
COMMENT ON TABLE public.push_subscriptions IS 'Browser push notification subscriptions with device tracking';
COMMENT ON TABLE public.notification_log IS 'Delivery tracking and analytics for all notifications';
COMMENT ON TABLE public.notification_templates IS 'Reusable notification templates with variable substitution';
COMMENT ON TABLE public.notification_preferences IS 'User preferences for notification channels and timing';
COMMENT ON TABLE public.notification_analytics IS 'Aggregated notification performance metrics';

COMMENT ON FUNCTION public.queue_notification IS 'Queue a notification for delivery with specified parameters';
COMMENT ON FUNCTION public.get_notification_preferences IS 'Get user notification preferences, creating defaults if needed';
COMMENT ON FUNCTION public.update_notification_status IS 'Update notification delivery status and error information';
COMMENT ON FUNCTION public.log_notification_delivery IS 'Log notification delivery attempt with status and metadata';