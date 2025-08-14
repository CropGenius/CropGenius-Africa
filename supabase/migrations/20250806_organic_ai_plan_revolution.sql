-- 🔥💪 ORGANIC AI PLAN REVOLUTION - PRODUCTION DATABASE SCHEMA
-- The economic independence engine for 100 million African farmers
-- INFINITY IQ ARCHITECTURE - BUILT FOR SCALE AND REAL IMPACT

-- ============================================================================
-- CORE ORGANIC ACTIONS SYSTEM
-- ============================================================================

-- Daily AI-Generated Organic Actions
CREATE TABLE IF NOT EXISTS organic_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action Details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('high', 'medium', 'low')),
  category VARCHAR(100) NOT NULL, -- pest_control, fertilizer, soil_health, growth_boost
  
  -- Target Context
  crop_type VARCHAR(100),
  field_name VARCHAR(100),
  target_problem VARCHAR(255),
  
  -- Ingredients (What they need)
  ingredients JSONB NOT NULL, -- [{"name": "banana_peels", "amount": "10 pieces", "commonName": "Banana skin", "whereToFind": "Kitchen waste"}]
  
  -- Method (How to do it)
  steps TEXT[] NOT NULL,
  preparation_time INTEGER DEFAULT 0, -- minutes
  
  -- Impact (Why it matters)
  yield_boost VARCHAR(50), -- "40% bigger tomatoes"
  money_saved DECIMAL(10,2) DEFAULT 0, -- Naira saved
  time_to_results VARCHAR(50), -- "2 weeks"
  organic_score_points INTEGER DEFAULT 0,
  
  -- Context
  weather_context VARCHAR(255),
  season_context VARCHAR(100),
  why_now TEXT, -- Urgency explanation
  
  -- Tracking
  completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  user_feedback TEXT,
  
  -- AI Generation Context
  ai_prompt_context JSONB, -- Store context used for generation
  generated_date TIMESTAMP DEFAULT NOW(),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organic Recipe Library (Searchable Knowledge Base)
CREATE TABLE IF NOT EXISTS organic_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- NULL for system recipes
  
  -- Recipe Identity
  title VARCHAR(255) NOT NULL,
  purpose VARCHAR(255) NOT NULL, -- What problem it solves
  category VARCHAR(100) NOT NULL, -- pesticide, fertilizer, soil_amendment, growth_enhancer
  
  -- Recipe Details
  ingredients JSONB NOT NULL,
  method TEXT[] NOT NULL,
  time_to_complete INTEGER DEFAULT 0, -- minutes
  difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  
  -- Effectiveness Data
  effectiveness_score DECIMAL(3,2) DEFAULT 0, -- 0-5.00
  cost_savings DECIMAL(10,2) DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0, -- 0-1.00
  
  -- Targeting
  crop_types TEXT[] DEFAULT '{}',
  target_problems TEXT[] DEFAULT '{}',
  seasonality TEXT[] DEFAULT '{}',
  
  -- Usage Tracking
  usage_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  
  -- Search Optimization
  search_keywords TEXT[] DEFAULT '{}',
  local_names JSONB DEFAULT '{}', -- {"neem": ["dongoyaro", "margosa"], "garlic": ["ayo", "tafarnuwa"]}
  
  -- Quality Control
  verified BOOLEAN DEFAULT FALSE,
  created_by_system BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Organic Progress Tracking
