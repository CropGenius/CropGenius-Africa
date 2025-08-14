-- 🌿 ORGANIC INTELLIGENCE WEAPON DATABASE SCHEMA
-- Supporting tables for the organic farming revolution

-- User Organic Practices Tracking
CREATE TABLE IF NOT EXISTS user_organic_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- synthetic_elimination, soil_health, ipm, rotation, organic_inputs, record_keeping
  adopted_date TIMESTAMP DEFAULT NOW(),
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  cost_savings DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organic Superpowers History
CREATE TABLE IF NOT EXISTS organic_superpowers_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  superpower_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  urgency VARCHAR(20) NOT NULL,
  cost_savings DECIMAL(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  user_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Organic Score History
CREATE TABLE IF NOT EXISTS organic_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  synthetic_elimination_score INTEGER NOT NULL,
  soil_health_score INTEGER NOT NULL,
  ipm_score INTEGER NOT NULL,
  crop_rotation_score INTEGER NOT NULL,
  organic_inputs_score INTEGER NOT NULL,
  record_keeping_score INTEGER NOT NULL,
  certification_ready BOOLEAN DEFAULT FALSE,
  market_premium_potential INTEGER DEFAULT 0,
  next_milestone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Homebrew Arsenal Recipes
CREATE TABLE IF NOT EXISTS homebrew_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- pesticide, fertilizer, soil_amendment, growth_enhancer
  target_crops TEXT[] DEFAULT '{}',
  target_issues TEXT[] DEFAULT '{}',
  ingredients JSONB NOT NULL,
  instructions TEXT[] NOT NULL,
  preparation_time INTEGER DEFAULT 0, -- minutes
  application_method TEXT,
  frequency VARCHAR(100),
  shelf_life INTEGER DEFAULT 0, -- days
  effectiveness_rating DECIMAL(3,2) DEFAULT 0,
  cost_per_liter DECIMAL(10,2) DEFAULT 0,
  organic_compliance INTEGER DEFAULT 100,
  safety_notes TEXT[],
  regional_adaptations JSONB DEFAULT '{}',
  scientific_basis TEXT,
  user_ratings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Recipe Ratings and Feedback
CREATE TABLE IF NOT EXISTS recipe_user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES homebrew_recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  effectiveness INTEGER CHECK (effectiveness >= 1 AND effectiveness <= 5),
  ease_of_use INTEGER CHECK (ease_of_use >= 1 AND ease_of_use <= 5),
  cost_effectiveness INTEGER CHECK (cost_effectiveness >= 1 AND cost_effectiveness <= 5),
  feedback_text TEXT,
  would_recommend BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Organic Achievement Badges
CREATE TABLE IF NOT EXISTS organic_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL, -- organic_seedling, pest_master, soil_guru, organic_hero
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  earned_at TIMESTAMP DEFAULT NOW(),
  shared_count INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_type)
);

-- Viral Sharing Tracking
CREATE TABLE IF NOT EXISTS organic_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type VARCHAR(100) NOT NULL, -- achievement, recipe, progress, milestone
  content_id VARCHAR(255), -- achievement_id, recipe_id, etc.
  platform VARCHAR(50) NOT NULL, -- whatsapp, facebook, twitter, instagram
  shared_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organic_practices_user_id ON user_organic_practices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organic_practices_category ON user_organic_practices(category);
CREATE INDEX IF NOT EXISTS idx_organic_superpowers_user_id ON organic_superpowers_history(user_id);
CREATE INDEX IF NOT EXISTS idx_organic_superpowers_completed ON organic_superpowers_history(completed);
CREATE INDEX IF NOT EXISTS idx_organic_score_user_id ON organic_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_homebrew_recipes_category ON homebrew_recipes(category);
CREATE INDEX IF NOT EXISTS idx_homebrew_recipes_verified ON homebrew_recipes(verified);
CREATE INDEX IF NOT EXISTS idx_recipe_feedback_recipe_id ON recipe_user_feedback(recipe_id);
CREATE INDEX IF NOT EXISTS idx_organic_achievements_user_id ON organic_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_organic_shares_user_id ON organic_shares(user_id);

-- Row Level Security (RLS)
ALTER TABLE user_organic_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_superpowers_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own organic practices" ON user_organic_practices
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own superpowers history" ON organic_superpowers_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own score history" ON organic_score_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view all recipes" ON homebrew_recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can create recipes" ON homebrew_recipes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own recipes" ON homebrew_recipes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can manage their own recipe feedback" ON recipe_user_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON organic_achievements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shares" ON organic_shares
  FOR ALL USING (auth.uid() = user_id);