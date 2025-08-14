-- 🔥💪 ORGANIC INTELLIGENCE WEAPON ENHANCEMENT - INFINITY IQ ARCHITECTURE
-- Enhancing the existing solid foundation with missing production-ready components
-- Built for 100 million farmers with surgical precision

-- ============================================================================
-- REAL USER CONTEXT COLLECTION SYSTEM
-- ============================================================================

-- User Farm Context (Real data collection, no hardcoded values)
CREATE TABLE IF NOT EXISTS user_farm_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location Data (Real GPS coordinates)
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  region VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  elevation_meters INTEGER,
  
  -- Farm Details
  total_farm_size_hectares DECIMAL(8,2) NOT NULL,
  primary_crops JSONB NOT NULL, -- [{"crop": "tomato", "area_hectares": 0.5, "variety": "roma", "planting_date": "2024-03-15"}]
  soil_type VARCHAR(50) NOT NULL,
  soil_ph DECIMAL(3,1),
  organic_matter_percentage DECIMAL(4,2),
  
  -- Available Resources (Real inventory)
  available_resources JSONB NOT NULL, -- [{"name": "banana_peels", "quantity": "daily", "cost_per_unit": 0, "availability": "abundant"}]
  local_suppliers JSONB DEFAULT '[]', -- Local organic input suppliers
  
  -- Farming Experience
  years_farming INTEGER DEFAULT 0,
  organic_experience_years INTEGER DEFAULT 0,
  current_practices TEXT[] DEFAULT '{}',
  
  -- Goals and Preferences
  primary_goals TEXT[] DEFAULT '{}', -- ["increase_yield", "reduce_costs", "go_organic"]
  budget_constraints JSONB DEFAULT '{}',
  certification_interest BOOLEAN DEFAULT false,
  
  -- Data Collection Status
  data_completeness_percentage INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Weather Integration Data
CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location Reference
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  
  -- Current Weather
  temperature_celsius DECIMAL(4,1) NOT NULL,
  humidity_percentage INTEGER NOT NULL,
  rainfall_mm DECIMAL(6,2) DEFAULT 0,
  wind_speed_kmh DECIMAL(5,2) DEFAULT 0,
  conditions VARCHAR(50) NOT NULL,
  uv_index INTEGER DEFAULT 0,
  
  -- Soil Conditions
  soil_moisture_percentage INTEGER,
  soil_temperature_celsius DECIMAL(4,1),
  
  -- Data Source
  weather_provider VARCHAR(50) NOT NULL, -- openweather, weatherapi, etc
  data_timestamp TIMESTAMP NOT NULL,
  forecast_days INTEGER DEFAULT 0, -- 0 for current, >0 for forecast
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weather-Based Action Recommendations
CREATE TABLE IF NOT EXISTS weather_action_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Weather Trigger
  weather_condition VARCHAR(100) NOT NULL,
  temperature_range VARCHAR(50),
  humidity_range VARCHAR(50),
  rainfall_prediction VARCHAR(100),
  
  -- Recommended Actions
  recommended_organic_actions TEXT[] NOT NULL,
  optimal_timing VARCHAR(100) NOT NULL, -- "next 2 hours", "tomorrow morning"
  urgency_level VARCHAR(20) NOT NULL CHECK (urgency_level IN ('immediate', 'today', 'this_week')),
  
  -- Impact Prediction
  yield_impact_percentage DECIMAL(5,2) DEFAULT 0,
  money_saved_estimate DECIMAL(10,2) DEFAULT 0,
  success_probability DECIMAL(3,2) DEFAULT 0, -- 0-1.00
  
  -- Targeting
  applicable_crops TEXT[] DEFAULT '{}',
  growth_stages TEXT[] DEFAULT '{}',
  
  -- Scheduling
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW()
);-- ======
======================================================================
-- COMPREHENSIVE RECIPE DATABASE (200+ VERIFIED RECIPES)
-- ============================================================================

-- Recipe Categories and Effectiveness Tracking
CREATE TABLE IF NOT EXISTS recipe_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  sort_order INTEGER DEFAULT 0
);

-- Recipe Effectiveness Tracking by Region
CREATE TABLE IF NOT EXISTS recipe_effectiveness_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES organic_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Usage Details
  usage_date DATE NOT NULL,
  crop_type VARCHAR(100) NOT NULL,
  problem_targeted VARCHAR(255) NOT NULL,
  
  -- Results
  effectiveness_rating INTEGER NOT NULL CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  actual_cost DECIMAL(8,2) DEFAULT 0,
  time_taken_minutes INTEGER DEFAULT 0,
  
  -- Outcome Measurement
  problem_solved BOOLEAN DEFAULT false,
  yield_impact_observed VARCHAR(100),
  side_effects TEXT,
  would_recommend BOOLEAN DEFAULT true,
  
  -- Regional Data
  region VARCHAR(100),
  climate_conditions VARCHAR(100),
  soil_type VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- COMMUNITY PLATFORM TABLES
-- ============================================================================