CREATE TABLE IF NOT EXISTS organic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core Metrics
  organic_readiness DECIMAL(5,2) DEFAULT 0, -- 0-100%
  certification_progress DECIMAL(5,2) DEFAULT 0, -- 0-100%
  total_money_saved DECIMAL(12,2) DEFAULT 0,
  total_organic_points INTEGER DEFAULT 0,
  
  -- Detailed Scores
  synthetic_elimination_score INTEGER DEFAULT 0,
  soil_health_score INTEGER DEFAULT 0,
  pest_management_score INTEGER DEFAULT 0,
  crop_rotation_score INTEGER DEFAULT 0,
  record_keeping_score INTEGER DEFAULT 0,
  
  -- Milestones
  current_level VARCHAR(50) DEFAULT 'Organic Seedling',
  next_milestone VARCHAR(100),
  milestones_achieved JSONB DEFAULT '[]',
  
  -- Actions Tracking
  actions_completed INTEGER DEFAULT 0,
  actions_successful INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Economic Impact
  input_cost_reduction DECIMAL(10,2) DEFAULT 0,
  yield_improvement_percentage DECIMAL(5,2) DEFAULT 0,
  premium_potential DECIMAL(10,2) DEFAULT 0,
  
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly Predictive Alerts
CREATE TABLE IF NOT EXISTS organic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert Details
  alert_type VARCHAR(50) NOT NULL, -- pest_pressure, weather_change, growth_stage, seasonal_prep
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'important', 'optional')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Recommendations
  recommended_actions TEXT[] DEFAULT '{}',
  timeframe VARCHAR(100), -- "This week", "Next 3 days"
  
  -- Impact Prediction
  yield_risk_percentage DECIMAL(5,2) DEFAULT 0,
  potential_money_saved DECIMAL(10,2) DEFAULT 0,
  
  -- Targeting
  crop_types TEXT[] DEFAULT '{}',
  field_names TEXT[] DEFAULT '{}',
  
  -- Scheduling
  alert_date DATE NOT NULL,
  expires_date DATE,
  
  -- Tracking
  is_read BOOLEAN DEFAULT FALSE,
  action_taken BOOLEAN DEFAULT FALSE,
  user_feedback TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Economic Impact Tracking
CREATE TABLE IF NOT EXISTS economic_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Period Tracking
  tracking_period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, seasonal, yearly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Cost Savings
  fertilizer_savings DECIMAL(10,2) DEFAULT 0,
  pesticide_savings DECIMAL(10,2) DEFAULT 0,
  other_input_savings DECIMAL(10,2) DEFAULT 0,
  total_savings DECIMAL(10,2) DEFAULT 0,
  
  -- Yield Impact
  baseline_yield_kg DECIMAL(10,2) DEFAULT 0,
  organic_yield_kg DECIMAL(10,2) DEFAULT 0,
  yield_improvement_kg DECIMAL(10,2) DEFAULT 0,
  yield_improvement_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Market Value
  conventional_price_per_kg DECIMAL(8,2) DEFAULT 0,
  organic_premium_per_kg DECIMAL(8,2) DEFAULT 0,
  premium_income DECIMAL(10,2) DEFAULT 0,
  
  -- Time Investment
  time_invested_hours DECIMAL(6,2) DEFAULT 0,
  hourly_value DECIMAL(8,2) DEFAULT 0,
  
  -- ROI Calculation
  total_benefit DECIMAL(12,2) DEFAULT 0,
  roi_percentage DECIMAL(8,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Viral Content Sharing
CREATE TABLE IF NOT EXISTS viral_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content Details
  content_type VARCHAR(50) NOT NULL, -- success_story, challenge, recipe_share, milestone
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Success Metrics
  money_saved DECIMAL(10,2) DEFAULT 0,
  yield_boost VARCHAR(100),
  time_taken VARCHAR(100),
  
  -- Media
  image_url TEXT,
  video_url TEXT,
  
  -- Sharing Data
  hashtags TEXT[] DEFAULT '{}',
  call_to_action TEXT,
  
  -- Engagement Tracking
  shares_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Platform Tracking
  shared_platforms JSONB DEFAULT '{}', -- {"whatsapp": 5, "facebook": 2, "twitter": 1}
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED USER PROFILES FOR ORGANIC AI
-- ============================================================================

-- Add organic profile data to existing users table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organic_profile JSONB DEFAULT '{
  "available_resources": [],
  "preferred_language": "en",
  "local_ingredient_names": {},
  "farming_experience_years": 0,
  "current_practices": [],
  "goals": [],
  "certification_interest": false,
  "sharing_preferences": {
    "auto_share_wins": false,
    "privacy_level": "public"
  },
  "ai_preferences": {
    "complexity_level": "simple",
    "focus_areas": ["cost_saving", "yield_improvement"]
  }
}';

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Organic Actions Indexes
CREATE INDEX IF NOT EXISTS idx_organic_actions_user_id ON organic_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_organic_actions_completed ON organic_actions(completed);
CREATE INDEX IF NOT EXISTS idx_organic_actions_urgency ON organic_actions(urgency);
CREATE INDEX IF NOT EXISTS idx_organic_actions_category ON organic_actions(category);
CREATE INDEX IF NOT EXISTS idx_organic_actions_crop_type ON organic_actions(crop_type);
CREATE INDEX IF NOT EXISTS idx_organic_actions_generated_date ON organic_actions(generated_date);

