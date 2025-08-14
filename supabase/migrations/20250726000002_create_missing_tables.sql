-- 🌅 CROPGENIUS DIVINE TRANSFORMATION - MISSING INFRASTRUCTURE
-- =============================================================
-- THIS MIGRATION CREATES THE MISSING TABLES FOR 100M FARMERS
-- CLEAN, OPTIMIZED, PRODUCTION-READY WITH SUPABASE MAGIC

-- 📋 TABLE 1: FARM PLANS - THE HEART OF AGRICULTURAL PLANNING
CREATE TABLE IF NOT EXISTS public.farm_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    crop_type TEXT NOT NULL CHECK (crop_type IN (
        'maize', 'beans', 'cassava', 'tomato', 'potato', 'sweet_potato', 
        'sorghum', 'millet', 'rice', 'wheat', 'banana', 'mango', 'avocado',
        'coffee', 'tea', 'cotton', 'sunflower', 'groundnuts', 'soybeans'
    )),
    planting_date DATE NOT NULL,
    expected_yield INTEGER NOT NULL CHECK (expected_yield > 0),
    yield_unit TEXT DEFAULT 'kg/ha',
    season TEXT NOT NULL CHECK (season IN ('long_rains', 'short_rains', 'dry_season')),
    planting_method TEXT CHECK (planting_method IN ('direct_seeding', 'transplanting', 'broadcasting')),
    seed_variety TEXT,
    seed_rate DECIMAL(8,2),
    spacing_rows DECIMAL(4,1),
    spacing_plants DECIMAL(4,1),
    fertilizer_plan JSONB DEFAULT '{}',
    pest_management_plan JSONB DEFAULT '{}',
    irrigation_plan JSONB DEFAULT '{}',
    tasks JSONB DEFAULT '[]',
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 📊 TABLE 2: MARKET DATA - LIVE COMMODITY PRICES
CREATE TABLE IF NOT EXISTS public.market_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity TEXT NOT NULL CHECK (commodity IN (
        'maize', 'beans', 'cassava', 'tomato', 'potato', 'sweet_potato',
        'sorghum', 'millet', 'rice', 'wheat', 'banana', 'mango', 'avocado',
        'coffee', 'tea', 'cotton', 'sunflower', 'groundnuts', 'soybeans'
    )),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    price_unit TEXT DEFAULT 'KES/kg',
    market_name TEXT NOT NULL,
    market_location JSONB DEFAULT '{}',
    date DATE NOT NULL,
    volume INTEGER DEFAULT 0,
    source TEXT NOT NULL CHECK (source IN ('kace', 'nse', 'local_market', 'government', 'cooperative')),
    quality_grade TEXT DEFAULT 'grade_1' CHECK (quality_grade IN ('grade_1', 'grade_2', 'grade_3', 'rejected')),
    weather_impact JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 TABLE 3: AI CONVERSATIONS - CONTEXTUAL AGRICULTURAL CHAT
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    context JSONB DEFAULT '{}',
    intent TEXT CHECK (intent IN (
        'crop_advice', 'pest_control', 'weather_query', 'market_info',
        'planting_schedule', 'harvest_timing', 'fertilizer_recommendation',
        'disease_diagnosis', 'irrigation_advice', 'general_info'
    )),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    related_fields JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ TABLE 4: TASK MANAGEMENT - REAL FARM OPERATIONS
