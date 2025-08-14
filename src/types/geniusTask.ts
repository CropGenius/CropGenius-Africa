/**
 * 🧠 GENIUS TASK SYSTEM - CORE DATA MODELS
 * Production-ready types for the AI-powered daily task system
 * Built for 100 million farmers - INFINITY IQ ARCHITECTURE
 */

import { WeatherData, FieldData } from '@/services/DashboardDataManager';

// ============================================================================
// CORE GENIUS TASK TYPES - THE FOUNDATION OF AGRICULTURAL INTELLIGENCE
// ============================================================================

export enum TaskType {
  WEATHER_RESPONSE = 'weather_response',
  CROP_MANAGEMENT = 'crop_management', 
  FIELD_MAINTENANCE = 'field_maintenance',
  MARKET_OPPORTUNITY = 'market_opportunity',
  PREVENTIVE_ACTION = 'preventive_action',
  PLANNING = 'planning',
  MONITORING = 'monitoring',
  IRRIGATION = 'irrigation',
  PEST_CONTROL = 'pest_control',
  DISEASE_PREVENTION = 'disease_prevention',
  FERTILIZATION = 'fertilization',
  HARVESTING = 'harvesting'
}

export enum TaskCategory {
  PLANTING = 'planting',
  IRRIGATION = 'irrigation', 
  PEST_CONTROL = 'pest_control',
  DISEASE_PREVENTION = 'disease_prevention',
  FERTILIZATION = 'fertilization',
  HARVESTING = 'harvesting',
  MARKET_TIMING = 'market_timing',
  FIELD_PREPARATION = 'field_preparation',
  MONITORING = 'monitoring',
  MAINTENANCE = 'maintenance'
}

export enum TaskPriority {
  CRITICAL = 1,    // Must do today - farm at risk
  HIGH = 2,        // Should do today - significant impact
  MEDIUM = 3,      // Good to do today - moderate impact  
  LOW = 4          // Can be postponed - minor impact
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  EXPIRED = 'expired'
}

export enum TaskUrgency {
  IMMEDIATE = 'immediate',     // Next 2 hours
  TODAY = 'today',            // Within 24 hours
  THIS_WEEK = 'this_week',    // Within 7 days
  FLEXIBLE = 'flexible'       // No strict deadline
}

export enum TaskGenerationSource {
  WEATHER_AI = 'weather_ai',
  CROP_STAGE_AI = 'crop_stage_ai', 
  MARKET_AI = 'market_ai',
  DISEASE_PREDICTION = 'disease_prediction',
  USER_BEHAVIOR = 'user_behavior',
  SEASONAL_PATTERN = 'seasonal_pattern',
  EMERGENCY_ALERT = 'emergency_alert'
}

// ============================================================================
// CORE GENIUS TASK INTERFACE - THE HEART OF AGRICULTURAL INTELLIGENCE
// ============================================================================

export interface GeniusTask {
  // Basic identification
  id: string;
  type: TaskType;
  category: TaskCategory;
  
  // Task content - CRYSTAL CLEAR for farmers
  title: string;
  description: string;
  detailedInstructions?: string;
  actionSteps?: string[];
  
  // Prioritization and timing - SMART SCHEDULING
  priority: TaskPriority;
  urgency: TaskUrgency;
  estimatedDuration: number; // minutes
  optimalTimeWindow?: TimeWindow;
  deadline?: Date;
  
  // Context and relationships - INTELLIGENT CONNECTIONS
  fieldId?: string;
  fieldName?: string;
  cropType?: string;
  weatherDependency?: WeatherDependency;
  marketContext?: MarketContext;
  
  // Impact and value - SHOW THE MONEY
  expectedImpact: TaskImpact;
  fpsiImpactPoints: number;
  roiEstimate?: number;
  riskMitigation?: number; // Percentage of risk reduced
  
  // Status and completion - TRACK EVERYTHING
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  completionData?: TaskCompletionData;
  
  // User interaction - LEARN FROM FARMERS
  userFeedback?: TaskFeedback;
  skipReason?: string;
  timesSkipped?: number;
  
  // AI metadata - CONTINUOUS IMPROVEMENT
  generationSource: TaskGenerationSource;
  confidenceScore: number; // 0-1 scale
  learningTags: string[];
  
  // Visual and UX - BEAUTIFUL INTERFACE
  iconName?: string;
  colorScheme?: TaskColorScheme;
  celebrationLevel?: CelebrationLevel;
}

// ============================================================================
// SUPPORTING INTERFACES - COMPREHENSIVE TASK ECOSYSTEM
// ============================================================================

export interface TimeWindow {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  preferredHour?: number;
  timeZone?: string;
}

export interface WeatherDependency {
  requiresDryWeather?: boolean;
  requiresWetWeather?: boolean;
  temperatureRange?: { min: number; max: number };
  humidityRange?: { min: number; max: number };
  windSpeedMax?: number;
  avoidRain?: boolean;
}

export interface MarketContext {
  cropPrices?: { [crop: string]: number };
  priceDirection?: 'rising' | 'falling' | 'stable';
  marketWindow?: { start: Date; end: Date };
  profitOpportunity?: number; // Percentage increase potential
}

export interface TaskImpact {
  fpsiPoints: number;           // Farm Profit & Sustainability Index points
  yieldImpact: number;          // Percentage impact on yield
  costImpact: number;           // Financial impact in local currency
  riskReduction: number;        // Risk mitigation percentage
  timeWindow: number;           // Days before opportunity/risk expires
  sustainabilityScore: number;  // Environmental impact score
}

export interface TaskCompletionData {
  completedAt: Date;
  actualDuration: number;       // minutes
  difficultyRating: number;     // 1-5 scale
  effectivenessRating: number;  // 1-5 scale
  notes?: string;
  photosUploaded?: string[];
  gpsLocation?: { lat: number; lng: number };
  weatherAtCompletion?: WeatherData;
  qualityScore?: number;        // 1-5 scale for task execution quality
}

export interface TaskFeedback {
  taskId: string;
  rating: number;               // 1-5 scale overall
  relevanceScore: number;       // How relevant was this task (1-5)
  clarityScore: number;         // How clear were instructions (1-5)
  timingScore: number;          // Was timing appropriate (1-5)
  difficultyScore: number;      // How difficult was execution (1-5)
  comments?: string;
  wouldRecommendToOthers: boolean;
  improvementSuggestions?: string[];
}

export interface TaskColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export enum CelebrationLevel {
  NONE = 'none',
  SMALL = 'small',       // Simple checkmark
  MEDIUM = 'medium',     // Confetti animation
  LARGE = 'large',       // Full celebration with sound
  EPIC = 'epic'          // Major milestone celebration
}

// ============================================================================
// TASK GENERATION CONTEXT - AI INTELLIGENCE INPUTS
// ============================================================================