-- Farmer Profiles for Community
CREATE TABLE IF NOT EXISTS farmer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Public Profile
  display_name VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  
  -- Farming Details
  primary_crops TEXT[] DEFAULT '{}',
  farm_size_category VARCHAR(50), -- small, medium, large
  organic_level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced, expert
  years_experience INTEGER DEFAULT 0,
  
  -- Location (Generalized for privacy)
  region VARCHAR(100),
  country VARCHAR(100),
  
  -- Community Stats
  reputation_score INTEGER DEFAULT 0,
  helpful_answers_count INTEGER DEFAULT 0,
  success_stories_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  
  -- Achievements
  badges JSONB DEFAULT '[]', -- [{"badge": "organic_master", "earned_date": "2024-01-15"}]
  total_money_saved DECIMAL(12,2) DEFAULT 0,
  total_yield_improvement DECIMAL(8,2) DEFAULT 0,
  
  -- Privacy Settings
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'community', 'private')),
  show_location BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Success Stories Sharing
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Story Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  recipe_used_id UUID REFERENCES organic_recipes(id),
  
  -- Before/After Data
  before_photo_url TEXT,
  after_photo_url TEXT,
  before_yield_kg DECIMAL(8,2),
  after_yield_kg DECIMAL(8,2),
  money_saved DECIMAL(10,2) DEFAULT 0,
  time_period_days INTEGER NOT NULL,
  
  -- Crop and Problem Context
  crop_type VARCHAR(100) NOT NULL,
  problem_solved VARCHAR(255) NOT NULL,
  location_region VARCHAR(100),
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community Questions and Answers
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Question Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  
  -- Context
  crop_type VARCHAR(100),
  problem_urgency VARCHAR(20) DEFAULT 'medium' CHECK (problem_urgency IN ('low', 'medium', 'high', 'critical')),
  location_region VARCHAR(100),
  
  -- Media
  image_urls TEXT[] DEFAULT '{}',
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  answers_count INTEGER DEFAULT 0,
  upvotes_count INTEGER DEFAULT 0,
  
  -- Status
  is_answered BOOLEAN DEFAULT false,
  best_answer_id UUID,
  is_closed BOOLEAN DEFAULT false,
  
  -- Tags for searchability
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community Answers
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Answer Content
  answer_text TEXT NOT NULL,
  
  -- Media
  image_urls TEXT[] DEFAULT '{}',
  
  -- Engagement
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  
  -- Quality Indicators
  is_verified BOOLEAN DEFAULT false,
  verified_by_expert BOOLEAN DEFAULT false,
  helpfulness_score DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);-- =========
===================================================================
-- PREMIUM FEATURES TRACKING
-- ============================================================================

-- Premium Subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Details
  plan_type VARCHAR(50) NOT NULL, -- basic, pro, enterprise
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  
  -- Billing
  monthly_price DECIMAL(8,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'NGN',
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  trial_end_date DATE,
  
  -- Usage Tracking
  daily_actions_used INTEGER DEFAULT 0,
  daily_actions_limit INTEGER DEFAULT 3,
  premium_recipes_accessed INTEGER DEFAULT 0,
  
  -- Features Access
  unlimited_actions BOOLEAN DEFAULT false,
  premium_recipes BOOLEAN DEFAULT false,
  certification_support BOOLEAN DEFAULT false,
  export_market_access BOOLEAN DEFAULT false,
  ai_consultant BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Premium Feature Usage Tracking
CREATE TABLE IF NOT EXISTS premium_feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feature Details
  feature_name VARCHAR(100) NOT NULL,
  usage_date DATE NOT NULL,
  usage_count INTEGER DEFAULT 1,
  
  -- Value Delivered
  estimated_value_delivered DECIMAL(10,2) DEFAULT 0,
  user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating >= 1 AND user_satisfaction_rating <= 5),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES FOR NEW TABLES
-- ============================================================================

-- User Farm Context Indexes
CREATE INDEX IF NOT EXISTS idx_user_farm_context_user_id ON user_farm_context(user_id);
CREATE INDEX IF NOT EXISTS idx_user_farm_context_location ON user_farm_context(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_farm_context_region ON user_farm_context(region, country);

-- Weather Data Indexes
CREATE INDEX IF NOT EXISTS idx_weather_data_user_id ON weather_data(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON weather_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_weather_data_timestamp ON weather_data(data_timestamp DESC);

-- Recipe Effectiveness Indexes
CREATE INDEX IF NOT EXISTS idx_recipe_effectiveness_recipe_id ON recipe_effectiveness_tracking(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_effectiveness_rating ON recipe_effectiveness_tracking(effectiveness_rating DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_effectiveness_region ON recipe_effectiveness_tracking(region);

-- Community Platform Indexes
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_region ON farmer_profiles(region, country);
CREATE INDEX IF NOT EXISTS idx_farmer_profiles_reputation ON farmer_profiles(reputation_score DESC);

CREATE INDEX IF NOT EXISTS idx_success_stories_user_id ON success_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_success_stories_crop_type ON success_stories(crop_type);
CREATE INDEX IF NOT EXISTS idx_success_stories_featured ON success_stories(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_success_stories_public ON success_stories(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_questions_user_id ON community_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_category ON community_questions(category);
CREATE INDEX IF NOT EXISTS idx_community_questions_answered ON community_questions(is_answered, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_questions_tags ON community_questions USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_community_answers_question_id ON community_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_user_id ON community_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_upvotes ON community_answers(upvotes_count DESC);

-- Premium Features Indexes
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON premium_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_end_date ON premium_subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_user_id ON premium_feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_feature_usage_feature ON premium_feature_usage(feature_name, usage_date);

-- ============================================================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_farm_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_action_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_effectiveness_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own farm context" ON user_farm_context
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own weather data" ON weather_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own weather recommendations" ON weather_action_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recipe effectiveness data" ON recipe_effectiveness_tracking
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own farmer profile" ON farmer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public farmer profiles" ON farmer_profiles
  FOR SELECT USING (profile_visibility = 'public' OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own success stories" ON success_stories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public success stories" ON success_stories
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own questions" ON community_questions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all questions" ON community_questions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own answers" ON community_answers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all answers" ON community_answers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own premium subscription" ON premium_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own premium usage" ON premium_feature_usage
  FOR ALL USING (auth.uid() = user_id);

COMMIT;