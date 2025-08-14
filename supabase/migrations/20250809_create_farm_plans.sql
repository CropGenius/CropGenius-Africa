-- Create farm_plans table
CREATE TABLE IF NOT EXISTS public.farm_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farm_plan_tasks table
CREATE TABLE IF NOT EXISTS public.farm_plan_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES public.farm_plans(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    category VARCHAR(20) DEFAULT 'other' CHECK (category IN ('planting', 'irrigation', 'fertilizing', 'harvesting', 'pest_control', 'other')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    estimated_duration INTEGER NOT NULL CHECK (estimated_duration > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farm_plans_user_id ON public.farm_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_plans_status ON public.farm_plans(status);
CREATE INDEX IF NOT EXISTS idx_farm_plan_tasks_plan_id ON public.farm_plan_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_farm_plan_tasks_field_id ON public.farm_plan_tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_farm_plan_tasks_due_date ON public.farm_plan_tasks(due_date);

-- Add RLS policies
ALTER TABLE public.farm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_plan_tasks ENABLE ROW LEVEL SECURITY;

-- Farm plans policies
CREATE POLICY "Users can view their own farm plans" ON public.farm_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm plans" ON public.farm_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm plans" ON public.farm_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm plans" ON public.farm_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Farm plan tasks policies
CREATE POLICY "Users can view tasks from their plans" ON public.farm_plan_tasks
    FOR SELECT USING (
        plan_id IN (SELECT id FROM public.farm_plans WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create tasks in their plans" ON public.farm_plan_tasks
    FOR INSERT WITH CHECK (
        plan_id IN (SELECT id FROM public.farm_plans WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update tasks in their plans" ON public.farm_plan_tasks
    FOR UPDATE USING (
        plan_id IN (SELECT id FROM public.farm_plans WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete tasks in their plans" ON public.farm_plan_tasks
    FOR DELETE USING (
        plan_id IN (SELECT id FROM public.farm_plans WHERE user_id = auth.uid())
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_farm_plans_updated_at BEFORE UPDATE ON public.farm_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_plan_tasks_updated_at BEFORE UPDATE ON public.farm_plan_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();