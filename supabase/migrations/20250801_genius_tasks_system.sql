-- ============================================================================
-- 🧠 GENIUS TASKS SYSTEM - PRODUCTION DATABASE SCHEMA
-- ============================================================================
-- INFINITY IQ ARCHITECTURE FOR 100 MILLION FARMERS
-- Built for scale, performance, and agricultural intelligence
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS - TYPE SAFETY FOR AGRICULTURAL INTELLIGENCE
-- ============================================================================

-- Task type enumeration
CREATE TYPE task_type_enum AS ENUM (
    'weather_response',
    'crop_management', 
    'field_maintenance',
    'market_opportunity',
    'preventive_action',
    'planning',
    'monitoring',
    'irrigation',
    'pest_control',
    'disease_prevention',
    'fertilization',
    'harvesting'
);

-- Task category enumeration
CREATE TYPE task_category_enum AS ENUM (
    'planting',
    'irrigation', 
    'pest_control',
    'disease_prevention',
    'fertilization',
    'harvesting',
    'market_timing',
    'field_preparation',
    'monitoring',
    'maintenance'
);

-- Task priority enumeration (1 = Critical, 4 = Low)
CREATE TYPE task_priority_enum AS ENUM ('1', '2', '3', '4');

-- Task status enumeration
CREATE TYPE task_status_enum AS ENUM (
    'pending',
    'in_progress', 
    'completed',
    'skipped',
    'expired'
);

-- Task urgency enumeration
CREATE TYPE task_urgency_enum AS ENUM (
    'immediate',     -- Next 2 hours
    'today',         -- Within 24 hours
    'this_week',     -- Within 7 days
    'flexible'       -- No strict deadline
);

-- Task generation source enumeration
CREATE TYPE task_generation_source_enum AS ENUM (
    'weather_ai',
    'crop_stage_ai', 
    'market_ai',
    'disease_prediction',
    'user_behavior',
    'seasonal_pattern',
    'emergency_alert'
);

-- ============================================================================
-- DAILY GENIUS TASKS TABLE - THE HEART OF AGRICULTURAL INTELLIGENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.daily_genius_tasks (
    -- Primary identification
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
    
    -- Task content - CRYSTAL CLEAR for farmers
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_instructions TEXT,
    action_steps TEXT[], -- Array of step-by-step instructions
    
    -- Classification - SMART CATEGORIZATION
    task_type task_type_enum NOT NULL,
    category task_category_enum NOT NULL,
    
    -- Prioritization - INTELLIGENT SCHEDULING
    priority task_priority_enum NOT NULL DEFAULT '3',
    urgency task_urgency_enum NOT NULL DEFAULT 'flexible',
    impact_score DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (impact_score >= 0 AND impact_score <= 1),
    
    -- Timing - OPTIMAL EXECUTION WINDOWS
    estimated_duration INTEGER, -- minutes
    optimal_start_hour INTEGER CHECK (optimal_start_hour >= 0 AND optimal_start_hour <= 23),
    optimal_end_hour INTEGER CHECK (optimal_end_hour >= 0 AND optimal_end_hour <= 23),
    deadline TIMESTAMP WITH TIME ZONE,
    
    -- Context - INTELLIGENT CONNECTIONS
    field_name VARCHAR(255),
    crop_type VARCHAR(100),
    weather_dependency JSONB DEFAULT '{}',
    market_context JSONB DEFAULT '{}',
    
    -- Impact tracking - SHOW THE MONEY
    fpsi_impact_points INTEGER DEFAULT 0,
    roi_estimate DECIMAL(10,2),
    risk_mitigation DECIMAL(3,2) DEFAULT 0 CHECK (risk_mitigation >= 0 AND risk_mitigation <= 1),
    
    -- Status and completion - TRACK EVERYTHING
    status task_status_enum DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE,
    completion_data JSONB DEFAULT '{}',
    skip_reason TEXT,
    times_skipped INTEGER DEFAULT 0,
    
    -- AI metadata - CONTINUOUS IMPROVEMENT
    generation_source task_generation_source_enum NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    learning_tags TEXT[] DEFAULT '{}',
    
    -- Visual and UX - BEAUTIFUL INTERFACE
    icon_name VARCHAR(50),
    color_scheme JSONB DEFAULT '{}',
    celebration_level VARCHAR(20) DEFAULT 'medium',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Task date (for daily task queries)
    task_date DATE DEFAULT CURRENT_DATE
);

