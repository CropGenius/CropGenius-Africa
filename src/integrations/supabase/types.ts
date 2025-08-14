/**
 * 🚀 CROPGENIUS SUPABASE TYPES - ORGANIC AI REVOLUTION
 * Production-ready database types for the economic independence engine
 */

export interface Database {
  public: {
    Tables: {
      // ============================================================================
      // ORGANIC AI PLAN REVOLUTION TABLES
      // ============================================================================
      organic_actions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          urgency: 'high' | 'medium' | 'low';
          category: string;
          crop_type: string | null;
          field_name: string | null;
          target_problem: string | null;
          ingredients: any; // JSONB
          steps: string[];
          preparation_time: number | null;
          yield_boost: string | null;
          money_saved: number;
          time_to_results: string | null;
          organic_score_points: number;
          weather_context: string | null;
          season_context: string | null;
          why_now: string | null;
          completed: boolean;
          completed_date: string | null;
          effectiveness_rating: number | null;
          user_feedback: string | null;
          ai_prompt_context: any | null; // JSONB
          generated_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          urgency: 'high' | 'medium' | 'low';
          category: string;
          crop_type?: string | null;
          field_name?: string | null;
          target_problem?: string | null;
          ingredients: any;
          steps: string[];
          preparation_time?: number | null;
          yield_boost?: string | null;
          money_saved?: number;
          time_to_results?: string | null;
          organic_score_points?: number;
          weather_context?: string | null;
          season_context?: string | null;
          why_now?: string | null;
          completed?: boolean;
          completed_date?: string | null;
          effectiveness_rating?: number | null;
          user_feedback?: string | null;
          ai_prompt_context?: any | null;
          generated_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          urgency?: 'high' | 'medium' | 'low';
          category?: string;
          crop_type?: string | null;
          field_name?: string | null;
          target_problem?: string | null;
          ingredients?: any;
          steps?: string[];
          preparation_time?: number | null;
          yield_boost?: string | null;
          money_saved?: number;
          time_to_results?: string | null;
          organic_score_points?: number;
          weather_context?: string | null;
          season_context?: string | null;
          why_now?: string | null;
          completed?: boolean;
          completed_date?: string | null;
          effectiveness_rating?: number | null;
          user_feedback?: string | null;
          ai_prompt_context?: any | null;
          generated_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organic_recipes: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          purpose: string;
          category: string;
          ingredients: any; // JSONB
          method: string[];
          time_to_complete: number;
          difficulty: 'easy' | 'medium' | 'hard';
          effectiveness_score: number;
          cost_savings: number;
          success_rate: number;
          crop_types: string[];
          target_problems: string[];
          seasonality: string[];
          usage_count: number;
          success_count: number;
          search_keywords: string[];
          local_names: any; // JSONB
          verified: boolean;
          created_by_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          purpose: string;
          category: string;
          ingredients: any;
          method: string[];
          time_to_complete?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          effectiveness_score?: number;
          cost_savings?: number;
          success_rate?: number;
          crop_types?: string[];
          target_problems?: string[];
          seasonality?: string[];
          usage_count?: number;
          success_count?: number;
          search_keywords?: string[];
          local_names?: any;
          verified?: boolean;
          created_by_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          purpose?: string;
          category?: string;
          ingredients?: any;
          method?: string[];
          time_to_complete?: number;
          difficulty?: 'easy' | 'medium' | 'hard';
          effectiveness_score?: number;
          cost_savings?: number;
          success_rate?: number;
          crop_types?: string[];
          target_problems?: string[];
          seasonality?: string[];
          usage_count?: number;
          success_count?: number;
          search_keywords?: string[];
          local_names?: any;
          verified?: boolean;
          created_by_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      organic_progress: {
        Row: {
          id: string;
          user_id: string;
          organic_readiness: number;
          certification_progress: number;
          total_money_saved: number;
          total_organic_points: number;
          synthetic_elimination_score: number;
          soil_health_score: number;
          pest_management_score: number;
          crop_rotation_score: number;
          record_keeping_score: number;
          current_level: string;
          next_milestone: string | null;
          milestones_achieved: any; // JSONB
          actions_completed: number;
          actions_successful: number;
          current_streak: number;
          longest_streak: number;
          input_cost_reduction: number;
          yield_improvement_percentage: number;
          premium_potential: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organic_readiness?: number;
          certification_progress?: number;
          total_money_saved?: number;
          total_organic_points?: number;
          synthetic_elimination_score?: number;
          soil_health_score?: number;
          pest_management_score?: number;
          crop_rotation_score?: number;
          record_keeping_score?: number;
          current_level?: string;
          next_milestone?: string | null;
          milestones_achieved?: any;
          actions_completed?: number;
          actions_successful?: number;
          current_streak?: number;
          longest_streak?: number;
          input_cost_reduction?: number;
          yield_improvement_percentage?: number;
          premium_potential?: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organic_readiness?: number;
          certification_progress?: number;
          total_money_saved?: number;
          total_organic_points?: number;
          synthetic_elimination_score?: number;
          soil_health_score?: number;
          pest_management_score?: number;
          crop_rotation_score?: number;
          record_keeping_score?: number;
          current_level?: string;
          next_milestone?: string | null;
          milestones_achieved?: any;
          actions_completed?: number;
          actions_successful?: number;
          current_streak?: number;
          longest_streak?: number;
          input_cost_reduction?: number;
          yield_improvement_percentage?: number;
          premium_potential?: number;
          last_updated?: string;
          created_at?: string;
        };
      };
      organic_alerts: {
        Row: {
          id: string;
          user_id: string;
          alert_type: string;
          priority: 'critical' | 'important' | 'optional';
          title: string;
          description: string;
          recommended_actions: string[];
          timeframe: string | null;
          yield_risk_percentage: number;
          potential_money_saved: number;
          crop_types: string[];
          field_names: string[];
          alert_date: string;
          expires_date: string | null;
          is_read: boolean;
          action_taken: boolean;
          user_feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_type: string;
          priority: 'critical' | 'important' | 'optional';
          title: string;
          description: string;
          recommended_actions?: string[];
          timeframe?: string | null;
          yield_risk_percentage?: number;
          potential_money_saved?: number;
          crop_types?: string[];
          field_names?: string[];
          alert_date: string;
          expires_date?: string | null;
          is_read?: boolean;
          action_taken?: boolean;
          user_feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_type?: string;
          priority?: 'critical' | 'important' | 'optional';
          title?: string;
          description?: string;
          recommended_actions?: string[];
          timeframe?: string | null;
          yield_risk_percentage?: number;
          potential_money_saved?: number;
          crop_types?: string[];
          field_names?: string[];
          alert_date?: string;
          expires_date?: string | null;
          is_read?: boolean;
          action_taken?: boolean;
          user_feedback?: string | null;
          created_at?: string;
        };
      };
      economic_impact: {
        Row: {
          id: string;
          user_id: string;
          tracking_period: string;
          period_start: string;
          period_end: string;
          fertilizer_savings: number;
          pesticide_savings: number;
          other_input_savings: number;
          total_savings: number;
          baseline_yield_kg: number;
          organic_yield_kg: number;
          yield_improvement_kg: number;
          yield_improvement_percentage: number;
          conventional_price_per_kg: number;
          organic_premium_per_kg: number;
          premium_income: number;
          time_invested_hours: number;
          hourly_value: number;
          total_benefit: number;
          roi_percentage: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tracking_period: string;
          period_start: string;
          period_end: string;
          fertilizer_savings?: number;
          pesticide_savings?: number;
          other_input_savings?: number;
          total_savings?: number;
          baseline_yield_kg?: number;
          organic_yield_kg?: number;
          yield_improvement_kg?: number;
          yield_improvement_percentage?: number;
          conventional_price_per_kg?: number;
          organic_premium_per_kg?: number;
          premium_income?: number;
          time_invested_hours?: number;
          hourly_value?: number;
          total_benefit?: number;
          roi_percentage?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tracking_period?: string;
          period_start?: string;
          period_end?: string;
          fertilizer_savings?: number;
          pesticide_savings?: number;
          other_input_savings?: number;
          total_savings?: number;
          baseline_yield_kg?: number;
          organic_yield_kg?: number;
          yield_improvement_kg?: number;
          yield_improvement_percentage?: number;
          conventional_price_per_kg?: number;
          organic_premium_per_kg?: number;
          premium_income?: number;
          time_invested_hours?: number;
          hourly_value?: number;
          total_benefit?: number;
          roi_percentage?: number;
          created_at?: string;
        };
      };
      viral_content: {
        Row: {
          id: string;
          user_id: string;
          content_type: string;
          title: string;
          description: string;
          money_saved: number;
          yield_boost: string | null;
          time_taken: string | null;
          image_url: string | null;
          video_url: string | null;
          hashtags: string[];
          call_to_action: string | null;
          shares_count: number;
          likes_count: number;
          comments_count: number;
          shared_platforms: any; // JSONB
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_type: string;
          title: string;
          description: string;
          money_saved?: number;
          yield_boost?: string | null;
          time_taken?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          hashtags?: string[];
          call_to_action?: string | null;
          shares_count?: number;
          likes_count?: number;
          comments_count?: number;
          shared_platforms?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_type?: string;
          title?: string;
          description?: string;
          money_saved?: number;
          yield_boost?: string | null;
          time_taken?: string | null;
          image_url?: string | null;
          video_url?: string | null;
          hashtags?: string[];
          call_to_action?: string | null;
          shares_count?: number;
          likes_count?: number;
          comments_count?: number;
          shared_platforms?: any;
          created_at?: string;
        };
      };
      // ============================================================================
      // EXISTING TABLES (Enhanced)
      // ============================================================================
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      onboarding: {
        Row: {
          id: string;
          user_id: string;
          step: number;
          completed: boolean;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          step?: number;
          completed?: boolean;
          data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          step?: number;
          completed?: boolean;
          data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          location: string | null;
          farm_size: number | null;
          farm_type: string | null;
          experience_level: string | null;
          primary_crops: string[] | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          organic_profile: any | null; // JSONB - Enhanced for Organic AI
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          location?: string | null;
          farm_size?: number | null;
          farm_type?: string | null;
          experience_level?: string | null;
          primary_crops?: string[] | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          organic_profile?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          location?: string | null;
          farm_size?: number | null;
          farm_type?: string | null;
          experience_level?: string | null;
          primary_crops?: string[] | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          organic_profile?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      fields: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          crop_type: string | null;
          health_score: number | null;
          ndvi_value: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          crop_type?: string | null;
          health_score?: number | null;
          ndvi_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          crop_type?: string | null;
          health_score?: number | null;
          ndvi_value?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          crop: string;
          disease: string;
          confidence: number;
          analysis: any | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          crop: string;
          disease: string;
          confidence: number;
          analysis?: any | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          crop?: string;
          disease?: string;
          confidence?: number;
          analysis?: any | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          status: string;
          priority: string;
          field_id: string | null;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          status?: string;
          priority?: string;
          field_id?: string | null;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          status?: string;
          priority?: string;
          field_id?: string | null;
          due_date?: string | null;
          created_at?: string;
        };
      };
      yield_predictions: {
        Row: {
          id: string;
          user_id: string;
          field_id: string;
          crop_type: string;
          predicted_yield_kg_per_ha: number;
          confidence_score: number;
          prediction_date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          field_id: string;
          crop_type: string;
          predicted_yield_kg_per_ha: number;
          confidence_score: number;
          prediction_date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          field_id?: string;
          crop_type?: string;
          predicted_yield_kg_per_ha?: number;
          confidence_score?: number;
          prediction_date?: string;
        };
      };
      farm_health_snapshots: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          health_score: number;
          field_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          farm_id: string;
          health_score: number;
          field_count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_id?: string;
          health_score?: number;
          field_count?: number;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          priority: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          priority: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string;
          priority?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}