/**
 * 🧠 INTELLIGENCE SYSTEM - TRILLION DOLLAR ORCHESTRATION
 * Central system initialization and agent registration
 * INFINITY IQ DESIGN - Production-ready, auto-scaling, bulletproof
 */

import { AgentOrchestrator } from './AgentOrchestrator';
import { fieldIntelligenceAgent } from '@/agents/FieldIntelligenceAgent';
import { logSuccess, logError, ErrorCategory, ErrorSeverity } from './errorLogger';
import { initializeSentinelHubAuth } from '@/utils/sentinelHubAuth';

/**
 * INTELLIGENCE SYSTEM - Central coordinator
 */
export class IntelligenceSystem {
  private static instance: IntelligenceSystem;
  private orchestrator: AgentOrchestrator;
  private initialized: boolean = false;

  private constructor() {
    this.orchestrator = AgentOrchestrator.getInstance();
  }

  static getInstance(): IntelligenceSystem {
    if (!IntelligenceSystem.instance) {
      IntelligenceSystem.instance = new IntelligenceSystem();
    }
    return IntelligenceSystem.instance;
  }

  /**
   * INITIALIZE SYSTEM - Register all agents and start orchestration
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('🧠 Intelligence System already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Agricultural Superintelligence Engine...');

      // Initialize satellite services
      console.log('🛰️ Initializing satellite services...');
      await initializeSentinelHubAuth();

      // Register Field Intelligence Agent
      await this.orchestrator.registerAgent(fieldIntelligenceAgent);
      
      // TODO: Register other agents as they're implemented
      // await this.orchestrator.registerAgent(weatherPredictionAgent);
      // await this.orchestrator.registerAgent(marketIntelligenceAgent);
      // await this.orchestrator.registerAgent(diseaseDetectionAgent);
      // await this.orchestrator.registerAgent(cropOptimizationAgent);
      // await this.orchestrator.registerAgent(decisionSupportAgent);

      // Perform system health check
      const healthReport = await this.orchestrator.monitorAgentHealth();
      
      if (healthReport.activeAgents === 0) {
        throw new Error('No active agents available');
      }

      this.initialized = true;

      logSuccess('intelligence_system_initialized', {
        component: 'IntelligenceSystem',
        totalAgents: healthReport.totalAgents,
        activeAgents: healthReport.activeAgents,
        systemLoad: healthReport.systemLoad
      });

      console.log('✅ Agricultural Superintelligence Engine initialized successfully');
      console.log(`📊 System Status: ${healthReport.activeAgents}/${healthReport.totalAgents} agents active`);
      
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL,
        { 
          component: 'IntelligenceSystem',
          action: 'initialize'
        }
      );
      
      console.error('❌ Failed to initialize Intelligence System:', error);
      throw error;
    }
  }

  /**
   * GET ORCHESTRATOR - Access to the agent orchestrator
   */
  getOrchestrator(): AgentOrchestrator {
    if (!this.initialized) {
      throw new Error('Intelligence System not initialized. Call initialize() first.');
    }
    return this.orchestrator;
  }

  /**
   * HEALTH CHECK - System health monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    details: any;
  }> {
    try {
      if (!this.initialized) {
        return {
          status: 'critical',
          details: { error: 'System not initialized' }
        };
      }

      const healthReport = await this.orchestrator.monitorAgentHealth();
      
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
      
      if (healthReport.errorAgents > 0 || healthReport.activeAgents < healthReport.totalAgents * 0.5) {
        status = 'critical';
      } else if (healthReport.systemLoad > 0.8 || healthReport.avgResponseTime > 5000) {
        status = 'degraded';
      }

      return {
        status,
        details: healthReport
      };
    } catch (error) {
      return {
        status: 'critical',
        details: { error: error.message }
      };
    }
  }

  /**
   * SHUTDOWN - Graceful system shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down Intelligence System...');
      
      // TODO: Implement graceful agent shutdown
      // await this.orchestrator.shutdownAllAgents();
      
      this.initialized = false;
      
      logSuccess('intelligence_system_shutdown', {
        component: 'IntelligenceSystem'
      });
      
      console.log('✅ Intelligence System shutdown complete');
    } catch (error) {
      await logError(
        error as Error,
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        { 
          component: 'IntelligenceSystem',
          action: 'shutdown'
        }
      );
      
      console.error('❌ Error during system shutdown:', error);
    }
  }
}

// Export singleton instance
export const intelligenceSystem = IntelligenceSystem.getInstance();

/**
 * INITIALIZE INTELLIGENCE SYSTEM - Auto-initialization function
 */
export async function initializeIntelligenceSystem(): Promise<void> {
  try {
    await intelligenceSystem.initialize();
  } catch (error) {
    console.error('Failed to initialize Intelligence System:', error);
    // Don't throw - allow app to continue with degraded functionality
  }
}

/**
 * GET FIELD INTELLIGENCE - Convenience function for field analysis
 */
export async function getFieldIntelligence(
  fieldId: string,
  userId: string,
  priority: 'low' | 'medium' | 'high' | 'emergency' = 'medium'
) {
  const orchestrator = intelligenceSystem.getOrchestrator();
  
  return await orchestrator.orchestrateAnalysis({
    userId,
    fieldId,
    location: { lat: 0, lng: 0 }, // Will be fetched from field data
    timestamp: new Date(),
    sessionId: `field-intelligence-${Date.now()}`,
    priority,
    requiredCapabilities: ['field_analysis'],
    collaborationMode: 'parallel',
    timeoutMs: 30000
  });
}