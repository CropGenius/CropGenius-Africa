/**
 * 🎭 AGENT ORCHESTRATOR - TRILLION DOLLAR INTELLIGENCE COORDINATOR
 * Orchestrates multiple AI agents for comprehensive agricultural intelligence
 * INFINITY IQ DESIGN - Real-time coordination, conflict resolution, load balancing
 */

import { SuperIntelligenceAgent, AgentContext, AgentResponse, CollaborationResult, AgentCapability } from '@/agents/SuperIntelligenceAgent';
import { supabase } from '@/integrations/supabase/client';
import { logError, logSuccess, ErrorCategory, ErrorSeverity } from '@/services/errorLogger';

export interface OrchestratedResult {
  success: boolean;
  primaryResponse: AgentResponse;
  collaborationResults?: CollaborationResult;
  participatingAgents: string[];
  totalProcessingTime: number;
  confidence: number;
  recommendations: any[];
  reasoning: string;
}

export interface AnalysisContext extends AgentContext {
  requiredCapabilities: AgentCapability[];
  maxAgents?: number;
  timeoutMs?: number;
  collaborationMode: 'parallel' | 'sequential' | 'hybrid';
}

export interface WorkloadDistribution {
  agentId: string;
  load: number;
  capacity: number;
  estimatedProcessingTime: number;
  priority: number;
}

export interface HealthReport {
  totalAgents: number;
  activeAgents: number;
  errorAgents: number;
  maintenanceAgents: number;
  avgResponseTime: number;
  systemLoad: number;
  recommendations: string[];
}

/**
 * AGENT ORCHESTRATOR - Central Intelligence Coordinator
 */