-- Organic Recipes Indexes
CREATE INDEX IF NOT EXISTS idx_organic_recipes_category ON organic_recipes(category);
CREATE INDEX IF NOT EXISTS idx_organic_recipes_verified ON organic_recipes(verified);
CREATE INDEX IF NOT EXISTS idx_organic_recipes_crop_types ON organic_recipes USING GIN(crop_types);
CREATE INDEX IF NOT EXISTS idx_organic_recipes_target_problems ON organic_recipes USING GIN(target_problems);
CREATE INDEX IF NOT EXISTS idx_organic_recipes_search_keywords ON organic_recipes USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_organic_recipes_effectiveness ON organic_recipes(effectiveness_score DESC);

-- Progress Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_organic_progress_user_id ON organic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_organic_progress_readiness ON organic_progress(organic_readiness DESC);
CREATE INDEX IF NOT EXISTS idx_organic_progress_money_saved ON organic_progress(total_money_saved DESC);

-- Alerts Indexes
CREATE INDEX IF NOT EXISTS idx_organic_alerts_user_id ON organic_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_organic_alerts_priority ON organic_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_organic_alerts_date ON organic_alerts(alert_date);
CREATE INDEX IF NOT EXISTS idx_organic_alerts_unread ON organic_alerts(user_id, is_read) WHERE is_read = false;

-- Economic Impact Indexes
CREATE INDEX IF NOT EXISTS idx_economic_impact_user_id ON economic_impact(user_id);
CREATE INDEX IF NOT EXISTS idx_economic_impact_period ON economic_impact(tracking_period, period_start);
CREATE INDEX IF NOT EXISTS idx_economic_impact_roi ON economic_impact(roi_percentage DESC);

