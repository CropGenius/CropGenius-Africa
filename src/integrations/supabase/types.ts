export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string | null
          completed_at: string | null
          created_at: string
          description: string
          details: Json
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          completed_at?: string | null
          created_at?: string
          description: string
          details?: Json
          id?: string
          status: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string
          details?: Json
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_feedback: {
        Row: {
          agent_id: string
          comments: string | null
          created_at: string | null
          id: string
          implemented: boolean | null
          outcome: string | null
          rating: number | null
          recommendation_id: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          comments?: string | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          outcome?: string | null
          rating?: number | null
          recommendation_id: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          comments?: string | null
          created_at?: string | null
          id?: string
          implemented?: boolean | null
          outcome?: string | null
          rating?: number | null
          recommendation_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agent_health_reports: {
        Row: {
          created_at: string | null
          id: string
          report_data: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          report_data: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          report_data?: Json
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_interaction_logs: {
        Row: {
          created_at: string | null
          id: number
          metadata: Json | null
          model: string | null
          prompt: string
          response: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          metadata?: Json | null
          model?: string | null
          prompt: string
          response: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          metadata?: Json | null
          model?: string | null
          prompt?: string
          response?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_service_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          request_data: Json
          response_data: Json | null
          service_type: string
          success: boolean | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_data: Json
          response_data?: Json | null
          service_type: string
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_data?: Json
          response_data?: Json | null
          service_type?: string
          success?: boolean | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          farm_id: string | null
          id: string
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          farm_id?: string | null
          id?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          agent_type: string | null
          confidence_score: number | null
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          agent_type?: string | null
          confidence_score?: number | null
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          agent_type?: string | null
          confidence_score?: number | null
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_answers: {
        Row: {
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_accepted: boolean | null
          is_ai_generated: boolean | null
          question_id: string | null
          updated_at: string | null
          user_id: string | null
          vote_score: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_accepted?: boolean | null
          is_ai_generated?: boolean | null
          question_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_score?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_accepted?: boolean | null
          is_ai_generated?: boolean | null
          question_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "community_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          question_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          question_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          question_count?: number | null
        }
        Relationships: []
      }
      community_questions: {
        Row: {
          ai_confidence_score: number | null
          ai_preliminary_answer: string | null
          answer_count: number | null
          category_id: string | null
          content: string
          created_at: string | null
          crop_type: string | null
          farming_method: string | null
          id: string
          images: string[] | null
          location: Json | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          vote_score: number | null
        }
        Insert: {
          ai_confidence_score?: number | null
          ai_preliminary_answer?: string | null
          answer_count?: number | null
          category_id?: string | null
          content: string
          created_at?: string | null
          crop_type?: string | null
          farming_method?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          vote_score?: number | null
        }
        Update: {
          ai_confidence_score?: number | null
          ai_preliminary_answer?: string | null
          answer_count?: number | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          crop_type?: string | null
          farming_method?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          vote_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string | null
          vote_type?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_entity_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crop_prices: {
        Row: {
          created_at: string | null
          crop_name: string
          currency: string | null
          date: string
          id: string
          location: unknown | null
          location_name: string | null
          market_source: string | null
          price_per_kg: number
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          currency?: string | null
          date?: string
          id?: string
          location?: unknown | null
          location_name?: string | null
          market_source?: string | null
          price_per_kg: number
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          currency?: string | null
          date?: string
          id?: string
          location?: unknown | null
          location_name?: string | null
          market_source?: string | null
          price_per_kg?: number
        }
        Relationships: []
      }
      crop_recommendations: {
        Row: {
          ai_analysis_data: Json | null
          analysis_type: string | null
          confidence_score: number | null
          created_at: string | null
          crop_rotation_data: Json | null
          disease_risk_data: Json | null
          expires_at: string | null
          field_id: string | null
          generated_at: string | null
          id: string
          market_data: Json | null
          recommendations: Json
          satellite_data: Json | null
          soil_analysis: Json | null
          updated_at: string | null
          user_id: string | null
          weather_data: Json | null
          yield_prediction: Json | null
        }
        Insert: {
          ai_analysis_data?: Json | null
          analysis_type?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_rotation_data?: Json | null
          disease_risk_data?: Json | null
          expires_at?: string | null
          field_id?: string | null
          generated_at?: string | null
          id?: string
          market_data?: Json | null
          recommendations: Json
          satellite_data?: Json | null
          soil_analysis?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weather_data?: Json | null
          yield_prediction?: Json | null
        }
        Update: {
          ai_analysis_data?: Json | null
          analysis_type?: string | null
          confidence_score?: number | null
          created_at?: string | null
          crop_rotation_data?: Json | null
          disease_risk_data?: Json | null
          expires_at?: string | null
          field_id?: string | null
          generated_at?: string | null
          id?: string
          market_data?: Json | null
          recommendations?: Json
          satellite_data?: Json | null
          soil_analysis?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weather_data?: Json | null
          yield_prediction?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_recommendations_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_records: {
        Row: {
          actual_harvest_date: string | null
          actual_yield: number | null
          area_planted: number
          created_at: string | null
          crop_type: string
          expected_harvest_date: string
          expected_yield: number | null
          field_id: string
          id: string
          notes: string | null
          planting_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_harvest_date?: string | null
          actual_yield?: number | null
          area_planted: number
          created_at?: string | null
          crop_type: string
          expected_harvest_date: string
          expected_yield?: number | null
          field_id: string
          id?: string
          notes?: string | null
          planting_date: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_harvest_date?: string | null
          actual_yield?: number | null
          area_planted?: number
          created_at?: string | null
          crop_type?: string
          expected_harvest_date?: string
          expected_yield?: number | null
          field_id?: string
          id?: string
          notes?: string | null
          planting_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_records_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_scans: {
        Row: {
          affected_area_percentage: number | null
          ai_recommendations: Json | null
          confidence_score: number
          created_at: string | null
          crop_type: string
          disease_name: string
          id: string
          image_url: string | null
          immediate_actions: Json | null
          inorganic_solutions: Json | null
          location_country: string | null
          location_lat: number | null
          location_lng: number | null
          location_region: string | null
          organic_solutions: Json | null
          preventive_measures: Json | null
          processing_time_ms: number | null
          recommended_products: Json | null
          recovery_timeline: string | null
          result_data: Json | null
          revenue_loss_usd: number | null
          scientific_name: string | null
          severity: string
          source_api: string | null
          spread_risk: string | null
          status: string | null
          symptoms: Json | null
          treatment_cost_usd: number | null
          updated_at: string | null
          user_id: string
          yield_loss_percentage: number | null
        }
        Insert: {
          affected_area_percentage?: number | null
          ai_recommendations?: Json | null
          confidence_score: number
          created_at?: string | null
          crop_type: string
          disease_name: string
          id?: string
          image_url?: string | null
          immediate_actions?: Json | null
          inorganic_solutions?: Json | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_region?: string | null
          organic_solutions?: Json | null
          preventive_measures?: Json | null
          processing_time_ms?: number | null
          recommended_products?: Json | null
          recovery_timeline?: string | null
          result_data?: Json | null
          revenue_loss_usd?: number | null
          scientific_name?: string | null
          severity: string
          source_api?: string | null
          spread_risk?: string | null
          status?: string | null
          symptoms?: Json | null
          treatment_cost_usd?: number | null
          updated_at?: string | null
          user_id: string
          yield_loss_percentage?: number | null
        }
        Update: {
          affected_area_percentage?: number | null
          ai_recommendations?: Json | null
          confidence_score?: number
          created_at?: string | null
          crop_type?: string
          disease_name?: string
          id?: string
          image_url?: string | null
          immediate_actions?: Json | null
          inorganic_solutions?: Json | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_region?: string | null
          organic_solutions?: Json | null
          preventive_measures?: Json | null
          processing_time_ms?: number | null
          recommended_products?: Json | null
          recovery_timeline?: string | null
          result_data?: Json | null
          revenue_loss_usd?: number | null
          scientific_name?: string | null
          severity?: string
          source_api?: string | null
          spread_risk?: string | null
          status?: string | null
          symptoms?: Json | null
          treatment_cost_usd?: number | null
          updated_at?: string | null
          user_id?: string
          yield_loss_percentage?: number | null
        }
        Relationships: []
      }
      crop_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_genius_tasks: {
        Row: {
          action_steps: string[] | null
          category: Database["public"]["Enums"]["task_category_enum"]
          celebration_level: string | null
          color_scheme: Json | null
          completed_at: string | null
          completion_data: Json | null
          confidence_score: number
          created_at: string | null
          crop_type: string | null
          deadline: string | null
          description: string
          detailed_instructions: string | null
          estimated_duration: number | null
          field_id: string | null
          field_name: string | null
          fpsi_impact_points: number | null
          generation_source: Database["public"]["Enums"]["task_generation_source_enum"]
          icon_name: string | null
          id: string
          impact_score: number
          learning_tags: string[] | null
          market_context: Json | null
          optimal_end_hour: number | null
          optimal_start_hour: number | null
          priority: Database["public"]["Enums"]["task_priority_enum"]
          risk_mitigation: number | null
          roi_estimate: number | null
          skip_reason: string | null
          status: Database["public"]["Enums"]["task_status_enum"] | null
          task_date: string | null
          task_type: Database["public"]["Enums"]["task_type_enum"]
          times_skipped: number | null
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["task_urgency_enum"]
          user_id: string
          weather_dependency: Json | null
        }
        Insert: {
          action_steps?: string[] | null
          category: Database["public"]["Enums"]["task_category_enum"]
          celebration_level?: string | null
          color_scheme?: Json | null
          completed_at?: string | null
          completion_data?: Json | null
          confidence_score?: number
          created_at?: string | null
          crop_type?: string | null
          deadline?: string | null
          description: string
          detailed_instructions?: string | null
          estimated_duration?: number | null
          field_id?: string | null
          field_name?: string | null
          fpsi_impact_points?: number | null
          generation_source: Database["public"]["Enums"]["task_generation_source_enum"]
          icon_name?: string | null
          id?: string
          impact_score?: number
          learning_tags?: string[] | null
          market_context?: Json | null
          optimal_end_hour?: number | null
          optimal_start_hour?: number | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          risk_mitigation?: number | null
          roi_estimate?: number | null
          skip_reason?: string | null
          status?: Database["public"]["Enums"]["task_status_enum"] | null
          task_date?: string | null
          task_type: Database["public"]["Enums"]["task_type_enum"]
          times_skipped?: number | null
          title: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["task_urgency_enum"]
          user_id: string
          weather_dependency?: Json | null
        }
        Update: {
          action_steps?: string[] | null
          category?: Database["public"]["Enums"]["task_category_enum"]
          celebration_level?: string | null
          color_scheme?: Json | null
          completed_at?: string | null
          completion_data?: Json | null
          confidence_score?: number
          created_at?: string | null
          crop_type?: string | null
          deadline?: string | null
          description?: string
          detailed_instructions?: string | null
          estimated_duration?: number | null
          field_id?: string | null
          field_name?: string | null
          fpsi_impact_points?: number | null
          generation_source?: Database["public"]["Enums"]["task_generation_source_enum"]
          icon_name?: string | null
          id?: string
          impact_score?: number
          learning_tags?: string[] | null
          market_context?: Json | null
          optimal_end_hour?: number | null
          optimal_start_hour?: number | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          risk_mitigation?: number | null
          roi_estimate?: number | null
          skip_reason?: string | null
          status?: Database["public"]["Enums"]["task_status_enum"] | null
          task_date?: string | null
          task_type?: Database["public"]["Enums"]["task_type_enum"]
          times_skipped?: number | null
          title?: string
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["task_urgency_enum"]
          user_id?: string
          weather_dependency?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_genius_tasks_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      disease_detections: {
        Row: {
          confidence: number
          created_at: string | null
          crop_type: string
          disease_name: string
          field_id: string | null
          id: string
          image_url: string | null
          location: Json
          result_data: Json
          status: string
          treatment_recommendations: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confidence: number
          created_at?: string | null
          crop_type: string
          disease_name: string
          field_id?: string | null
          id?: string
          image_url?: string | null
          location: Json
          result_data: Json
          status?: string
          treatment_recommendations?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string | null
          crop_type?: string
          disease_name?: string
          field_id?: string | null
          id?: string
          image_url?: string | null
          location?: Json
          result_data?: Json
          status?: string
          treatment_recommendations?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disease_detections_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      economic_impact: {
        Row: {
          baseline_yield_kg: number | null
          conventional_price_per_kg: number | null
          created_at: string | null
          fertilizer_savings: number | null
          hourly_value: number | null
          id: string
          organic_premium_per_kg: number | null
          organic_yield_kg: number | null
          other_input_savings: number | null
          period_end: string
          period_start: string
          pesticide_savings: number | null
          premium_income: number | null
          roi_percentage: number | null
          time_invested_hours: number | null
          total_benefit: number | null
          total_savings: number | null
          tracking_period: string
          user_id: string
          yield_improvement_kg: number | null
          yield_improvement_percentage: number | null
        }
        Insert: {
          baseline_yield_kg?: number | null
          conventional_price_per_kg?: number | null
          created_at?: string | null
          fertilizer_savings?: number | null
          hourly_value?: number | null
          id?: string
          organic_premium_per_kg?: number | null
          organic_yield_kg?: number | null
          other_input_savings?: number | null
          period_end: string
          period_start: string
          pesticide_savings?: number | null
          premium_income?: number | null
          roi_percentage?: number | null
          time_invested_hours?: number | null
          total_benefit?: number | null
          total_savings?: number | null
          tracking_period: string
          user_id: string
          yield_improvement_kg?: number | null
          yield_improvement_percentage?: number | null
        }
        Update: {
          baseline_yield_kg?: number | null
          conventional_price_per_kg?: number | null
          created_at?: string | null
          fertilizer_savings?: number | null
          hourly_value?: number | null
          id?: string
          organic_premium_per_kg?: number | null
          organic_yield_kg?: number | null
          other_input_savings?: number | null
          period_end?: string
          period_start?: string
          pesticide_savings?: number | null
          premium_income?: number | null
          roi_percentage?: number | null
          time_invested_hours?: number | null
          total_benefit?: number | null
          total_savings?: number | null
          tracking_period?: string
          user_id?: string
          yield_improvement_kg?: number | null
          yield_improvement_percentage?: number | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          category: string
          component_stack: string | null
          context: Json | null
          count: number | null
          created_at: string | null
          error_hash: string | null
          first_occurrence: string
          id: string
          last_occurrence: string
          message: string
          resolved: boolean | null
          session_id: string | null
          severity: string
          stack_trace: string | null
          tags: string[] | null
          updated_at: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          component_stack?: string | null
          context?: Json | null
          count?: number | null
          created_at?: string | null
          error_hash?: string | null
          first_occurrence?: string
          id?: string
          last_occurrence?: string
          message: string
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          component_stack?: string | null
          context?: Json | null
          count?: number | null
          created_at?: string | null
          error_hash?: string | null
          first_occurrence?: string
          id?: string
          last_occurrence?: string
          message?: string
          resolved?: boolean | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          tags?: string[] | null
          updated_at?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      farm_health_snapshots: {
        Row: {
          analysis_metadata: Json | null
          created_at: string | null
          data_quality: number | null
          farm_id: string | null
          field_id: string | null
          health_factors: Json | null
          health_score: number
          id: string
          trust_indicators: Json | null
        }
        Insert: {
          analysis_metadata?: Json | null
          created_at?: string | null
          data_quality?: number | null
          farm_id?: string | null
          field_id?: string | null
          health_factors?: Json | null
          health_score: number
          id?: string
          trust_indicators?: Json | null
        }
        Update: {
          analysis_metadata?: Json | null
          created_at?: string | null
          data_quality?: number | null
          farm_id?: string | null
          field_id?: string | null
          health_factors?: Json | null
          health_score?: number
          id?: string
          trust_indicators?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_health_snapshots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_health_snapshots_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_plan_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string
          estimated_duration: number
          farm_plan_id: string
          field_id: string
          id: string
          plan_id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date: string
          estimated_duration: number
          farm_plan_id: string
          field_id: string
          id?: string
          plan_id: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string
          estimated_duration?: number
          farm_plan_id?: string
          field_id?: string
          id?: string
          plan_id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_plan_tasks_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_plans: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: number
          name: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: never
          name: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: never
          name?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      farm_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          farm_plan_id: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          farm_plan_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          farm_plan_id?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      farms: {
        Row: {
          coordinates: unknown | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          name: string
          size: number | null
          size_unit: Database["public"]["Enums"]["farm_size_unit"] | null
          total_area: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          coordinates?: unknown | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name: string
          size?: number | null
          size_unit?: Database["public"]["Enums"]["farm_size_unit"] | null
          total_area?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          coordinates?: unknown | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          size?: number | null
          size_unit?: Database["public"]["Enums"]["farm_size_unit"] | null
          total_area?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      field_alerts: {
        Row: {
          action_required: boolean | null
          alert_type: string
          coordinates: Json | null
          created_at: string | null
          field_id: string
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          action_required?: boolean | null
          alert_type: string
          coordinates?: Json | null
          created_at?: string | null
          field_id: string
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          user_id?: string | null
        }
        Update: {
          action_required?: boolean | null
          alert_type?: string
          coordinates?: Json | null
          created_at?: string | null
          field_id?: string
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      field_crops: {
        Row: {
          created_at: string | null
          crop_name: string
          estimated_harvest_date: string | null
          field_id: string | null
          id: string
          planting_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          estimated_harvest_date?: string | null
          field_id?: string | null
          id?: string
          planting_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          estimated_harvest_date?: string | null
          field_id?: string | null
          id?: string
          planting_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_crops_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      field_insights: {
        Row: {
          ai_confidence_score: number | null
          analysis_source: string | null
          created_at: string | null
          crop_rotation_suggestions: Json | null
          disease_risk_data: Json | null
          expires_at: string | null
          field_id: string
          id: string
          insights: Json
          satellite_analysis: Json | null
          soil_health_data: Json | null
          user_id: string
          weather_impact_data: Json | null
          yield_predictions: Json | null
        }
        Insert: {
          ai_confidence_score?: number | null
          analysis_source?: string | null
          created_at?: string | null
          crop_rotation_suggestions?: Json | null
          disease_risk_data?: Json | null
          expires_at?: string | null
          field_id: string
          id?: string
          insights: Json
          satellite_analysis?: Json | null
          soil_health_data?: Json | null
          user_id: string
          weather_impact_data?: Json | null
          yield_predictions?: Json | null
        }
        Update: {
          ai_confidence_score?: number | null
          analysis_source?: string | null
          created_at?: string | null
          crop_rotation_suggestions?: Json | null
          disease_risk_data?: Json | null
          expires_at?: string | null
          field_id?: string
          id?: string
          insights?: Json
          satellite_analysis?: Json | null
          soil_health_data?: Json | null
          user_id?: string
          weather_impact_data?: Json | null
          yield_predictions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "field_insights_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      field_intelligence_results: {
        Row: {
          agent_id: string
          alerts_count: number | null
          analysis_data: Json
          confidence_score: number | null
          created_at: string | null
          field_id: string
          id: string
          recommendations_count: number | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          alerts_count?: number | null
          analysis_data: Json
          confidence_score?: number | null
          created_at?: string | null
          field_id: string
          id?: string
          recommendations_count?: number | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          alerts_count?: number | null
          analysis_data?: Json
          confidence_score?: number | null
          created_at?: string | null
          field_id?: string
          id?: string
          recommendations_count?: number | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      fields: {
        Row: {
          boundary: unknown | null
          created_at: string | null
          created_by: string | null
          crop_type: string | null
          crop_type_id: string | null
          farm_id: string | null
          harvest_date: string | null
          health_score: number | null
          id: string
          irrigation_type: string | null
          location: unknown | null
          location_description: string | null
          map_snapshot: string | null
          metadata: Json | null
          name: string
          ndvi_value: number | null
          notes: string | null
          planted_at: string | null
          season: string | null
          size: number | null
          size_unit: Database["public"]["Enums"]["farm_size_unit"] | null
          soil_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          boundary?: unknown | null
          created_at?: string | null
          created_by?: string | null
          crop_type?: string | null
          crop_type_id?: string | null
          farm_id?: string | null
          harvest_date?: string | null
          health_score?: number | null
          id?: string
          irrigation_type?: string | null
          location?: unknown | null
          location_description?: string | null
          map_snapshot?: string | null
          metadata?: Json | null
          name: string
          ndvi_value?: number | null
          notes?: string | null
          planted_at?: string | null
          season?: string | null
          size?: number | null
          size_unit?: Database["public"]["Enums"]["farm_size_unit"] | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          boundary?: unknown | null
          created_at?: string | null
          created_by?: string | null
          crop_type?: string | null
          crop_type_id?: string | null
          farm_id?: string | null
          harvest_date?: string | null
          health_score?: number | null
          id?: string
          irrigation_type?: string | null
          location?: unknown | null
          location_description?: string | null
          map_snapshot?: string | null
          metadata?: Json | null
          name?: string
          ndvi_value?: number | null
          notes?: string | null
          planted_at?: string | null
          season?: string | null
          size?: number | null
          size_unit?: Database["public"]["Enums"]["farm_size_unit"] | null
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fields_crop_type_id_fkey"
            columns: ["crop_type_id"]
            isOneToOne: false
            referencedRelation: "crop_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fields_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_log: {
        Row: {
          created_at: string
          event: string
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      homebrew_recipes: {
        Row: {
          application_method: string | null
          category: string
          cost_per_liter: number | null
          created_at: string | null
          created_by: string | null
          effectiveness_rating: number | null
          frequency: string | null
          id: string
          ingredients: Json
          instructions: string[]
          name: string
          organic_compliance: number | null
          preparation_time: number | null
          regional_adaptations: Json | null
          safety_notes: string[] | null
          scientific_basis: string | null
          shelf_life: number | null
          target_crops: string[] | null
          target_issues: string[] | null
          updated_at: string | null
          user_ratings: Json | null
          verified: boolean | null
        }
        Insert: {
          application_method?: string | null
          category: string
          cost_per_liter?: number | null
          created_at?: string | null
          created_by?: string | null
          effectiveness_rating?: number | null
          frequency?: string | null
          id?: string
          ingredients: Json
          instructions: string[]
          name: string
          organic_compliance?: number | null
          preparation_time?: number | null
          regional_adaptations?: Json | null
          safety_notes?: string[] | null
          scientific_basis?: string | null
          shelf_life?: number | null
          target_crops?: string[] | null
          target_issues?: string[] | null
          updated_at?: string | null
          user_ratings?: Json | null
          verified?: boolean | null
        }
        Update: {
          application_method?: string | null
          category?: string
          cost_per_liter?: number | null
          created_at?: string | null
          created_by?: string | null
          effectiveness_rating?: number | null
          frequency?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[]
          name?: string
          organic_compliance?: number | null
          preparation_time?: number | null
          regional_adaptations?: Json | null
          safety_notes?: string[] | null
          scientific_basis?: string | null
          shelf_life?: number | null
          target_crops?: string[] | null
          target_issues?: string[] | null
          updated_at?: string | null
          user_ratings?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          created_at: string
          crop_name: string
          currency: string
          id: number
          location: string | null
          price: number
          recorded_at: string
          trend: Database["public"]["Enums"]["market_trend"] | null
        }
        Insert: {
          created_at?: string
          crop_name: string
          currency: string
          id?: number
          location?: string | null
          price: number
          recorded_at?: string
          trend?: Database["public"]["Enums"]["market_trend"] | null
        }
        Update: {
          created_at?: string
          crop_name?: string
          currency?: string
          id?: number
          location?: string | null
          price?: number
          recorded_at?: string
          trend?: Database["public"]["Enums"]["market_trend"] | null
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          contact_info: string | null
          created_at: string | null
          crop_name: string
          currency: string | null
          description: string | null
          expiry_date: string | null
          id: string
          image_url: string | null
          latitude: number | null
          listing_type: string | null
          location: string | null
          longitude: number | null
          price: number
          quality_grade: string | null
          quantity: number | null
          search_vector: unknown | null
          seller_id: string | null
          seller_name: string | null
          status: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          crop_name: string
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          listing_type?: string | null
          location?: string | null
          longitude?: number | null
          price: number
          quality_grade?: string | null
          quantity?: number | null
          search_vector?: unknown | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          crop_name?: string
          currency?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          listing_type?: string | null
          location?: string | null
          longitude?: number | null
          price?: number
          quality_grade?: string | null
          quantity?: number | null
          search_vector?: unknown | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          crop_name: string
          currency: string
          date_recorded: string
          id: string
          location: string
          price: number
          source: string | null
        }
        Insert: {
          created_at?: string
          crop_name: string
          currency: string
          date_recorded: string
          id?: string
          location: string
          price: number
          source?: string | null
        }
        Update: {
          created_at?: string
          crop_name?: string
          currency?: string
          date_recorded?: string
          id?: string
          location?: string
          price?: number
          source?: string | null
        }
        Relationships: []
      }
      navigation_state: {
        Row: {
          expanded_items: string[] | null
          favorite_routes: string[] | null
          preferences: Json | null
          recent_routes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          expanded_items?: string[] | null
          favorite_routes?: string[] | null
          preferences?: Json | null
          recent_routes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          expanded_items?: string[] | null
          favorite_routes?: string[] | null
          preferences?: Json | null
          recent_routes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding: {
        Row: {
          completed: boolean
          created_at: string
          data: Json
          id: string
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          data?: Json
          id?: string
          step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          data?: Json
          id?: string
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_audit: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          request_payload: Json
          response_payload: Json | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_payload: Json
          response_payload?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_payload?: Json
          response_payload?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      optimization_summary: {
        Row: {
          action_taken: string
          completed_at: string | null
          expected_improvement: string | null
          id: string
          item_name: string
          optimization_type: string
        }
        Insert: {
          action_taken: string
          completed_at?: string | null
          expected_improvement?: string | null
          id?: string
          item_name: string
          optimization_type: string
        }
        Update: {
          action_taken?: string
          completed_at?: string | null
          expected_improvement?: string | null
          id?: string
          item_name?: string
          optimization_type?: string
        }
        Relationships: []
      }
      orchestration_results: {
        Row: {
          collaboration_mode: string
          confidence: number | null
          created_at: string | null
          id: string
          participating_agents: string[]
          processing_time: number
          required_capabilities: string[]
          result_data: Json | null
          session_id: string
          success: boolean
          user_id: string | null
        }
        Insert: {
          collaboration_mode: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          participating_agents: string[]
          processing_time: number
          required_capabilities: string[]
          result_data?: Json | null
          session_id: string
          success: boolean
          user_id?: string | null
        }
        Update: {
          collaboration_mode?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          participating_agents?: string[]
          processing_time?: number
          required_capabilities?: string[]
          result_data?: Json | null
          session_id?: string
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      organic_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string | null
          icon_url: string | null
          id: string
          shared_count: number | null
          user_id: string
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          icon_url?: string | null
          id?: string
          shared_count?: number | null
          user_id: string
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          icon_url?: string | null
          id?: string
          shared_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      organic_actions: {
        Row: {
          ai_prompt_context: Json | null
          category: string
          completed: boolean | null
          completed_date: string | null
          created_at: string | null
          crop_type: string | null
          description: string
          effectiveness_rating: number | null
          field_name: string | null
          generated_date: string | null
          id: string
          ingredients: Json
          money_saved: number | null
          organic_score_points: number | null
          preparation_time: number | null
          season_context: string | null
          steps: string[]
          target_problem: string | null
          time_to_results: string | null
          title: string
          updated_at: string | null
          urgency: string
          user_feedback: string | null
          user_id: string
          weather_context: string | null
          why_now: string | null
          yield_boost: string | null
        }
        Insert: {
          ai_prompt_context?: Json | null
          category: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          crop_type?: string | null
          description: string
          effectiveness_rating?: number | null
          field_name?: string | null
          generated_date?: string | null
          id?: string
          ingredients: Json
          money_saved?: number | null
          organic_score_points?: number | null
          preparation_time?: number | null
          season_context?: string | null
          steps: string[]
          target_problem?: string | null
          time_to_results?: string | null
          title: string
          updated_at?: string | null
          urgency: string
          user_feedback?: string | null
          user_id: string
          weather_context?: string | null
          why_now?: string | null
          yield_boost?: string | null
        }
        Update: {
          ai_prompt_context?: Json | null
          category?: string
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          crop_type?: string | null
          description?: string
          effectiveness_rating?: number | null
          field_name?: string | null
          generated_date?: string | null
          id?: string
          ingredients?: Json
          money_saved?: number | null
          organic_score_points?: number | null
          preparation_time?: number | null
          season_context?: string | null
          steps?: string[]
          target_problem?: string | null
          time_to_results?: string | null
          title?: string
          updated_at?: string | null
          urgency?: string
          user_feedback?: string | null
          user_id?: string
          weather_context?: string | null
          why_now?: string | null
          yield_boost?: string | null
        }
        Relationships: []
      }
      organic_alerts: {
        Row: {
          action_taken: boolean | null
          alert_date: string
          alert_type: string
          created_at: string | null
          crop_types: string[] | null
          description: string
          expires_date: string | null
          field_names: string[] | null
          id: string
          is_read: boolean | null
          potential_money_saved: number | null
          priority: string
          recommended_actions: string[] | null
          timeframe: string | null
          title: string
          user_feedback: string | null
          user_id: string
          yield_risk_percentage: number | null
        }
        Insert: {
          action_taken?: boolean | null
          alert_date: string
          alert_type: string
          created_at?: string | null
          crop_types?: string[] | null
          description: string
          expires_date?: string | null
          field_names?: string[] | null
          id?: string
          is_read?: boolean | null
          potential_money_saved?: number | null
          priority: string
          recommended_actions?: string[] | null
          timeframe?: string | null
          title: string
          user_feedback?: string | null
          user_id: string
          yield_risk_percentage?: number | null
        }
        Update: {
          action_taken?: boolean | null
          alert_date?: string
          alert_type?: string
          created_at?: string | null
          crop_types?: string[] | null
          description?: string
          expires_date?: string | null
          field_names?: string[] | null
          id?: string
          is_read?: boolean | null
          potential_money_saved?: number | null
          priority?: string
          recommended_actions?: string[] | null
          timeframe?: string | null
          title?: string
          user_feedback?: string | null
          user_id?: string
          yield_risk_percentage?: number | null
        }
        Relationships: []
      }
      organic_progress: {
        Row: {
          certification_progress: number | null
          created_at: string | null
          current_level: string | null
          id: string
          last_updated: string | null
          organic_readiness: number | null
          total_money_saved: number | null
          total_organic_points: number | null
          user_id: string
        }
        Insert: {
          certification_progress?: number | null
          created_at?: string | null
          current_level?: string | null
          id?: string
          last_updated?: string | null
          organic_readiness?: number | null
          total_money_saved?: number | null
          total_organic_points?: number | null
          user_id: string
        }
        Update: {
          certification_progress?: number | null
          created_at?: string | null
          current_level?: string | null
          id?: string
          last_updated?: string | null
          organic_readiness?: number | null
          total_money_saved?: number | null
          total_organic_points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      organic_recipes: {
        Row: {
          category: string
          cost_savings: number | null
          created_at: string | null
          created_by_system: boolean | null
          crop_types: string[] | null
          difficulty: string | null
          effectiveness_score: number | null
          id: string
          ingredients: Json
          local_names: Json | null
          method: string[]
          purpose: string
          search_keywords: string[] | null
          seasonality: string[] | null
          success_count: number | null
          success_rate: number | null
          target_problems: string[] | null
          time_to_complete: number | null
          title: string
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
          verified: boolean | null
        }
        Insert: {
          category: string
          cost_savings?: number | null
          created_at?: string | null
          created_by_system?: boolean | null
          crop_types?: string[] | null
          difficulty?: string | null
          effectiveness_score?: number | null
          id?: string
          ingredients: Json
          local_names?: Json | null
          method: string[]
          purpose: string
          search_keywords?: string[] | null
          seasonality?: string[] | null
          success_count?: number | null
          success_rate?: number | null
          target_problems?: string[] | null
          time_to_complete?: number | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Update: {
          category?: string
          cost_savings?: number | null
          created_at?: string | null
          created_by_system?: boolean | null
          crop_types?: string[] | null
          difficulty?: string | null
          effectiveness_score?: number | null
          id?: string
          ingredients?: Json
          local_names?: Json | null
          method?: string[]
          purpose?: string
          search_keywords?: string[] | null
          seasonality?: string[] | null
          success_count?: number | null
          success_rate?: number | null
          target_problems?: string[] | null
          time_to_complete?: number | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      organic_score_history: {
        Row: {
          certification_ready: boolean | null
          created_at: string | null
          crop_rotation_score: number
          id: string
          ipm_score: number
          market_premium_potential: number | null
          next_milestone: string | null
          organic_inputs_score: number
          overall_score: number
          record_keeping_score: number
          soil_health_score: number
          synthetic_elimination_score: number
          user_id: string
        }
        Insert: {
          certification_ready?: boolean | null
          created_at?: string | null
          crop_rotation_score: number
          id?: string
          ipm_score: number
          market_premium_potential?: number | null
          next_milestone?: string | null
          organic_inputs_score: number
          overall_score: number
          record_keeping_score: number
          soil_health_score: number
          synthetic_elimination_score: number
          user_id: string
        }
        Update: {
          certification_ready?: boolean | null
          created_at?: string | null
          crop_rotation_score?: number
          id?: string
          ipm_score?: number
          market_premium_potential?: number | null
          next_milestone?: string | null
          organic_inputs_score?: number
          overall_score?: number
          record_keeping_score?: number
          soil_health_score?: number
          synthetic_elimination_score?: number
          user_id?: string
        }
        Relationships: []
      }
      organic_shares: {
        Row: {
          content_id: string | null
          id: string
          platform: string
          share_type: string
          shared_at: string | null
          user_id: string
        }
        Insert: {
          content_id?: string | null
          id?: string
          platform: string
          share_type: string
          shared_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string | null
          id?: string
          platform?: string
          share_type?: string
          shared_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      organic_superpowers_history: {
        Row: {
          category: string
          completed: boolean | null
          completed_at: string | null
          cost_savings: number | null
          created_at: string | null
          description: string
          effectiveness_rating: number | null
          id: string
          superpower_id: string
          title: string
          urgency: string
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean | null
          completed_at?: string | null
          cost_savings?: number | null
          created_at?: string | null
          description: string
          effectiveness_rating?: number | null
          id?: string
          superpower_id: string
          title: string
          urgency: string
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          completed_at?: string | null
          cost_savings?: number | null
          created_at?: string | null
          description?: string
          effectiveness_rating?: number | null
          id?: string
          superpower_id?: string
          title?: string
          urgency?: string
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_baseline: {
        Row: {
          id: string
          measured_at: string | null
          measurement_type: string
          metric_name: string
          metric_value: number
          notes: string | null
          table_name: string
        }
        Insert: {
          id?: string
          measured_at?: string | null
          measurement_type: string
          metric_name: string
          metric_value: number
          notes?: string | null
          table_name: string
        }
        Update: {
          id?: string
          measured_at?: string | null
          measurement_type?: string
          metric_name?: string
          metric_value?: number
          notes?: string | null
          table_name?: string
        }
        Relationships: []
      }
      permission_definitions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          permission: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permission: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permission?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_usage_count: number | null
          avatar_url: string | null
          created_at: string | null
          credits: number | null
          farm_id: string | null
          farm_name: string | null
          farm_size: number | null
          farm_units: Database["public"]["Enums"]["farm_size_unit"] | null
          full_name: string | null
          id: string
          location: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          ai_usage_count?: number | null
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          farm_id?: string | null
          farm_name?: string | null
          farm_size?: number | null
          farm_units?: Database["public"]["Enums"]["farm_size_unit"] | null
          full_name?: string | null
          id: string
          location?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          ai_usage_count?: number | null
          avatar_url?: string | null
          created_at?: string | null
          credits?: number | null
          farm_id?: string | null
          farm_name?: string | null
          farm_size?: number | null
          farm_units?: Database["public"]["Enums"]["farm_size_unit"] | null
          full_name?: string | null
          id?: string
          location?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_user_feedback: {
        Row: {
          cost_effectiveness: number | null
          created_at: string | null
          ease_of_use: number | null
          effectiveness: number | null
          feedback_text: string | null
          id: string
          rating: number | null
          recipe_id: string
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          cost_effectiveness?: number | null
          created_at?: string | null
          ease_of_use?: number | null
          effectiveness?: number | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          recipe_id: string
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          cost_effectiveness?: number | null
          created_at?: string | null
          ease_of_use?: number | null
          effectiveness?: number | null
          feedback_text?: string | null
          id?: string
          rating?: number | null
          recipe_id?: string
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_user_feedback_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "homebrew_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_id: string | null
          referrer_id: string | null
          reward_issued: boolean
          rewarded_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_issued?: boolean
          rewarded_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referred_id?: string | null
          referrer_id?: string | null
          reward_issued?: boolean
          rewarded_at?: string | null
        }
        Relationships: []
      }
      registered_agents: {
        Row: {
          agent_id: string
          capabilities: string[]
          id: string
          metrics: Json | null
          registered_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          capabilities: string[]
          id?: string
          metrics?: Json | null
          registered_at?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          capabilities?: string[]
          id?: string
          metrics?: Json | null
          registered_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      removed_indexes_log: {
        Row: {
          id: string
          index_definition: string
          index_name: string
          removal_reason: string | null
          removed_at: string | null
          table_name: string
        }
        Insert: {
          id?: string
          index_definition: string
          index_name: string
          removal_reason?: string | null
          removed_at?: string | null
          table_name: string
        }
        Update: {
          id?: string
          index_definition?: string
          index_name?: string
          removal_reason?: string | null
          removed_at?: string | null
          table_name?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          confidence: number
          created_at: string | null
          crop: string
          disease: string
          economic_impact: number | null
          field_id: string | null
          id: string
          image_url: string
          severity: number
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence: number
          created_at?: string | null
          crop: string
          disease: string
          economic_impact?: number | null
          field_id?: string | null
          id?: string
          image_url: string
          severity: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: number
          created_at?: string | null
          crop?: string
          disease?: string
          economic_impact?: number | null
          field_id?: string | null
          id?: string
          image_url?: string
          severity?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string | null
          id: string
          name: string
          products: string[] | null
          rating: number | null
          region: string | null
          specialties: string[] | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country: string
          created_at?: string | null
          id?: string
          name: string
          products?: string[] | null
          rating?: number | null
          region?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          products?: string[] | null
          rating?: number | null
          region?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          components: Json
          created_at: string
          id: string
          last_updated: string
          performance: Json
          resource_usage: Json
          status: string
        }
        Insert: {
          components?: Json
          created_at?: string
          id?: string
          last_updated?: string
          performance?: Json
          resource_usage?: Json
          status: string
        }
        Update: {
          components?: Json
          created_at?: string
          id?: string
          last_updated?: string
          performance?: Json
          resource_usage?: Json
          status?: string
        }
        Relationships: []
      }
      system_incidents: {
        Row: {
          affected_components: string[]
          created_at: string
          description: string
          id: string
          impact: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_components?: string[]
          created_at?: string
          description: string
          id?: string
          impact: string
          resolved_at?: string | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_components?: string[]
          created_at?: string
          description?: string
          id?: string
          impact?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      task_analytics: {
        Row: {
          actual_impact: number | null
          completed_at: string | null
          created_at: string | null
          device_type: string | null
          generated_at: string
          id: string
          skipped_at: string | null
          started_at: string | null
          task_id: string
          time_to_complete: number | null
          time_to_start: number | null
          time_to_view: number | null
          user_id: string
          user_satisfaction: number | null
          user_state: string | null
          viewed_at: string | null
          weather_conditions: Json | null
          would_generate_again: boolean | null
        }
        Insert: {
          actual_impact?: number | null
          completed_at?: string | null
          created_at?: string | null
          device_type?: string | null
          generated_at: string
          id?: string
          skipped_at?: string | null
          started_at?: string | null
          task_id: string
          time_to_complete?: number | null
          time_to_start?: number | null
          time_to_view?: number | null
          user_id: string
          user_satisfaction?: number | null
          user_state?: string | null
          viewed_at?: string | null
          weather_conditions?: Json | null
          would_generate_again?: boolean | null
        }
        Update: {
          actual_impact?: number | null
          completed_at?: string | null
          created_at?: string | null
          device_type?: string | null
          generated_at?: string
          id?: string
          skipped_at?: string | null
          started_at?: string | null
          task_id?: string
          time_to_complete?: number | null
          time_to_start?: number | null
          time_to_view?: number | null
          user_id?: string
          user_satisfaction?: number | null
          user_state?: string | null
          viewed_at?: string | null
          weather_conditions?: Json | null
          would_generate_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "task_analytics_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_genius_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_feedback: {
        Row: {
          clarity_score: number | null
          comments: string | null
          completion_time: number | null
          created_at: string | null
          device_type: string | null
          difficulty_score: number | null
          id: string
          improvement_suggestions: string[] | null
          overall_rating: number | null
          relevance_score: number | null
          task_id: string
          timing_score: number | null
          user_id: string
          would_recommend: boolean | null
        }
        Insert: {
          clarity_score?: number | null
          comments?: string | null
          completion_time?: number | null
          created_at?: string | null
          device_type?: string | null
          difficulty_score?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          overall_rating?: number | null
          relevance_score?: number | null
          task_id: string
          timing_score?: number | null
          user_id: string
          would_recommend?: boolean | null
        }
        Update: {
          clarity_score?: number | null
          comments?: string | null
          completion_time?: number | null
          created_at?: string | null
          device_type?: string | null
          difficulty_score?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          overall_rating?: number | null
          relevance_score?: number | null
          task_id?: string
          timing_score?: number | null
          user_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "task_feedback_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "daily_genius_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_learning_data: {
        Row: {
          average_completion_time: number | null
          average_rating: number | null
          category: Database["public"]["Enums"]["task_category_enum"]
          completion_rate: number | null
          created_at: string | null
          id: string
          optimal_frequency: number | null
          personalized_instructions: string | null
          preferred_difficulty: string | null
          successful_seasons: string[] | null
          successful_time_windows: Json | null
          successful_weather_conditions: Json | null
          task_type: Database["public"]["Enums"]["task_type_enum"]
          total_completed: number | null
          total_generated: number | null
          total_skipped: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_completion_time?: number | null
          average_rating?: number | null
          category: Database["public"]["Enums"]["task_category_enum"]
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          optimal_frequency?: number | null
          personalized_instructions?: string | null
          preferred_difficulty?: string | null
          successful_seasons?: string[] | null
          successful_time_windows?: Json | null
          successful_weather_conditions?: Json | null
          task_type: Database["public"]["Enums"]["task_type_enum"]
          total_completed?: number | null
          total_generated?: number | null
          total_skipped?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_completion_time?: number | null
          average_rating?: number | null
          category?: Database["public"]["Enums"]["task_category_enum"]
          completion_rate?: number | null
          created_at?: string | null
          id?: string
          optimal_frequency?: number | null
          personalized_instructions?: string | null
          preferred_difficulty?: string | null
          successful_seasons?: string[] | null
          successful_time_windows?: Json | null
          successful_weather_conditions?: Json | null
          task_type?: Database["public"]["Enums"]["task_type_enum"]
          total_completed?: number | null
          total_generated?: number | null
          total_skipped?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          field_id: string | null
          id: string
          priority: number | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          field_id?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          field_id?: string | null
          id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_indicator_types: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          last_updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          last_updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          last_updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_farm_context: {
        Row: {
          available_resources: Json
          budget_constraints: Json | null
          certification_interest: boolean | null
          country: string
          created_at: string | null
          current_practices: string[] | null
          data_completeness_percentage: number | null
          elevation_meters: number | null
          id: string
          last_updated: string | null
          latitude: number
          local_suppliers: Json | null
          longitude: number
          organic_experience_years: number | null
          organic_matter_percentage: number | null
          primary_crops: Json
          primary_goals: string[] | null
          region: string
          soil_ph: number | null
          soil_type: string
          total_farm_size_hectares: number
          user_id: string
          years_farming: number | null
        }
        Insert: {
          available_resources: Json
          budget_constraints?: Json | null
          certification_interest?: boolean | null
          country: string
          created_at?: string | null
          current_practices?: string[] | null
          data_completeness_percentage?: number | null
          elevation_meters?: number | null
          id?: string
          last_updated?: string | null
          latitude: number
          local_suppliers?: Json | null
          longitude: number
          organic_experience_years?: number | null
          organic_matter_percentage?: number | null
          primary_crops: Json
          primary_goals?: string[] | null
          region: string
          soil_ph?: number | null
          soil_type: string
          total_farm_size_hectares: number
          user_id: string
          years_farming?: number | null
        }
        Update: {
          available_resources?: Json
          budget_constraints?: Json | null
          certification_interest?: boolean | null
          country?: string
          created_at?: string | null
          current_practices?: string[] | null
          data_completeness_percentage?: number | null
          elevation_meters?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number
          local_suppliers?: Json | null
          longitude?: number
          organic_experience_years?: number | null
          organic_matter_percentage?: number | null
          primary_crops?: Json
          primary_goals?: string[] | null
          region?: string
          soil_ph?: number | null
          soil_type?: string
          total_farm_size_hectares?: number
          user_id?: string
          years_farming?: number | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          priority: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          priority: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          priority?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_organic_practices: {
        Row: {
          adopted_date: string | null
          category: string
          cost_savings: number | null
          created_at: string | null
          effectiveness_rating: number | null
          id: string
          notes: string | null
          practice_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          adopted_date?: string | null
          category: string
          cost_savings?: number | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          practice_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          adopted_date?: string | null
          category?: string
          cost_savings?: number | null
          created_at?: string | null
          effectiveness_rating?: number | null
          id?: string
          notes?: string | null
          practice_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          metadata: Json | null
          permission: string
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          permission: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          metadata?: Json | null
          permission?: string
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          budget_band: string | null
          created_at: string | null
          has_irrigation: boolean | null
          has_machinery: boolean | null
          has_soil_test: boolean | null
          id: string
          primary_goal: string | null
          primary_pain_point: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_band?: string | null
          created_at?: string | null
          has_irrigation?: boolean | null
          has_machinery?: boolean | null
          has_soil_test?: boolean | null
          id?: string
          primary_goal?: string | null
          primary_pain_point?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_band?: string | null
          created_at?: string | null
          has_irrigation?: boolean | null
          has_machinery?: boolean | null
          has_soil_test?: boolean | null
          id?: string
          primary_goal?: string | null
          primary_pain_point?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          experience_level: string | null
          farm_size: number | null
          farm_type: string | null
          full_name: string | null
          id: string
          location: string | null
          onboarding_completed: boolean
          organic_profile: Json | null
          phone: string | null
          primary_crops: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          farm_size?: number | null
          farm_type?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          onboarding_completed?: boolean
          organic_profile?: Json | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          experience_level?: string | null
          farm_size?: number | null
          farm_type?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          onboarding_completed?: boolean
          organic_profile?: Json | null
          phone?: string | null
          primary_crops?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          answers_given: number | null
          badge_level: string | null
          best_answers: number | null
          created_at: string | null
          expertise_areas: string[] | null
          helpful_votes: number | null
          id: string
          questions_asked: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answers_given?: number | null
          badge_level?: string | null
          best_answers?: number | null
          created_at?: string | null
          expertise_areas?: string[] | null
          helpful_votes?: number | null
          id?: string
          questions_asked?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers_given?: number | null
          badge_level?: string | null
          best_answers?: number | null
          created_at?: string | null
          expertise_areas?: string[] | null
          helpful_votes?: number | null
          id?: string
          questions_asked?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_task_preferences: {
        Row: {
          average_tasks_per_day: number | null
          avoided_categories:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          completion_rate: number | null
          created_at: string | null
          critical_tasks_only: boolean | null
          difficulty_preference: string | null
          enable_push_notifications: boolean | null
          enable_whatsapp_notifications: boolean | null
          id: string
          max_daily_tasks: number | null
          peak_activity_hours: number[] | null
          preferred_categories:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          preferred_time_windows: Json | null
          quiet_hours_end: number | null
          quiet_hours_start: number | null
          reminder_frequency: string | null
          streak_days: number | null
          total_tasks_completed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_tasks_per_day?: number | null
          avoided_categories?:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          completion_rate?: number | null
          created_at?: string | null
          critical_tasks_only?: boolean | null
          difficulty_preference?: string | null
          enable_push_notifications?: boolean | null
          enable_whatsapp_notifications?: boolean | null
          id?: string
          max_daily_tasks?: number | null
          peak_activity_hours?: number[] | null
          preferred_categories?:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          preferred_time_windows?: Json | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          reminder_frequency?: string | null
          streak_days?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_tasks_per_day?: number | null
          avoided_categories?:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          completion_rate?: number | null
          created_at?: string | null
          critical_tasks_only?: boolean | null
          difficulty_preference?: string | null
          enable_push_notifications?: boolean | null
          enable_whatsapp_notifications?: boolean | null
          id?: string
          max_daily_tasks?: number | null
          peak_activity_hours?: number[] | null
          preferred_categories?:
            | Database["public"]["Enums"]["task_category_enum"][]
            | null
          preferred_time_windows?: Json | null
          quiet_hours_end?: number | null
          quiet_hours_start?: number | null
          reminder_frequency?: string | null
          streak_days?: number | null
          total_tasks_completed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          chat_used_day: number
          created_at: string
          day_anchor: string
          fields_count: number
          id: string
          month_anchor: string
          scans_used_month: number
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_used_day?: number
          created_at?: string
          day_anchor?: string
          fields_count?: number
          id?: string
          month_anchor?: string
          scans_used_month?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_used_day?: number
          created_at?: string
          day_anchor?: string
          fields_count?: number
          id?: string
          month_anchor?: string
          scans_used_month?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      viral_content: {
        Row: {
          call_to_action: string | null
          comments_count: number | null
          content_type: string
          created_at: string | null
          description: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          likes_count: number | null
          money_saved: number | null
          shared_platforms: Json | null
          shares_count: number | null
          time_taken: string | null
          title: string
          user_id: string
          video_url: string | null
          yield_boost: string | null
        }
        Insert: {
          call_to_action?: string | null
          comments_count?: number | null
          content_type: string
          created_at?: string | null
          description: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          money_saved?: number | null
          shared_platforms?: Json | null
          shares_count?: number | null
          time_taken?: string | null
          title: string
          user_id: string
          video_url?: string | null
          yield_boost?: string | null
        }
        Update: {
          call_to_action?: string | null
          comments_count?: number | null
          content_type?: string
          created_at?: string | null
          description?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          money_saved?: number | null
          shared_platforms?: Json | null
          shares_count?: number | null
          time_taken?: string | null
          title?: string
          user_id?: string
          video_url?: string | null
          yield_boost?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          created_at: string | null
          date_recorded: string
          field_id: string | null
          humidity_percentage: number | null
          id: string
          precipitation_mm: number | null
          solar_radiation_watts_per_sqm: number | null
          temperature_celsius: number | null
          updated_at: string | null
          user_id: string
          wind_direction: string | null
          wind_speed_kmh: number | null
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string
          field_id?: string | null
          humidity_percentage?: number | null
          id?: string
          precipitation_mm?: number | null
          solar_radiation_watts_per_sqm?: number | null
          temperature_celsius?: number | null
          updated_at?: string | null
          user_id: string
          wind_direction?: string | null
          wind_speed_kmh?: number | null
        }
        Update: {
          created_at?: string | null
          date_recorded?: string
          field_id?: string | null
          humidity_percentage?: number | null
          id?: string
          precipitation_mm?: number | null
          solar_radiation_watts_per_sqm?: number | null
          temperature_celsius?: number | null
          updated_at?: string | null
          user_id?: string
          wind_direction?: string | null
          wind_speed_kmh?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_content: string
          message_type: string
          phone_number: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string
          user_id?: string
        }
        Relationships: []
      }
      yield_predictions: {
        Row: {
          confidence_score: number
          created_at: string | null
          crop_type: string
          factors: Json
          field_id: string | null
          id: string
          predicted_revenue: number
          predicted_yield: number
          soil_data: Json | null
          user_id: string | null
          weather_data: Json | null
        }
        Insert: {
          confidence_score: number
          created_at?: string | null
          crop_type: string
          factors: Json
          field_id?: string | null
          id?: string
          predicted_revenue: number
          predicted_yield: number
          soil_data?: Json | null
          user_id?: string | null
          weather_data?: Json | null
        }
        Update: {
          confidence_score?: number
          created_at?: string | null
          crop_type?: string
          factors?: Json
          field_id?: string | null
          id?: string
          predicted_revenue?: number
          predicted_yield?: number
          soil_data?: Json | null
          user_id?: string | null
          weather_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "yield_predictions_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      error_analytics: {
        Row: {
          avg_occurrences_per_error: number | null
          category: string | null
          earliest_error: string | null
          error_span_hours: number | null
          latest_error: string | null
          severity: string | null
          total_errors: number | null
          total_occurrences: number | null
          unresolved_errors: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      task_performance_metrics: {
        Row: {
          active_users: number | null
          avg_confidence_score: number | null
          avg_fpsi_impact: number | null
          date: string | null
          tasks_completed: number | null
          tasks_expired: number | null
          tasks_skipped: number | null
          total_tasks_generated: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          ai_usage_count: number | null
          created_at: string | null
          credit_balance: number | null
          disease_detections_count: number | null
          email: string | null
          farm_name: string | null
          farm_size: number | null
          farm_units: Database["public"]["Enums"]["farm_size_unit"] | null
          farms_count: number | null
          fields_count: number | null
          full_name: string | null
          id: string | null
          last_sign_in_at: string | null
          location: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          scans_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
          | {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
        Returns: string
      }
      backup_index_definition: {
        Args: { index_name_param: string }
        Returns: string
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      calculate_farm_health_score: {
        Args: { farm_uuid: string }
        Returns: number
      }
      calculate_organic_readiness: {
        Args: { user_uuid: string }
        Returns: number
      }
      capture_post_optimization_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_rls_policy_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          policy_count: number
          status: string
          table_name: string
        }[]
      }
      check_unindexed_foreign_keys: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_name: string
          foreign_table: string
          has_index: boolean
          status: string
          table_name: string
        }[]
      }
      check_unused_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          index_name: string
          index_scans: number
          status: string
          table_name: string
        }[]
      }
      cleanup_expired_crop_recommendations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_tasks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_error_logs: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_genius_task: {
        Args: { p_completion_data?: Json; p_task_id: string }
        Returns: boolean
      }
      complete_onboarding: {
        Args:
          | {
              budget_band?: string
              crops: string[]
              farm_name: string
              harvest_date: string
              has_irrigation?: boolean
              has_machinery?: boolean
              has_soil_test?: boolean
              p_user_id: string
              planting_date: string
              preferred_language?: string
              primary_goal?: string
              primary_pain_point?: string
              total_area: number
              whatsapp_number?: string
            }
          | {
              budget_band?: string
              crops: string
              farm_name: string
              harvest_date: string
              has_irrigation?: boolean
              has_machinery?: boolean
              has_soil_test?: boolean
              p_user_id: string
              planting_date: string
              preferred_language?: string
              primary_goal?: string
              primary_pain_point?: string
              total_area: number
              whatsapp_number?: string
            }
        Returns: Json
      }
      deduct_user_credits: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
          | { column_name: string; schema_name: string; table_name: string }
          | { column_name: string; table_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      execute_complete_rollback: {
        Args: { rollback_indexes?: boolean; rollback_policies?: boolean }
        Returns: {
          executed_at: string
          operation: string
          result: string
        }[]
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_feature_usage_data: {
        Args: { period_param?: string }
        Returns: Json
      }
      get_index_usage_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          idx_scan: number
          idx_tup_fetch: number
          idx_tup_read: number
          index_name: string
          table_name: string
        }[]
      }
      get_latest_farm_health: {
        Args: { farm_uuid: string }
        Returns: {
          data_quality: number
          health_factors: Json
          health_score: number
          last_updated: string
          trust_indicators: Json
        }[]
      }
      get_performance_comparison: {
        Args: Record<PropertyKey, never>
        Returns: {
          after_value: number
          before_value: number
          improvement_pct: number
          metric_type: string
          table_name: string
        }[]
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_system_analytics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_table_columns: {
        Args: { p_table_name: string; p_table_schema: string }
        Returns: {
          column_default: string
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_table_performance_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          idx_scan: number
          idx_tup_fetch: number
          n_tup_del: number
          n_tup_ins: number
          n_tup_upd: number
          seq_scan: number
          seq_tup_read: number
          table_name: string
        }[]
      }
      get_todays_genius_tasks: {
        Args: { p_user_id: string }
        Returns: {
          action_steps: string[] | null
          category: Database["public"]["Enums"]["task_category_enum"]
          celebration_level: string | null
          color_scheme: Json | null
          completed_at: string | null
          completion_data: Json | null
          confidence_score: number
          created_at: string | null
          crop_type: string | null
          deadline: string | null
          description: string
          detailed_instructions: string | null
          estimated_duration: number | null
          field_id: string | null
          field_name: string | null
          fpsi_impact_points: number | null
          generation_source: Database["public"]["Enums"]["task_generation_source_enum"]
          icon_name: string | null
          id: string
          impact_score: number
          learning_tags: string[] | null
          market_context: Json | null
          optimal_end_hour: number | null
          optimal_start_hour: number | null
          priority: Database["public"]["Enums"]["task_priority_enum"]
          risk_mitigation: number | null
          roi_estimate: number | null
          skip_reason: string | null
          status: Database["public"]["Enums"]["task_status_enum"] | null
          task_date: string | null
          task_type: Database["public"]["Enums"]["task_type_enum"]
          times_skipped: number | null
          title: string
          updated_at: string | null
          urgency: Database["public"]["Enums"]["task_urgency_enum"]
          user_id: string
          weather_dependency: Json | null
        }[]
      }
      get_user_display_name: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string
          display_name: string
        }[]
      }
      get_user_growth_data: {
        Args: { period_param?: string }
        Returns: Json
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: {
          expires_at: string
          permission: string
          resource_id: string
          resource_type: string
        }[]
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      grant_default_permissions: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      handle_stripe_webhook: {
        Args: {
          current_period_end?: string
          current_period_start?: string
          event_type: string
          stripe_customer_id: string
          stripe_price_id?: string
          stripe_subscription_id?: string
        }
        Returns: Json
      }
      has_permission: {
        Args: {
          permission_name: string
          resource_uuid?: string
          user_uuid: string
        }
        Returns: boolean
      }
      is_index_unused: {
        Args: { index_name_param: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: number
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      process_referral: {
        Args: { p_referred: string; p_referrer: string }
        Returns: undefined
      }
      restore_user_credits: {
        Args: { p_amount: number; p_description: string; p_user_id: string }
        Returns: undefined
      }
      rollback_ai_indexes: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      rollback_optimization_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      run_database_optimization_validation: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_type: string
          details: string
          item_name: string
          status: string
          table_name: string
        }[]
      }
      safe_drop_index: {
        Args: { index_name_param: string }
        Returns: boolean
      }
      save_user_onboarding_data: {
        Args:
          | {
              p_farm_location: string
              p_farm_name: string
              p_primary_crops: string[]
            }
          | { p_farm_name: string; p_primary_crops: string[] }
        Returns: undefined
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
          | {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { format?: string; geom: unknown }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; rel?: number }
          | { geom: unknown; maxdecimaldigits?: number; rel?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; options?: string; radius: number }
          | { geom: unknown; quadsegs: number; radius: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { dm?: number; dx: number; dy: number; dz?: number; geom: unknown }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { font?: Json; letters: string }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { from_proj: string; geom: unknown; to_proj: string }
          | { from_proj: string; geom: unknown; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      update_organic_progress: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      update_user_reputation: {
        Args: { action: string; user_id: string }
        Returns: undefined
      }
      update_vote_score: {
        Args: { target_id: string; target_type: string }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upsert_error_log: {
        Args: {
          p_category: string
          p_context: Json
          p_id: string
          p_message: string
          p_severity: string
          p_tags: string[]
        }
        Returns: string
      }
      validate_foreign_key_indexes: {
        Args: Record<PropertyKey, never>
        Returns: {
          effectiveness_status: string
          index_name: string
          scans_count: number
          table_name: string
        }[]
      }
      validate_rollback_completeness: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_type: string
          details: string
          status: string
        }[]
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      farm_size_unit: "hectares" | "acres"
      market_trend: "up" | "down" | "stable"
      task_category_enum:
        | "planting"
        | "irrigation"
        | "pest_control"
        | "disease_prevention"
        | "fertilization"
        | "harvesting"
        | "market_timing"
        | "field_preparation"
        | "monitoring"
        | "maintenance"
      task_generation_source_enum:
        | "weather_ai"
        | "crop_stage_ai"
        | "market_ai"
        | "disease_prediction"
        | "user_behavior"
        | "seasonal_pattern"
        | "emergency_alert"
      task_priority_enum: "1" | "2" | "3" | "4"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_status_enum:
        | "pending"
        | "in_progress"
        | "completed"
        | "skipped"
        | "expired"
      task_type_enum:
        | "weather_response"
        | "crop_management"
        | "field_maintenance"
        | "market_opportunity"
        | "preventive_action"
        | "planning"
        | "monitoring"
        | "irrigation"
        | "pest_control"
        | "disease_prevention"
        | "fertilization"
        | "harvesting"
      task_urgency_enum: "immediate" | "today" | "this_week" | "flexible"
      user_role: "admin" | "farmer" | "agronomist" | "viewer"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      farm_size_unit: ["hectares", "acres"],
      market_trend: ["up", "down", "stable"],
      task_category_enum: [
        "planting",
        "irrigation",
        "pest_control",
        "disease_prevention",
        "fertilization",
        "harvesting",
        "market_timing",
        "field_preparation",
        "monitoring",
        "maintenance",
      ],
      task_generation_source_enum: [
        "weather_ai",
        "crop_stage_ai",
        "market_ai",
        "disease_prediction",
        "user_behavior",
        "seasonal_pattern",
        "emergency_alert",
      ],
      task_priority_enum: ["1", "2", "3", "4"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_status_enum: [
        "pending",
        "in_progress",
        "completed",
        "skipped",
        "expired",
      ],
      task_type_enum: [
        "weather_response",
        "crop_management",
        "field_maintenance",
        "market_opportunity",
        "preventive_action",
        "planning",
        "monitoring",
        "irrigation",
        "pest_control",
        "disease_prevention",
        "fertilization",
        "harvesting",
      ],
      task_urgency_enum: ["immediate", "today", "this_week", "flexible"],
      user_role: ["admin", "farmer", "agronomist", "viewer"],
    },
  },
} as const