CREATE TABLE IF NOT EXISTS public.farm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE,
    farm_plan_id UUID REFERENCES public.farm_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL CHECK (task_type IN (
        'land_preparation', 'planting', 'watering', 'fertilizing', 'pest_control',
        'weeding', 'harvesting', 'post_harvest', 'transport', 'market_selling'
    )),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    due_date DATE,
    completed_date DATE,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    assigned_to JSONB DEFAULT '{}',
    resources_needed JSONB DEFAULT '[]',
    weather_dependency BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🌦️ TABLE 5: WEATHER CACHE - INTELLIGENT CACHING
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location JSONB NOT NULL,
    latitude DECIMAL(8,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    forecast_date DATE NOT NULL,
    temperature_max DECIMAL(4,1),
    temperature_min DECIMAL(4,1),
    precipitation_probability INTEGER CHECK (precipitation_probability >= 0 AND precipitation_probability <= 100),
    precipitation_amount DECIMAL(5,2),
    humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
    wind_speed DECIMAL(4,1),
    wind_direction INTEGER,
    uv_index INTEGER,
    conditions TEXT,
    alerts JSONB DEFAULT '[]',
    source TEXT DEFAULT 'openweathermap',
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
    UNIQUE(latitude, longitude, forecast_date, source)
);

-- 🔄 TABLE 6: REAL-TIME SUBSCRIPTIONS TRACKING
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN (
        'market_alerts', 'weather_alerts', 'field_health', 'price_drops', 'harvest_reminders'
    )),
    criteria JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    notification_methods JSONB DEFAULT '["push", "email"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔍 OPTIMIZATION INDEXES
CREATE INDEX IF NOT EXISTS idx_farm_plans_user_id ON public.farm_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_plans_field_id ON public.farm_plans(field_id);
CREATE INDEX IF NOT EXISTS idx_farm_plans_crop_type ON public.farm_plans(crop_type);
CREATE INDEX IF NOT EXISTS idx_farm_plans_planting_date ON public.farm_plans(planting_date);
CREATE INDEX IF NOT EXISTS idx_market_data_commodity_date ON public.market_data(commodity, date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_market_name ON public.market_data(market_name);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_user_id ON public.farm_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_field_id ON public.farm_tasks(field_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_due_date ON public.farm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON public.weather_cache(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_cache_forecast_date ON public.weather_cache(forecast_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_type ON public.user_subscriptions(user_id, subscription_type);

-- 🛡️ ROW LEVEL SECURITY - FORTRESS MODE
ALTER TABLE public.farm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Farm Plans Security
CREATE POLICY "Users can view their own farm plans"
    ON public.farm_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farm plans"
    ON public.farm_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farm plans"
    ON public.farm_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farm plans"
    ON public.farm_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Market Data Security (Read-only for users)
CREATE POLICY "Users can read market data"
    ON public.market_data FOR SELECT
    USING (true);

-- AI Conversations Security
CREATE POLICY "Users can view their own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Farm Tasks Security
CREATE POLICY "Users can manage their own tasks"
    ON public.farm_tasks FOR ALL
    USING (auth.uid() = user_id);

-- Weather Cache Security (Read-only for users)
CREATE POLICY "Users can read weather cache"
    ON public.weather_cache FOR SELECT
    USING (true);

-- User Subscriptions Security
CREATE POLICY "Users can manage their own subscriptions"
    ON public.user_subscriptions FOR ALL
    USING (auth.uid() = user_id);

-- 🎯 REAL-TIME SUBSCRIPTIONS SETUP
CREATE PUBLICATION farm_changes FOR TABLE public.farm_plans, public.farm_tasks;
CREATE PUBLICATION market_changes FOR TABLE public.market_data;
CREATE PUBLICATION ai_changes FOR TABLE public.ai_conversations;

-- 🌟 COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE public.farm_plans IS 'Real farm planning data for 100M African farmers';
COMMENT ON TABLE public.market_data IS 'Live commodity prices from KACE, NSE, and local markets';
COMMENT ON TABLE public.ai_conversations IS 'Contextual agricultural AI chat history';
COMMENT ON TABLE public.farm_tasks IS 'Real-time task management for farm operations';
COMMENT ON TABLE public.weather_cache IS 'Intelligent weather caching for performance';
COMMENT ON TABLE public.user_subscriptions IS 'Real-time notification preferences';

-- 🔥 PERFORMANCE OPTIMIZATION FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Auto-update timestamps
CREATE TRIGGER update_farm_plans_updated_at BEFORE UPDATE ON public.farm_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_farm_tasks_updated_at BEFORE UPDATE ON public.farm_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();