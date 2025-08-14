-- ===================================================================================
-- 🌾 CROPGENIUS AFRICA - PRODUCTION DATABASE MIGRATION
-- ===================================================================================
-- THIS IS NOT A LIE. THIS IS TRUTH.
-- Complete schema for real farm health monitoring system
-- Validates against existing codebase requirements
-- ===================================================================================

-- ===================================================================================
-- FARMS TABLE - Core farm management
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    location JSONB DEFAULT '{"lat": -1.2921, "lng": 36.8219}'::jsonb,
    size DECIMAL(10,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- FIELDS TABLE - Individual field management
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size DECIMAL(10,2) NOT NULL,
    crop_type_id VARCHAR(100),
    planted_at TIMESTAMP WITH TIME ZONE,
    harvest_date TIMESTAMP WITH TIME ZONE,
    location JSONB DEFAULT '{"lat": -1.2921, "lng": 36.8219}'::jsonb,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- FARM_HEALTH_SNAPSHOTS - Real-time health monitoring
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.farm_health_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    health_score DECIMAL(3,2) NOT NULL CHECK (health_score >= 0 AND health_score <= 1),
    trust_indicators JSONB NOT NULL DEFAULT '[]',
    health_factors JSONB NOT NULL DEFAULT '[]',
    data_quality DECIMAL(3,2) DEFAULT 0.8 CHECK (data_quality >= 0 AND data_quality <= 1),
    analysis_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- AI_INSIGHTS_REQUESTS - Track AI analysis requests
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    parameters JSONB DEFAULT '{}',
    health_score DECIMAL(3,2),
    response_data JSONB,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- PROFILES TABLE - Extend user profiles for farmers
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    location JSONB DEFAULT '{"lat": -1.2921, "lng": 36.8219}'::jsonb,
    phone_number VARCHAR(20),
    farming_experience_years INTEGER DEFAULT 0,
    total_farm_size DECIMAL(10,2) DEFAULT 0.0,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- TASKS TABLE - Farm task management
-- ===================================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================================
-- INDEXES - For performance optimization
-- ===================================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_farm_id ON public.farm_health_snapshots(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_snapshots_created_at ON public.farm_health_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id ON public.ai_insights_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_field_id ON public.ai_insights_requests(field_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_farm_id ON public.ai_insights_requests(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_field_id ON public.tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- ===================================================================================
-- REALTIME SUBSCRIPTIONS - Enable live updates
-- ===================================================================================
ALTER TABLE public.farm_health_snapshots REPLICA IDENTITY FULL;
ALTER TABLE public.fields REPLICA IDENTITY FULL;
ALTER TABLE public.farms REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;

-- ===================================================================================
-- RLS (Row Level Security) - Secure access by user
-- ===================================================================================
-- Enable RLS on all tables
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Farms RLS - Users can only see their own farms
CREATE POLICY "Users can view own farms" ON public.farms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms" ON public.farms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own farms" ON public.farms
    FOR DELETE USING (auth.uid() = user_id);

-- Fields RLS - Users can see fields from their farms
CREATE POLICY "Users can view fields from own farms" ON public.fields
    FOR SELECT USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert fields to own farms" ON public.fields
    FOR INSERT WITH CHECK (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update fields from own farms" ON public.fields
    FOR UPDATE USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete fields from own farms" ON public.fields
    FOR DELETE USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        )
    );

-- Health snapshots RLS
CREATE POLICY "Users can view health snapshots from own farms" ON public.farm_health_snapshots
    FOR SELECT USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert health snapshots" ON public.farm_health_snapshots
    FOR INSERT WITH CHECK (true); -- Allow system services

-- AI insights RLS
CREATE POLICY "Users can view own AI insights" ON public.ai_insights_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI insights" ON public.ai_insights_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tasks RLS
CREATE POLICY "Users can view tasks from own farms" ON public.tasks
    FOR SELECT USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        ) OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can insert tasks to own farms" ON public.tasks
    FOR INSERT WITH CHECK (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        ) OR assigned_to = auth.uid()
    );

CREATE POLICY "Users can update tasks from own farms" ON public.tasks
    FOR UPDATE USING (
        farm_id IN (
            SELECT id FROM public.farms WHERE user_id = auth.uid()
        ) OR assigned_to = auth.uid()
    );

-- Profiles RLS
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===================================================================================
-- TRIGGERS - Automatic updated_at timestamps
-- ===================================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_farms_updated_at
    BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_fields_updated_at
    BEFORE UPDATE ON public.fields
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================================================
-- EXTENSIONS - Enable required PostgreSQL extensions
-- ===================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ===================================================================================
-- SEED DATA - Minimal test data for verification
-- ===================================================================================
INSERT INTO public.profiles (id, full_name, farming_experience_years, total_farm_size, preferred_language) VALUES 
('00000000-0000-0000-0000-000000000000', 'Test Farmer', 5, 10.5, 'en')
ON CONFLICT (id) DO NOTHING;

-- ===================================================================================
-- VERIFICATION QUERIES - Validate successful migration
-- ===================================================================================
-- Check all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('farms', 'fields', 'farm_health_snapshots', 'ai_insights_requests', 'profiles', 'tasks')
ORDER BY tablename;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('farms', 'fields', 'farm_health_snapshots', 'ai_insights_requests', 'profiles', 'tasks')
ORDER BY tablename, indexname;

-- ===================================================================================
-- END OF TRUTH
-- ===================================================================================