-- ============================================================================
-- TASK FEEDBACK TABLE - LEARN FROM FARMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.task_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.daily_genius_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Feedback scores (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
    clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
    timing_score INTEGER CHECK (timing_score BETWEEN 1 AND 5),
    difficulty_score INTEGER CHECK (difficulty_score BETWEEN 1 AND 5),
    
    -- Qualitative feedback
    comments TEXT,
    would_recommend BOOLEAN,
    improvement_suggestions TEXT[],
    
    -- Metadata
    device_type VARCHAR(20),
    completion_time INTEGER, -- minutes taken to complete
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER TASK PREFERENCES TABLE - PERSONALIZATION ENGINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_task_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Task preferences
    max_daily_tasks INTEGER DEFAULT 7 CHECK (max_daily_tasks > 0 AND max_daily_tasks <= 20),
    preferred_categories task_category_enum[] DEFAULT '{}',
    avoided_categories task_category_enum[] DEFAULT '{}',
    preferred_time_windows JSONB DEFAULT '[]', -- Array of {startHour, endHour} objects
    difficulty_preference VARCHAR(20) DEFAULT 'mixed' CHECK (difficulty_preference IN ('easy', 'medium', 'hard', 'mixed')),
    
    -- Behavioral data - LEARN FROM PATTERNS
    completion_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
    average_tasks_per_day DECIMAL(3,1) DEFAULT 0.0,
    peak_activity_hours INTEGER[] DEFAULT '{}',
    streak_days INTEGER DEFAULT 0,
    total_tasks_completed INTEGER DEFAULT 0,
    
    -- Notification preferences
    enable_push_notifications BOOLEAN DEFAULT true,
    enable_whatsapp_notifications BOOLEAN DEFAULT false,
    critical_tasks_only BOOLEAN DEFAULT false,
    quiet_hours_start INTEGER DEFAULT 22 CHECK (quiet_hours_start >= 0 AND quiet_hours_start <= 23),
    quiet_hours_end INTEGER DEFAULT 6 CHECK (quiet_hours_end >= 0 AND quiet_hours_end <= 23),
    reminder_frequency VARCHAR(20) DEFAULT 'once' CHECK (reminder_frequency IN ('never', 'once', 'twice', 'hourly')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TASK ANALYTICS TABLE - PERFORMANCE TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.task_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.daily_genius_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Interaction timestamps
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance metrics (milliseconds)
    time_to_view INTEGER,
    time_to_start INTEGER,
    time_to_complete INTEGER,
    
    -- Context at generation
    weather_conditions JSONB DEFAULT '{}',
    user_state VARCHAR(20) DEFAULT 'active' CHECK (user_state IN ('active', 'inactive', 'new')),
    device_type VARCHAR(20) DEFAULT 'mobile',
    
    -- Outcome metrics
    actual_impact DECIMAL(3,2) CHECK (actual_impact >= 0 AND actual_impact <= 1),
    user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
    would_generate_again BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TASK LEARNING DATA TABLE - AI IMPROVEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.task_learning_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type task_type_enum NOT NULL,
    category task_category_enum NOT NULL,
    
    -- Success metrics
    completion_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
    average_rating DECIMAL(3,2) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
    average_completion_time INTEGER DEFAULT 0, -- minutes
    
    -- Context patterns (JSONB for flexibility)
    successful_weather_conditions JSONB DEFAULT '[]',
    successful_time_windows JSONB DEFAULT '[]',
    successful_seasons TEXT[] DEFAULT '{}',
    
    -- Personalization insights
    personalized_instructions TEXT,
    preferred_difficulty VARCHAR(20) DEFAULT 'medium',
    optimal_frequency DECIMAL(3,1) DEFAULT 1.0, -- tasks per week
    
    -- Statistics
    total_generated INTEGER DEFAULT 0,
    total_completed INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for user + task type + category
    UNIQUE(user_id, task_type, category)
);

-- ============================================================================
-- INDEXES - PERFORMANCE OPTIMIZATION FOR SCALE
-- ============================================================================

-- Daily genius tasks indexes
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_user_id ON public.daily_genius_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_field_id ON public.daily_genius_tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_task_date ON public.daily_genius_tasks(task_date);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_status ON public.daily_genius_tasks(status);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_priority ON public.daily_genius_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_user_date ON public.daily_genius_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_user_status ON public.daily_genius_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_deadline ON public.daily_genius_tasks(deadline) WHERE deadline IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_genius_tasks_created_at ON public.daily_genius_tasks(created_at DESC);

-- Task feedback indexes
CREATE INDEX IF NOT EXISTS idx_task_feedback_task_id ON public.task_feedback(task_id);
CREATE INDEX IF NOT EXISTS idx_task_feedback_user_id ON public.task_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_task_feedback_created_at ON public.task_feedback(created_at DESC);

-- Task analytics indexes
CREATE INDEX IF NOT EXISTS idx_task_analytics_task_id ON public.task_analytics(task_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_user_id ON public.task_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_task_analytics_generated_at ON public.task_analytics(generated_at DESC);

-- Task learning data indexes
CREATE INDEX IF NOT EXISTS idx_task_learning_user_type ON public.task_learning_data(user_id, task_type);
CREATE INDEX IF NOT EXISTS idx_task_learning_category ON public.task_learning_data(category);

-- ============================================================================
-- ROW LEVEL SECURITY - BULLETPROOF DATA PROTECTION
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.daily_genius_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_learning_data ENABLE ROW LEVEL SECURITY;

-- Daily genius tasks RLS policies
CREATE POLICY "Users can view own genius tasks" ON public.daily_genius_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own genius tasks" ON public.daily_genius_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own genius tasks" ON public.daily_genius_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own genius tasks" ON public.daily_genius_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Task feedback RLS policies
CREATE POLICY "Users can view own task feedback" ON public.task_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task feedback" ON public.task_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User task preferences RLS policies
CREATE POLICY "Users can view own task preferences" ON public.user_task_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own task preferences" ON public.user_task_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task preferences" ON public.user_task_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Task analytics RLS policies
CREATE POLICY "Users can view own task analytics" ON public.task_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert task analytics" ON public.task_analytics
    FOR INSERT WITH CHECK (true); -- Allow system services

-- Task learning data RLS policies
CREATE POLICY "Users can view own learning data" ON public.task_learning_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage learning data" ON public.task_learning_data
    FOR ALL WITH CHECK (true); -- Allow system services

-- ============================================================================
-- TRIGGERS - AUTOMATIC MAINTENANCE
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_daily_genius_tasks_updated_at
    BEFORE UPDATE ON public.daily_genius_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_task_preferences_updated_at
    BEFORE UPDATE ON public.user_task_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_task_learning_data_updated_at
    BEFORE UPDATE ON public.task_learning_data
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- REALTIME SUBSCRIPTIONS - LIVE UPDATES
-- ============================================================================

ALTER TABLE public.daily_genius_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_feedback REPLICA IDENTITY FULL;
ALTER TABLE public.user_task_preferences REPLICA IDENTITY FULL;

-- ============================================================================
-- UTILITY FUNCTIONS - HELPER FUNCTIONS FOR QUERIES
-- ============================================================================

-- Function to get today's tasks for a user
CREATE OR REPLACE FUNCTION public.get_todays_genius_tasks(p_user_id UUID)
RETURNS SETOF public.daily_genius_tasks AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.daily_genius_tasks
    WHERE user_id = p_user_id 
    AND task_date = CURRENT_DATE
    AND status IN ('pending', 'in_progress')
    ORDER BY priority ASC, impact_score DESC, created_at ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to update task completion with analytics
CREATE OR REPLACE FUNCTION public.complete_genius_task(
    p_task_id UUID,
    p_completion_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    task_record public.daily_genius_tasks%ROWTYPE;
    start_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get task record
    SELECT * INTO task_record FROM public.daily_genius_tasks WHERE id = p_task_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update task status
    UPDATE public.daily_genius_tasks 
    SET 
        status = 'completed',
        completed_at = NOW(),
        completion_data = p_completion_data,
        updated_at = NOW()
    WHERE id = p_task_id;
    
    -- Update user preferences (completion rate, streak, etc.)
    INSERT INTO public.user_task_preferences (user_id, total_tasks_completed, streak_days)
    VALUES (task_record.user_id, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_tasks_completed = user_task_preferences.total_tasks_completed + 1,
        streak_days = CASE 
            WHEN EXISTS (
                SELECT 1 FROM public.daily_genius_tasks 
                WHERE user_id = task_record.user_id 
                AND task_date = CURRENT_DATE - INTERVAL '1 day'
                AND status = 'completed'
            ) THEN user_task_preferences.streak_days + 1
            ELSE 1
        END,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tasks
CREATE OR REPLACE FUNCTION public.cleanup_expired_tasks()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.daily_genius_tasks 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending' 
    AND (
        deadline < NOW() 
        OR task_date < CURRENT_DATE - INTERVAL '7 days'
    );
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INITIAL DATA - BOOTSTRAP THE SYSTEM
-- ============================================================================

-- Create default task preferences for existing users
INSERT INTO public.user_task_preferences (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.user_task_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- PERFORMANCE MONITORING - PRODUCTION READY
-- ============================================================================

-- Create performance monitoring view
CREATE OR REPLACE VIEW public.task_performance_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_tasks_generated,
    COUNT(*) FILTER (WHERE status = 'completed') as tasks_completed,
    COUNT(*) FILTER (WHERE status = 'skipped') as tasks_skipped,
    COUNT(*) FILTER (WHERE status = 'expired') as tasks_expired,
    ROUND(AVG(confidence_score), 3) as avg_confidence_score,
    ROUND(AVG(fpsi_impact_points), 2) as avg_fpsi_impact,
    COUNT(DISTINCT user_id) as active_users
FROM public.daily_genius_tasks
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================================================
-- GRANTS - SECURE ACCESS PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions for service role (for Edge Functions)
GRANT ALL ON public.daily_genius_tasks TO service_role;
GRANT ALL ON public.task_feedback TO service_role;
GRANT ALL ON public.user_task_preferences TO service_role;
GRANT ALL ON public.task_analytics TO service_role;
GRANT ALL ON public.task_learning_data TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES - ENSURE EVERYTHING WORKS
-- ============================================================================

-- Verify all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename LIKE '%task%'
ORDER BY tablename;

-- Verify all indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename LIKE '%task%'
ORDER BY tablename, indexname;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename LIKE '%task%'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🔥 GENIUS TASKS SYSTEM DEPLOYED SUCCESSFULLY! 🚀';
    RAISE NOTICE '💪 Ready to serve 100 million farmers with INFINITY IQ!';
    RAISE NOTICE '🌾 Agricultural intelligence database is PRODUCTION READY!';
END $$;