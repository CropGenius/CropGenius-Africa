-- Fix missing database tables and authentication issues
-- This migration creates all missing tables referenced by the application

-- Create whatsapp_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_memory table if it doesn't exist (backup from 20250417)
CREATE TABLE IF NOT EXISTS public.user_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_memory UNIQUE (user_id)
);

-- Create farm_insights table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.farm_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  field_id UUID REFERENCES public.fields NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_taken BOOLEAN DEFAULT FALSE
);

-- Create crop_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crop_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  field_id UUID REFERENCES public.fields NOT NULL,
  crop_name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  quantity_planted NUMERIC,
  area_planted NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for whatsapp_messages
CREATE POLICY IF NOT EXISTS "Users can read their own whatsapp messages" ON public.whatsapp_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own whatsapp messages" ON public.whatsapp_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own whatsapp messages" ON public.whatsapp_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_memory
CREATE POLICY IF NOT EXISTS "Users can read their own memory" ON public.user_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own memory" ON public.user_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own memory" ON public.user_memory
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for farm_insights
CREATE POLICY IF NOT EXISTS "Users can read their own farm insights" ON public.farm_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own farm insights" ON public.farm_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own farm insights" ON public.farm_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for crop_records
CREATE POLICY IF NOT EXISTS "Users can read their own crop records" ON public.crop_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own crop records" ON public.crop_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own crop records" ON public.crop_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own crop records" ON public.crop_records
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON public.whatsapp_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_insights_user_id ON public.farm_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_insights_field_id ON public.farm_insights(field_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_user_id ON public.crop_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_records_field_id ON public.crop_records(field_id);

-- Add realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_memory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farm_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crop_records;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_whatsapp_messages_updated_at BEFORE UPDATE ON public.whatsapp_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_user_memory_updated_at BEFORE UPDATE ON public.user_memory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_crop_records_updated_at BEFORE UPDATE ON public.crop_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();