-- Viral Content Indexes
CREATE INDEX IF NOT EXISTS idx_viral_content_user_id ON viral_content(user_id);
CREATE INDEX IF NOT EXISTS idx_viral_content_type ON viral_content(content_type);
CREATE INDEX IF NOT EXISTS idx_viral_content_shares ON viral_content(shares_count DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE economic_impact ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organic Actions
CREATE POLICY "Users can manage their own organic actions" ON organic_actions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Organic Recipes
CREATE POLICY "Users can view all verified recipes" ON organic_recipes
  FOR SELECT USING (verified = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes" ON organic_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON organic_recipes
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Progress Tracking
CREATE POLICY "Users can manage their own progress" ON organic_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Alerts
CREATE POLICY "Users can manage their own alerts" ON organic_alerts
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Economic Impact
CREATE POLICY "Users can manage their own economic data" ON economic_impact
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Viral Content
CREATE POLICY "Users can manage their own viral content" ON viral_content
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public viral content" ON viral_content
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ============================================================================

-- Function to calculate organic readiness score
CREATE OR REPLACE FUNCTION calculate_organic_readiness(user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  completed_actions INTEGER;
  successful_actions INTEGER;
  total_score DECIMAL(5,2) := 0;
BEGIN
  -- Get action completion stats
  SELECT 
    COUNT(*) FILTER (WHERE completed = true),
    COUNT(*) FILTER (WHERE completed = true AND effectiveness_rating >= 4)
  INTO completed_actions, successful_actions
  FROM organic_actions 
  WHERE user_id = user_uuid;
  
  -- Calculate base score from actions (0-60 points)
  total_score := LEAST(60, completed_actions * 2);
  
  -- Bonus for successful actions (0-25 points)
  total_score := total_score + LEAST(25, successful_actions * 1.5);
  
  -- Bonus for consistency (0-15 points)
  SELECT total_score + LEAST(15, current_streak * 0.5)
  INTO total_score
  FROM organic_progress 
  WHERE user_id = user_uuid;
  
  RETURN LEAST(100, total_score);
END;
$$ LANGUAGE plpgsql;

-- Function to update user progress
CREATE OR REPLACE FUNCTION update_organic_progress(user_uuid UUID)
RETURNS void AS $$
DECLARE
  new_readiness DECIMAL(5,2);
  total_saved DECIMAL(12,2);
  total_points INTEGER;
  completed_count INTEGER;
  successful_count INTEGER;
BEGIN
  -- Calculate new readiness score
  new_readiness := calculate_organic_readiness(user_uuid);
  
  -- Get totals from actions
  SELECT 
    COALESCE(SUM(money_saved), 0),
    COALESCE(SUM(organic_score_points), 0),
    COUNT(*) FILTER (WHERE completed = true),
    COUNT(*) FILTER (WHERE completed = true AND effectiveness_rating >= 4)
  INTO total_saved, total_points, completed_count, successful_count
  FROM organic_actions 
  WHERE user_id = user_uuid;
  
  -- Update or insert progress record
  INSERT INTO organic_progress (
    user_id, 
    organic_readiness, 
    total_money_saved, 
    total_organic_points,
    actions_completed,
    actions_successful,
    last_updated
  ) VALUES (
    user_uuid, 
    new_readiness, 
    total_saved, 
    total_points,
    completed_count,
    successful_count,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    organic_readiness = new_readiness,
    total_money_saved = total_saved,
    total_organic_points = total_points,
    actions_completed = completed_count,
    actions_successful = successful_count,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update progress when actions are completed
CREATE OR REPLACE FUNCTION trigger_update_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    PERFORM update_organic_progress(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organic_action_completed
  AFTER UPDATE ON organic_actions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_progress();

-- ============================================================================
-- SEED DATA FOR PRODUCTION
-- ============================================================================

-- Insert system-verified organic recipes for immediate use
INSERT INTO organic_recipes (
  title, purpose, category, ingredients, method, time_to_complete, 
  effectiveness_score, cost_savings, crop_types, target_problems,
  search_keywords, local_names, verified, created_by_system
) VALUES 
(
  'Banana Peel + Wood Ash Super Fertilizer',
  'Boost tomato yield by 40% using kitchen waste',
  'fertilizer',
  '{"banana_peels": "10 pieces", "wood_ash": "2 cups", "water": "5 liters", "soap": "1 tsp"}',
  ARRAY[
    'Chop banana peels into small pieces',
    'Mix chopped peels with wood ash in bucket', 
    'Add 5 liters of water and stir well',
    'Add soap shavings and mix until dissolved',
    'Let mixture sit for 24 hours, stirring twice',
    'Strain liquid through cloth',
    'Apply 1 cup per tomato plant at base',
    'Water plants immediately after application'
  ],
  30,
  4.8,
  12500,
  ARRAY['tomato', 'pepper', 'eggplant'],
  ARRAY['potassium deficiency', 'poor fruit development', 'small fruits'],
  ARRAY['banana', 'ash', 'fertilizer', 'potassium', 'kitchen waste'],
  '{"banana_peels": ["banana skin"], "wood_ash": ["cooking ash", "fire ash"]}',
  true,
  true
),
(
  'Neem + Garlic Pest Destroyer',
  'Kill aphids and caterpillars using kitchen ingredients',
  'pesticide', 
  '{"neem_leaves": "2 handfuls", "garlic_cloves": "5 cloves", "hot_pepper": "2 pieces", "soap": "1 tbsp"}',
  ARRAY[
    'Boil neem leaves in 2 liters water for 30 minutes',
    'Crush garlic and hot pepper together',
    'Add crushed garlic-pepper to hot neem water',
    'Let mixture cool completely',
    'Strain through cloth',
    'Add soap shavings and stir until dissolved',
    'Spray on affected plants in early morning or evening',
    'Repeat every 3 days until pests are gone'
  ],
  45,
  4.7,
  8500,
  ARRAY['maize', 'tomato', 'cabbage', 'beans'],
  ARRAY['aphids', 'caterpillars', 'fall armyworm', 'leaf miners'],
  ARRAY['neem', 'garlic', 'pesticide', 'organic', 'pest control'],
  '{"neem_leaves": ["dongoyaro"], "garlic_cloves": ["ayo"], "hot_pepper": ["ata rodo"]}',
  true,
  true
);

-- Create initial progress records for existing users
INSERT INTO organic_progress (user_id, organic_readiness, current_level)
SELECT id, 0, 'Organic Seedling'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMIT;