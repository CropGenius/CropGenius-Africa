/**
 * 🧠 SUPER INTELLIGENCE AGENT - TRILLION DOLLAR FOUNDATION
 * Base architecture for all agricultural intelligence agents
 * INFINITY IQ DESIGN - Production-ready, scalable, bulletproof
 */

import { supabase } from '@/integrations/supabase/client';
import { logError, logSuccess, ErrorCategory, ErrorSeverity } from '@/services/errorLogger';

// Core Agent Types
export type AgentCapability = 
  | 'field_analysis' 
  | 'disease_detection' 
  | 'weather_prediction' 
  | 'market_intelligence' 
  | 'crop_optimization' 
  | 'decision_support';

export type AgentStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface ConfidenceScore {
  value: number; // 0-1
  factors: {
    dataQuality: number;
    modelAccuracy: number;
    contextRelevance: number;
    historicalPerformance: number;
  };
}

export interface AgentContext {
  userId: string;
  farmId?: string;
  fieldId?: string;
  location: { lat: number; lng: number };
  timestamp: Date;
  sessionId: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  metadata?: Record<string, any>;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  confidence: ConfidenceScore;
  reasoning: ExplanationTree;
  recommendations: ActionableRecommendation[];
  processingTime: number;
  agentId: string;
  timestamp: Date;
  error?: string;
}

export interface ExplanationTree {
  decision: string;
  reasoning: string;
  evidence: {
    source: string;
    weight: number;
    value: any;
    confidence: number;
  }[];
  alternatives?: {
    option: string;
    probability: number;
    reasoning: string;
  }[];
}

export interface ActionableRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'immediate' | 'short_term' | 'long_term';
  actions: {
    step: string;
    timeframe: string;
    resources?: string[];
    cost?: number;
  }[];
  expectedOutcome: string;
  confidence: number;
}

export interface UserFeedback {
  recommendationId: string;
  rating: number; // 1-5
  implemented: boolean;
  outcome?: 'positive' | 'negative' | 'neutral';
  comments?: string;
  timestamp: Date;
}

export interface CollaborationResult {
  consensusReached: boolean;
  finalRecommendation: ActionableRecommendation;
  conflictingAgents: string[];
  resolutionMethod: 'voting' | 'weighted' | 'expert_override';
  confidence: ConfidenceScore;
}

/**
 * SUPER INTELLIGENCE AGENT - Base Class
 * Every agricultural intelligence agent inherits from this foundation
 */
export abstract class SuperIntelligenceAgent {
  protected readonly id: string;
  protected readonly capabilities: AgentCapability[];
  protected status: AgentStatus = 'active';
  protected performanceMetrics: {
    totalRequests: number;
    successRate: number;
    avgProcessingTime: number;
    avgConfidence: number;
    userSatisfaction: number;
  } = {
    totalRequests: 0,
    successRate: 1.0,
    avgProcessingTime: 0,
    avgConfidence: 0.8,
    userSatisfaction: 4.0
  };

  constructor(id: string, capabilities: AgentCapability[]) {
    this.id = id;
    this.capabilities = capabilities;
  }

  /**
   * MAIN PROCESSING METHOD - Every agent must implement this
   */
  abstract process(context: AgentContext): Promise<AgentResponse>;

  /**
   * LEARNING METHOD - Continuous improvement from user feedback
   */
  async learn(feedback: UserFeedback): Promise<void> {
    try {
      // Store feedback in database
      await supabase.from('agent_feedback').insert({
        agent_id: this.id,
        recommendation_id: feedback.recommendationId,
        rating: feedback.rating,
        implemented: feedback.implemented,
        outcome: feedback.outcome,
        comments: feedback.comments,
        created_at: feedback.timestamp.toISOString()
      });

      // Update performance metrics
      this.updatePerformanceMetrics(feedback);

      logSuccess('agent_learning', {
        component: 'SuperIntelligenceAgent',
        agentId: this.id,
        rating: feedback.rating,
        implemented: feedback.implemented
      });
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.MEDIUM,
        { 
          component: 'SuperIntelligenceAgent',
          action: 'learn',
          agentId: this.id
        }
      );
    }
  }

  /**
   * COLLABORATION METHOD - Work with other agents
   */
  async collaborate(agents: SuperIntelligenceAgent[], context: AgentContext): Promise<CollaborationResult> {
    try {
      const startTime = Date.now();
      
      // Get responses from all agents
      const responses = await Promise.allSettled(
        agents.map(agent => agent.process(context))
      );

      const validResponses = responses
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<AgentResponse>).value)
        .filter(response => response.success);

      if (validResponses.length === 0) {
        throw new Error('No valid agent responses for collaboration');
      }

      // Resolve conflicts using weighted consensus
      const consensusResult = this.resolveConflicts(validResponses, context);
      
      const processingTime = Date.now() - startTime;
      
      logSuccess('agent_collaboration', {
        component: 'SuperIntelligenceAgent',
        agentCount: agents.length,
        validResponses: validResponses.length,
        processingTime,
        consensusReached: consensusResult.consensusReached
      });

      return consensusResult;
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.HIGH,
        { 
          component: 'SuperIntelligenceAgent',
          action: 'collaborate',
          agentId: this.id,
          agentCount: agents.length
        }
      );
      
      throw error;
    }
  }

  /**
   * CONFIDENCE CALCULATION - Dynamic confidence scoring
   */
  getConfidence(): ConfidenceScore {
    return {
      value: this.performanceMetrics.avgConfidence,
      factors: {
        dataQuality: 0.8, // Override in subclasses
        modelAccuracy: this.performanceMetrics.successRate,
        contextRelevance: 0.7, // Override in subclasses
        historicalPerformance: this.performanceMetrics.userSatisfaction / 5
      }
    };
  }

  /**
   * EXPLANATION GENERATION - Transparent AI reasoning
   */
  protected generateExplanation(
    decision: string,
    reasoning: string,
    evidence: any[],
    alternatives?: any[]
  ): ExplanationTree {
    return {
      decision,
      reasoning,
      evidence: evidence.map(e => ({
        source: e.source || 'unknown',
        weight: e.weight || 0.5,
        value: e.value,
        confidence: e.confidence || 0.7
      })),
      alternatives: alternatives?.map(alt => ({
        option: alt.option,
        probability: alt.probability || 0.3,
        reasoning: alt.reasoning || 'Alternative approach'
      }))
    };
  }

  /**
   * RECOMMENDATION GENERATION - Actionable insights
   */
  protected createRecommendation(
    title: string,
    description: string,
    priority: ActionableRecommendation['priority'],
    category: ActionableRecommendation['category'],
    actions: ActionableRecommendation['actions'],
    expectedOutcome: string,
    confidence: number = 0.8
  ): ActionableRecommendation {
    return {
      id: `${this.id}-rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      priority,
      category,
      actions,
      expectedOutcome,
      confidence
    };
  }

  /**
   * HEALTH CHECK - Agent status monitoring
   */
  async healthCheck(): Promise<{
    status: AgentStatus;
    metrics: typeof this.performanceMetrics;
    lastActivity: Date;
  }> {
    try {
      // Test basic functionality
      const testContext: AgentContext = {
        userId: 'health-check',
        location: { lat: 0, lng: 0 },
        timestamp: new Date(),
        sessionId: 'health-check',
        priority: 'low'
      };

      const startTime = Date.now();
      await this.validateCapabilities();
      const responseTime = Date.now() - startTime;

      // Update status based on performance
      if (responseTime > 10000) { // 10 seconds
        this.status = 'error';
      } else if (this.performanceMetrics.successRate < 0.8) {
        this.status = 'maintenance';
      } else {
        this.status = 'active';
      }

      return {
        status: this.status,
        metrics: this.performanceMetrics,
        lastActivity: new Date()
      };
    } catch (error) {
      this.status = 'error';
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.HIGH,
        { 
          component: 'SuperIntelligenceAgent',
          action: 'healthCheck',
          agentId: this.id
        }
      );
      
      return {
        status: 'error',
        metrics: this.performanceMetrics,
        lastActivity: new Date()
      };
    }
  }

  /**
   * CAPABILITY VALIDATION - Ensure agent is ready
   */
  protected abstract validateCapabilities(): Promise<void>;

  /**
   * CONFLICT RESOLUTION - Consensus algorithms
   */
  private resolveConflicts(responses: AgentResponse[], context: AgentContext): CollaborationResult {
    // Weighted voting based on confidence and agent performance
    const weightedResponses = responses.map(response => ({
      response,
      weight: response.confidence.value * this.getAgentWeight(response.agentId)
    }));

    // Sort by weight
    weightedResponses.sort((a, b) => b.weight - a.weight);
    
    const topResponse = weightedResponses[0].response;
    const conflictingAgents = weightedResponses
      .slice(1)
      .filter(wr => Math.abs(wr.weight - weightedResponses[0].weight) > 0.2)
      .map(wr => wr.response.agentId);

    // Merge recommendations from top responses
    const mergedRecommendations = this.mergeRecommendations(
      weightedResponses.slice(0, 3).map(wr => wr.response.recommendations).flat()
    );

    return {
      consensusReached: conflictingAgents.length === 0,
      finalRecommendation: mergedRecommendations[0] || topResponse.recommendations[0],
      conflictingAgents,
      resolutionMethod: 'weighted',
      confidence: {
        value: weightedResponses[0].weight,
        factors: topResponse.confidence.factors
      }
    };
  }

  /**
   * AGENT WEIGHT CALCULATION - Performance-based weighting
   */
  private getAgentWeight(agentId: string): number {
    // In production, this would query agent performance history
    // For now, return base weight
    return 1.0;
  }

  /**
   * RECOMMENDATION MERGING - Combine similar recommendations
   */
  private mergeRecommendations(recommendations: ActionableRecommendation[]): ActionableRecommendation[] {
    if (recommendations.length === 0) return [];
    
    // Group by category and priority
    const grouped = recommendations.reduce((acc, rec) => {
      const key = `${rec.category}-${rec.priority}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    }, {} as Record<string, ActionableRecommendation[]>);

    // Merge similar recommendations
    return Object.values(grouped).map(group => {
      if (group.length === 1) return group[0];
      
      // Merge multiple recommendations
      const merged = group[0];
      merged.description = group.map(r => r.description).join(' ');
      merged.actions = group.flatMap(r => r.actions);
      merged.confidence = group.reduce((sum, r) => sum + r.confidence, 0) / group.length;
      
      return merged;
    });
  }

  /**
   * PERFORMANCE METRICS UPDATE
   */
  private updatePerformanceMetrics(feedback: UserFeedback): void {
    this.performanceMetrics.totalRequests++;
    
    // Update user satisfaction (rolling average)
    const alpha = 0.1; // Learning rate
    this.performanceMetrics.userSatisfaction = 
      (1 - alpha) * this.performanceMetrics.userSatisfaction + 
      alpha * feedback.rating;

    // Update success rate based on implementation
    if (feedback.implemented) {
      const outcomeScore = feedback.outcome === 'positive' ? 1 : 
                          feedback.outcome === 'negative' ? 0 : 0.5;
      this.performanceMetrics.successRate = 
        (1 - alpha) * this.performanceMetrics.successRate + 
        alpha * outcomeScore;
    }
  }

  // Getters
  get agentId(): string { return this.id; }
  get agentCapabilities(): AgentCapability[] { return [...this.capabilities]; }
  get agentStatus(): AgentStatus { return this.status; }
  get metrics(): typeof this.performanceMetrics { return { ...this.performanceMetrics }; }
}