-- Fix farm_plans table schema issues
-- Run this in Supabase SQL Editor

-- Create farm_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS farm_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  crop_type TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farm_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS farm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_plan_id UUID REFERENCES farm_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
ALTER TABLE farm_plans ADD COLUMN IF NOT EXISTS crop_type TEXT NOT NULL DEFAULT 'maize';
ALTER TABLE farm_plans ADD COLUMN IF NOT EXISTS description TEXT;

-- Enable RLS
ALTER TABLE farm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for farm_plans
CREATE POLICY "Users can view own farm plans" ON farm_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farm plans" ON farm_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farm plans" ON farm_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own farm plans" ON farm_plans
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for farm_tasks
CREATE POLICY "Users can view tasks for own farm plans" ON farm_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farm_plans 
      WHERE farm_plans.id = farm_tasks.farm_plan_id 
      AND farm_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for own farm plans" ON farm_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farm_plans 
      WHERE farm_plans.id = farm_tasks.farm_plan_id 
      AND farm_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for own farm plans" ON farm_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farm_plans 
      WHERE farm_plans.id = farm_tasks.farm_plan_id 
      AND farm_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for own farm plans" ON farm_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farm_plans 
      WHERE farm_plans.id = farm_tasks.farm_plan_id 
      AND farm_plans.user_id = auth.uid()
    )
  );