export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private registeredAgents: Map<string, SuperIntelligenceAgent> = new Map();
  private agentCapabilities: Map<AgentCapability, string[]> = new Map();
  private loadBalancer: Map<string, number> = new Map();
  private circuitBreakers: Map<string, { failures: number; lastFailure: Date; isOpen: boolean }> = new Map();

  private constructor() {
    this.initializeCapabilityMap();
  }

  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  /**
   * AGENT REGISTRATION - Register new intelligence agents
   */
  async registerAgent(agent: SuperIntelligenceAgent): Promise<void> {
    try {
      const agentId = agent.agentId;
      
      // Health check before registration
      const healthStatus = await agent.healthCheck();
      if (healthStatus.status === 'error') {
        throw new Error(`Agent ${agentId} failed health check`);
      }

      // Register agent
      this.registeredAgents.set(agentId, agent);
      
      // Update capability mapping
      for (const capability of agent.agentCapabilities) {
        if (!this.agentCapabilities.has(capability)) {
          this.agentCapabilities.set(capability, []);
        }
        this.agentCapabilities.get(capability)!.push(agentId);
      }

      // Initialize load tracking
      this.loadBalancer.set(agentId, 0);
      this.circuitBreakers.set(agentId, { failures: 0, lastFailure: new Date(0), isOpen: false });

      // Store in database
      await supabase.from('registered_agents').upsert({
        agent_id: agentId,
        capabilities: agent.agentCapabilities,
        status: healthStatus.status,
        metrics: healthStatus.metrics,
        registered_at: new Date().toISOString()
      });

      logSuccess('agent_registered', {
        component: 'AgentOrchestrator',
        agentId,
        capabilities: agent.agentCapabilities,
        status: healthStatus.status
      });
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.HIGH,
        { 
          component: 'AgentOrchestrator',
          action: 'registerAgent',
          agentId: agent.agentId
        }
      );
      throw error;
    }
  }

  /**
   * ORCHESTRATED ANALYSIS - Coordinate multiple agents for comprehensive analysis
   */
  async orchestrateAnalysis(context: AnalysisContext): Promise<OrchestratedResult> {
    const startTime = Date.now();
    
    try {
      // Select optimal agents for the task
      const selectedAgents = await this.selectOptimalAgents(context);
      
      if (selectedAgents.length === 0) {
        throw new Error('No suitable agents available for the requested capabilities');
      }

      // Execute analysis based on collaboration mode
      let result: OrchestratedResult;
      
      switch (context.collaborationMode) {
        case 'parallel':
          result = await this.executeParallelAnalysis(selectedAgents, context);
          break;
        case 'sequential':
          result = await this.executeSequentialAnalysis(selectedAgents, context);
          break;
        case 'hybrid':
          result = await this.executeHybridAnalysis(selectedAgents, context);
          break;
        default:
          result = await this.executeParallelAnalysis(selectedAgents, context);
      }

      result.totalProcessingTime = Date.now() - startTime;
      
      // Store orchestration results
      await this.storeOrchestrationResults(context, result);
      
      logSuccess('orchestration_completed', {
        component: 'AgentOrchestrator',
        participatingAgents: result.participatingAgents,
        processingTime: result.totalProcessingTime,
        confidence: result.confidence,
        success: result.success
      });

      return result;
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.HIGH,
        { 
          component: 'AgentOrchestrator',
          action: 'orchestrateAnalysis',
          context: {
            userId: context.userId,
            capabilities: context.requiredCapabilities,
            mode: context.collaborationMode
          }
        }
      );
      
      // Return fallback result
      return this.createFallbackResult(context, Date.now() - startTime);
    }
  }

  /**
   * CONFLICT RESOLUTION - Resolve conflicting agent recommendations
   */
  async resolveConflicts(recommendations: any[]): Promise<any> {
    try {
      if (recommendations.length <= 1) {
        return recommendations[0] || null;
      }

      // Group recommendations by similarity
      const groups = this.groupSimilarRecommendations(recommendations);
      
      // Weight by confidence and agent performance
      const weightedGroups = await this.weightRecommendationGroups(groups);
      
      // Select highest weighted group
      const topGroup = weightedGroups[0];
      
      // Merge recommendations within the group
      const unifiedRecommendation = this.mergeRecommendations(topGroup.recommendations);
      
      logSuccess('conflict_resolved', {
        component: 'AgentOrchestrator',
        totalRecommendations: recommendations.length,
        groups: groups.length,
        selectedGroup: topGroup.id,
        confidence: unifiedRecommendation.confidence
      });

      return unifiedRecommendation;
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.MEDIUM,
        { 
          component: 'AgentOrchestrator',
          action: 'resolveConflicts',
          recommendationCount: recommendations.length
        }
      );
      
      // Return first recommendation as fallback
      return recommendations[0] || null;
    }
  }

  /**
   * WORKLOAD MANAGEMENT - Distribute load across agents
   */
  async manageWorkload(priority: 'low' | 'medium' | 'high' | 'emergency'): Promise<WorkloadDistribution[]> {
    try {
      const distributions: WorkloadDistribution[] = [];
      
      for (const [agentId, agent] of this.registeredAgents) {
        const currentLoad = this.loadBalancer.get(agentId) || 0;
        const healthStatus = await agent.healthCheck();
        
        // Calculate capacity based on agent status and performance
        let capacity = 1.0;
        if (healthStatus.status === 'maintenance') capacity = 0.5;
        if (healthStatus.status === 'error') capacity = 0.0;
        
        // Adjust capacity based on performance metrics
        capacity *= healthStatus.metrics.successRate;
        
        // Calculate priority multiplier
        const priorityMultiplier = {
          'low': 1.0,
          'medium': 1.2,
          'high': 1.5,
          'emergency': 2.0
        }[priority];

        distributions.push({
          agentId,
          load: currentLoad,
          capacity: capacity * priorityMultiplier,
          estimatedProcessingTime: this.estimateProcessingTime(agentId, priority),
          priority: priorityMultiplier
        });
      }

      // Sort by available capacity (capacity - load)
      distributions.sort((a, b) => (b.capacity - b.load) - (a.capacity - a.load));
      
      return distributions;
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.MEDIUM,
        { 
          component: 'AgentOrchestrator',
          action: 'manageWorkload',
          priority
        }
      );
      
      return [];
    }
  }

  /**
   * HEALTH MONITORING - Monitor agent ecosystem health
   */
  async monitorAgentHealth(): Promise<HealthReport> {
    try {
      const healthChecks = await Promise.allSettled(
        Array.from(this.registeredAgents.values()).map(agent => agent.healthCheck())
      );

      const validHealthChecks = healthChecks
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);

      const totalAgents = this.registeredAgents.size;
      const activeAgents = validHealthChecks.filter(h => h.status === 'active').length;
      const errorAgents = validHealthChecks.filter(h => h.status === 'error').length;
      const maintenanceAgents = validHealthChecks.filter(h => h.status === 'maintenance').length;

      const avgResponseTime = validHealthChecks.reduce((sum, h) => 
        sum + h.metrics.avgProcessingTime, 0) / Math.max(validHealthChecks.length, 1);

      const systemLoad = Array.from(this.loadBalancer.values()).reduce((sum, load) => sum + load, 0) / totalAgents;

      const recommendations = this.generateHealthRecommendations(
        totalAgents, activeAgents, errorAgents, maintenanceAgents, systemLoad
      );

      const report: HealthReport = {
        totalAgents,
        activeAgents,
        errorAgents,
        maintenanceAgents,
        avgResponseTime,
        systemLoad,
        recommendations
      };

      // Store health report
      await supabase.from('agent_health_reports').insert({
        report_data: report,
        created_at: new Date().toISOString()
      });

      return report;
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.AI,
        ErrorSeverity.HIGH,
        { 
          component: 'AgentOrchestrator',
          action: 'monitorAgentHealth'
        }
      );
      
      return {
        totalAgents: 0,
        activeAgents: 0,
        errorAgents: 0,
        maintenanceAgents: 0,
        avgResponseTime: 0,
        systemLoad: 0,
        recommendations: ['Health monitoring temporarily unavailable']
      };
    }
  }

  /**
   * PRIVATE METHODS - Internal orchestration logic
   */

  private initializeCapabilityMap(): void {
    const capabilities: AgentCapability[] = [
      'field_analysis', 'disease_detection', 'weather_prediction',
      'market_intelligence', 'crop_optimization', 'decision_support'
    ];
    
    capabilities.forEach(capability => {
      this.agentCapabilities.set(capability, []);
    });
  }

  private async selectOptimalAgents(context: AnalysisContext): Promise<SuperIntelligenceAgent[]> {
    const selectedAgents: SuperIntelligenceAgent[] = [];
    
    for (const capability of context.requiredCapabilities) {
      const capableAgentIds = this.agentCapabilities.get(capability) || [];
      
      // Filter by circuit breaker status and load
      const availableAgentIds = capableAgentIds.filter(agentId => {
        const circuitBreaker = this.circuitBreakers.get(agentId);
        const load = this.loadBalancer.get(agentId) || 0;
        
        return !circuitBreaker?.isOpen && load < 0.8; // Max 80% load
      });

      if (availableAgentIds.length > 0) {
        // Select agent with lowest load
        const optimalAgentId = availableAgentIds.reduce((best, current) => {
          const bestLoad = this.loadBalancer.get(best) || 0;
          const currentLoad = this.loadBalancer.get(current) || 0;
          return currentLoad < bestLoad ? current : best;
        });

        const agent = this.registeredAgents.get(optimalAgentId);
        if (agent && !selectedAgents.includes(agent)) {
          selectedAgents.push(agent);
        }
      }
    }

    // Limit agents if specified
    if (context.maxAgents && selectedAgents.length > context.maxAgents) {
      return selectedAgents.slice(0, context.maxAgents);
    }

    return selectedAgents;
  }

  private async executeParallelAnalysis(agents: SuperIntelligenceAgent[], context: AnalysisContext): Promise<OrchestratedResult> {
    const timeout = context.timeoutMs || 30000; // 30 second default
    
    // Execute all agents in parallel with timeout
    const responses = await Promise.allSettled(
      agents.map(agent => 
        Promise.race([
          agent.process(context),
          new Promise<AgentResponse>((_, reject) => 
            setTimeout(() => reject(new Error('Agent timeout')), timeout)
          )
        ])
      )
    );

    const validResponses = responses
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<AgentResponse>).value)
      .filter(response => response.success);

    if (validResponses.length === 0) {
      throw new Error('No valid responses from agents');
    }

    // Select primary response (highest confidence)
    const primaryResponse = validResponses.reduce((best, current) => 
      current.confidence.value > best.confidence.value ? current : best
    );

    // Collaborate for unified result
    const collaborationResult = await this.collaborateResponses(validResponses, context);

    return {
      success: true,
      primaryResponse,
      collaborationResults: collaborationResult,
      participatingAgents: validResponses.map(r => r.agentId),
      totalProcessingTime: 0, // Will be set by caller
      confidence: collaborationResult.confidence.value,
      recommendations: collaborationResult.finalRecommendation ? [collaborationResult.finalRecommendation] : [],
      reasoning: `Parallel analysis by ${validResponses.length} agents with ${collaborationResult.consensusReached ? 'consensus' : 'conflict resolution'}`
    };
  }

  private async executeSequentialAnalysis(agents: SuperIntelligenceAgent[], context: AnalysisContext): Promise<OrchestratedResult> {
    const responses: AgentResponse[] = [];
    let enhancedContext = { ...context };

    for (const agent of agents) {
      try {
        const response = await agent.process(enhancedContext);
        if (response.success) {
          responses.push(response);
          // Enhance context with previous results
          enhancedContext.metadata = {
            ...enhancedContext.metadata,
            previousResults: responses
          };
        }
      } catch (error) {
        console.warn(`Agent ${agent.agentId} failed in sequential analysis:`, error);
      }
    }

    if (responses.length === 0) {
      throw new Error('No successful responses in sequential analysis');
    }

    const primaryResponse = responses[responses.length - 1]; // Last response
    const collaborationResult = await this.collaborateResponses(responses, context);

    return {
      success: true,
      primaryResponse,
      collaborationResults: collaborationResult,
      participatingAgents: responses.map(r => r.agentId),
      totalProcessingTime: 0,
      confidence: collaborationResult.confidence.value,
      recommendations: collaborationResult.finalRecommendation ? [collaborationResult.finalRecommendation] : [],
      reasoning: `Sequential analysis by ${responses.length} agents building on previous results`
    };
  }

  private async executeHybridAnalysis(agents: SuperIntelligenceAgent[], context: AnalysisContext): Promise<OrchestratedResult> {
    // Split agents into parallel groups based on capabilities
    const groups = this.groupAgentsByCapability(agents);
    const groupResults: AgentResponse[] = [];

    // Execute each group in parallel, groups sequentially
    for (const group of groups) {
      const groupResponses = await Promise.allSettled(
        group.map(agent => agent.process(context))
      );

      const validGroupResponses = groupResponses
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<AgentResponse>).value)
        .filter(response => response.success);

      if (validGroupResponses.length > 0) {
        // Select best response from group
        const bestGroupResponse = validGroupResponses.reduce((best, current) => 
          current.confidence.value > best.confidence.value ? current : best
        );
        groupResults.push(bestGroupResponse);
      }
    }

    if (groupResults.length === 0) {
      throw new Error('No successful responses in hybrid analysis');
    }

    const primaryResponse = groupResults[groupResults.length - 1];
    const collaborationResult = await this.collaborateResponses(groupResults, context);

    return {
      success: true,
      primaryResponse,
      collaborationResults: collaborationResult,
      participatingAgents: groupResults.map(r => r.agentId),
      totalProcessingTime: 0,
      confidence: collaborationResult.confidence.value,
      recommendations: collaborationResult.finalRecommendation ? [collaborationResult.finalRecommendation] : [],
      reasoning: `Hybrid analysis with ${groups.length} capability groups processed in sequence`
    };
  }

  private async collaborateResponses(responses: AgentResponse[], context: AnalysisContext): Promise<CollaborationResult> {
    // Use the first agent to coordinate collaboration
    const coordinatingAgent = this.registeredAgents.get(responses[0].agentId);
    if (!coordinatingAgent) {
      throw new Error('Coordinating agent not found');
    }

    // Create mock agents for collaboration (simplified)
    const mockAgents = responses.map(response => ({
      agentId: response.agentId,
      process: async () => response
    })) as SuperIntelligenceAgent[];

    return await coordinatingAgent.collaborate(mockAgents, context);
  }

  private groupAgentsByCapability(agents: SuperIntelligenceAgent[]): SuperIntelligenceAgent[][] {
    const groups: SuperIntelligenceAgent[][] = [];
    const processed = new Set<string>();

    for (const agent of agents) {
      if (processed.has(agent.agentId)) continue;

      const group = [agent];
      processed.add(agent.agentId);

      // Find agents with similar capabilities
      for (const otherAgent of agents) {
        if (processed.has(otherAgent.agentId)) continue;

        const commonCapabilities = agent.agentCapabilities.filter(cap => 
          otherAgent.agentCapabilities.includes(cap)
        );

        if (commonCapabilities.length > 0) {
          group.push(otherAgent);
          processed.add(otherAgent.agentId);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  private groupSimilarRecommendations(recommendations: any[]): any[] {
    // Simplified grouping by category and priority
    const groups: { [key: string]: any[] } = {};
    
    recommendations.forEach(rec => {
      const key = `${rec.category || 'general'}-${rec.priority || 'medium'}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(rec);
    });

    return Object.entries(groups).map(([key, recs]) => ({
      id: key,
      recommendations: recs,
      count: recs.length
    }));
  }

  private async weightRecommendationGroups(groups: any[]): Promise<any[]> {
    // Weight by group size and average confidence
    return groups.map(group => ({
      ...group,
      weight: group.count * (group.recommendations.reduce((sum: number, rec: any) => 
        sum + (rec.confidence || 0.5), 0) / group.recommendations.length)
    })).sort((a, b) => b.weight - a.weight);
  }

  private mergeRecommendations(recommendations: any[]): any {
    if (recommendations.length === 0) return null;
    if (recommendations.length === 1) return recommendations[0];

    // Merge multiple recommendations
    const merged = { ...recommendations[0] };
    merged.description = recommendations.map(r => r.description).join(' ');
    merged.confidence = recommendations.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / recommendations.length;
    
    return merged;
  }

  private estimateProcessingTime(agentId: string, priority: string): number {
    const agent = this.registeredAgents.get(agentId);
    if (!agent) return 5000; // 5 second default

    const baseTime = agent.metrics.avgProcessingTime || 2000;
    const priorityMultiplier = {
      'low': 1.0,
      'medium': 0.8,
      'high': 0.6,
      'emergency': 0.4
    }[priority] || 1.0;

    return baseTime * priorityMultiplier;
  }

  private generateHealthRecommendations(
    total: number, active: number, error: number, maintenance: number, systemLoad: number
  ): string[] {
    const recommendations: string[] = [];

    if (error > 0) {
      recommendations.push(`${error} agents in error state - investigate and restart`);
    }

    if (maintenance > total * 0.3) {
      recommendations.push('High number of agents in maintenance - consider system upgrade');
    }

    if (systemLoad > 0.8) {
      recommendations.push('System load high - consider scaling up agent capacity');
    }

    if (active < total * 0.7) {
      recommendations.push('Low agent availability - check system health');
    }

    if (recommendations.length === 0) {
      recommendations.push('Agent ecosystem healthy - all systems operational');
    }

    return recommendations;
  }

  private createFallbackResult(context: AnalysisContext, processingTime: number): OrchestratedResult {
    return {
      success: false,
      primaryResponse: {
        success: false,
        confidence: { value: 0.1, factors: { dataQuality: 0.1, modelAccuracy: 0.1, contextRelevance: 0.1, historicalPerformance: 0.1 } },
        reasoning: { decision: 'Fallback', reasoning: 'Agent orchestration failed', evidence: [] },
        recommendations: [],
        processingTime,
        agentId: 'fallback',
        timestamp: new Date(),
        error: 'Orchestration failed'
      },
      participatingAgents: [],
      totalProcessingTime: processingTime,
      confidence: 0.1,
      recommendations: [],
      reasoning: 'Fallback result due to orchestration failure'
    };
  }

  private async storeOrchestrationResults(context: AnalysisContext, result: OrchestratedResult): Promise<void> {
    try {
      await supabase.from('orchestration_results').insert({
        user_id: context.userId,
        session_id: context.sessionId,
        required_capabilities: context.requiredCapabilities,
        collaboration_mode: context.collaborationMode,
        participating_agents: result.participatingAgents,
        success: result.success,
        confidence: result.confidence,
        processing_time: result.totalProcessingTime,
        result_data: {
          primaryResponse: result.primaryResponse,
          collaborationResults: result.collaborationResults,
          recommendations: result.recommendations
        },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Failed to store orchestration results:', error);
    }
  }
}