export interface TaskGenerationContext {
  user: UserProfile;
  fields: FieldData[];
  weather: WeatherData;
  forecast: WeatherForecast[];
  marketData?: MarketData;
  userBehavior: UserBehaviorData;
  seasonalContext: SeasonalContext;
  farmHealth: FarmHealthData;
  currentTasks: GeniusTask[];
  completedTasksToday: GeniusTask[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  full_name?: string;
  farmingExperience?: number; // years
  preferredLanguage?: string;
  location?: { lat: number; lng: number };
  timezone?: string;
}

export interface WeatherForecast {
  date: Date;
  temperature: { min: number; max: number };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

export interface MarketData {
  prices: { [crop: string]: number };
  trends: { [crop: string]: 'rising' | 'falling' | 'stable' };
  demandForecast: { [crop: string]: number };
  seasonalPatterns: { [crop: string]: number[] };
}

export interface UserBehaviorData {
  taskCompletionRate: number;           // 0-1 scale
  preferredTaskTypes: TaskType[];
  averageTasksPerDay: number;
  peakActivityHours: number[];          // Hours when user is most active
  skipPatterns: TaskSkipPattern[];
  feedbackHistory: TaskFeedback[];
  streakDays: number;                   // Current completion streak
  totalTasksCompleted: number;
  preferredDifficulty: 'easy' | 'medium' | 'hard';
}

export interface TaskSkipPattern {
  taskType: TaskType;
  skipRate: number;                     // 0-1 scale
  commonReasons: string[];
  timePatterns: number[];               // Hours when skips occur
}

export interface SeasonalContext {
  currentSeason: 'dry' | 'wet' | 'planting' | 'harvest';
  daysIntoSeason: number;
  seasonalTasks: TaskType[];
  cropCalendar: { [crop: string]: CropStage };
}

export interface CropStage {
  stage: 'planting' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  daysInStage: number;
  nextStageDate?: Date;
  stageSpecificTasks: TaskType[];
}

export interface FarmHealthData {
  fpsiScore: number;                    // 0-100 scale
  riskFactors: string[];
  opportunities: string[];
  criticalIssues: string[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// TASK INTERACTION TYPES - USER EXPERIENCE
// ============================================================================

export interface TaskInteraction {
  taskId: string;
  interactionType: 'view' | 'start' | 'complete' | 'skip' | 'feedback';
  timestamp: Date;
  duration?: number;                    // milliseconds
  metadata?: Record<string, any>;
}

export interface TaskPreferences {
  maxDailyTasks: number;
  preferredCategories: TaskCategory[];
  avoidedCategories: TaskCategory[];
  preferredTimeWindows: TimeWindow[];
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'mixed';
  notificationPreferences: NotificationPreferences;
}

export interface NotificationPreferences {
  enablePushNotifications: boolean;
  enableWhatsAppNotifications: boolean;
  criticalTasksOnly: boolean;
  quietHours: TimeWindow;
  reminderFrequency: 'never' | 'once' | 'twice' | 'hourly';
}

// ============================================================================
// TASK ANALYTICS AND LEARNING - CONTINUOUS IMPROVEMENT
// ============================================================================

export interface TaskAnalytics {
  taskId: string;
  userId: string;
  generatedAt: Date;
  viewedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
  
  // Performance metrics
  timeToView: number;                   // milliseconds from generation
  timeToStart: number;                  // milliseconds from view
  timeToComplete: number;               // milliseconds from start
  
  // Context at generation
  weatherConditions: WeatherData;
  userState: 'active' | 'inactive' | 'new';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  
  // Outcome metrics
  actualImpact?: number;                // Measured impact vs predicted
  userSatisfaction?: number;            // 1-5 scale
  wouldGenerateAgain: boolean;
}

export interface TaskLearningData {
  userId: string;
  taskType: TaskType;
  category: TaskCategory;
  
  // Success metrics
  completionRate: number;               // 0-1 scale
  averageRating: number;                // 1-5 scale
  averageCompletionTime: number;        // minutes
  
  // Context patterns
  successfulWeatherConditions: WeatherData[];
  successfulTimeWindows: TimeWindow[];
  successfulSeasons: string[];
  
  // Personalization insights
  personalizedInstructions?: string;
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  optimalFrequency: number;             // tasks per week
}

// ============================================================================
// UTILITY TYPES - HELPER INTERFACES
// ============================================================================

export type TaskFilter = {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  dateRange?: { start: Date; end: Date };
  fieldId?: string;
};

export type TaskSort = {
  field: 'priority' | 'deadline' | 'createdAt' | 'estimatedDuration';
  direction: 'asc' | 'desc';
};

export interface TaskListOptions {
  filter?: TaskFilter;
  sort?: TaskSort;
  limit?: number;
  offset?: number;
}

// ============================================================================
// EXPORT ALL TYPES - READY FOR PRODUCTION
// ============================================================================

export type {
  TaskGenerationContext,
  UserProfile,
  WeatherForecast,
  MarketData,
  UserBehaviorData,
  TaskSkipPattern,
  SeasonalContext,
  CropStage,
  FarmHealthData,
  TaskInteraction,
  TaskPreferences,
  NotificationPreferences,
  TaskAnalytics,
  TaskLearningData,
  TaskFilter,
  TaskSort,
  TaskListOptions
};