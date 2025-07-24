/**
 * 🔧 ERROR RECOVERY SYSTEM
 * -------------------------------------------------------------
 * Intelligent error recovery system that learns from failures
 * - Pattern recognition for common errors
 * - Automatic recovery strategies
 * - Progressive fallback mechanisms
 * - Performance monitoring and optimization
 */

import { toast } from 'sonner';
import { offlineDataManager } from './offlineDataManager';

export interface ErrorPattern {
  id: string;
  errorType: string;
  component: string;
  pattern: RegExp;
  frequency: number;
  lastOccurrence: Date;
  recoveryStrategies: RecoveryStrategy[];
  successRate: number;
}

export interface RecoveryStrategy {
  id: string;
  name: string;
  priority: number;
  execute: (error: Error, context: ErrorContext) => Promise<RecoveryResult>;
  conditions: (error: Error, context: ErrorContext) => boolean;
  successCount: number;
  failureCount: number;
  averageRecoveryTime: number;
}

export interface ErrorContext {
  component: string;
  operation: string;
  timestamp: Date;
  networkStatus: 'online' | 'offline';
  retryCount: number;
  userAgent: string;
  url: string;
  metadata?: Record<string, any>;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  recoveryTime: number;
  fallbackData?: any;
  message?: string;
  shouldRetry?: boolean;
  retryDelay?: number;
}

class ErrorRecoverySystem {
  private static instance: ErrorRecoverySystem;
  private patterns: Map<string, ErrorPattern> = new Map();
  private strategies: Map<string, RecoveryStrategy> = new Map();
  private recoveryHistory: Array<{
    error: Error;
    context: ErrorContext;
    result: RecoveryResult;
    timestamp: Date;
  }> = [];

  private constructor() {
    this.initializeDefaultStrategies();
    this.loadPatternsFromStorage();
  }

  static getInstance(): ErrorRecoverySystem {
    if (!ErrorRecoverySystem.instance) {
      ErrorRecoverySystem.instance = new ErrorRecoverySystem();
    }
    return ErrorRecoverySystem.instance;
  }

  /**
   * Main recovery method - attempts to recover from an error
   */
  async recoverFromError(error: Error, context: ErrorContext): Promise<RecoveryResult> {
    const startTime = Date.now();
    
    try {
      // Update error patterns
      await this.updateErrorPattern(error, context);
      
      // Find matching recovery strategies
      const applicableStrategies = this.findApplicableStrategies(error, context);
      
      if (applicableStrategies.length === 0) {
        return {
          success: false,
          strategy: 'none',
          recoveryTime: Date.now() - startTime,
          message: 'No recovery strategy available'
        };
      }

      // Try strategies in order of priority
      for (const strategy of applicableStrategies) {
        try {
          console.log(`🔧 [ErrorRecovery] Attempting strategy: ${strategy.name}`);
          
          const result = await strategy.execute(error, context);
          const recoveryTime = Date.now() - startTime;
          
          // Update strategy statistics
          if (result.success) {
            strategy.successCount++;
            strategy.averageRecoveryTime = 
              (strategy.averageRecoveryTime * (strategy.successCount - 1) + recoveryTime) / strategy.successCount;
            
            // Record successful recovery
            this.recordRecovery(error, context, { ...result, recoveryTime });
            
            console.log(`✅ [ErrorRecovery] Strategy ${strategy.name} succeeded in ${recoveryTime}ms`);
            
            return { ...result, recoveryTime };
          } else {
            strategy.failureCount++;
            console.warn(`❌ [ErrorRecovery] Strategy ${strategy.name} failed`);
          }
        } catch (strategyError) {
          console.error(`💥 [ErrorRecovery] Strategy ${strategy.name} threw error:`, strategyError);
          strategy.failureCount++;
        }
      }

      // All strategies failed
      return {
        success: false,
        strategy: 'all_failed',
        recoveryTime: Date.now() - startTime,
        message: 'All recovery strategies failed'
      };

    } catch (recoveryError) {
      console.error('💥 [ErrorRecovery] Recovery system error:', recoveryError);
      return {
        success: false,
        strategy: 'system_error',
        recoveryTime: Date.now() - startTime,
        message: 'Recovery system encountered an error'
      };
    }
  }

  /**
   * Initialize default recovery strategies
   */
  private initializeDefaultStrategies(): void {
    // Network Error Recovery
    this.strategies.set('network_retry', {
      id: 'network_retry',
      name: 'Network Retry with Exponential Backoff',
      priority: 1,
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return error.message.includes('fetch') || 
               error.message.includes('network') ||
               error.message.includes('timeout') ||
               context.networkStatus === 'offline';
      },
      execute: async (error, context) => {
        const maxRetries = 3;
        const baseDelay = 1000;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          if (context.retryCount >= maxRetries) {
            break;
          }
          
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          try {
            // Check if network is back online
            if (navigator.onLine) {
              return {
                success: true,
                strategy: 'network_retry',
                recoveryTime: 0,
                message: 'Network connection restored',
                shouldRetry: true
              };
            }
          } catch {
            // Continue to next attempt
          }
        }
        
        return {
          success: false,
          strategy: 'network_retry',
          recoveryTime: 0,
          message: 'Network retry failed'
        };
      }
    });
    
    // Data Validation Strategy
    this.strategies.set('data_validation', {
      id: 'data_validation',
      name: 'Data Validation',
      priority: 1, // High priority
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return error.message.includes('invalid data') ||
               error.message.includes('validation') ||
               error.message.includes('schema') ||
               error.message.includes('undefined') ||
               error.message.includes('null') ||
               error.message.includes('type') ||
               error.message.includes('expected');
      },
      execute: async (error, context) => {
        try {
          // Get smart fallback data for the component
          const fallbackData = offlineDataManager.getSmartFallback(context.component);
          
          if (fallbackData) {
            console.log(`🔧 [ErrorRecovery] Using smart fallback data for ${context.component} due to data validation error`);
            
            return {
              success: true,
              strategy: 'data_validation',
              recoveryTime: 0,
              fallbackData,
              message: 'Using validated fallback data structure'
            };
          }
          
          return {
            success: false,
            strategy: 'data_validation',
            recoveryTime: 0,
            message: 'No fallback data available for validation'
          };
        } catch (validationError) {
          console.error('Data validation recovery failed:', validationError);
          return {
            success: false,
            strategy: 'data_validation',
            recoveryTime: 0,
            message: 'Data validation recovery failed'
          };
        }
      }
    });

    // Cache Fallback Strategy
    this.strategies.set('cache_fallback', {
      id: 'cache_fallback',
      name: 'Cache Fallback',
      priority: 2,
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return context.networkStatus === 'offline' || 
               error.message.includes('fetch') ||
               error.message.includes('API');
      },
      execute: async (error, context) => {
        try {
          const cacheKey = `${context.component}_${context.operation}`;
          const cachedData = offlineDataManager.getCachedData(cacheKey);
          
          if (cachedData) {
            return {
              success: true,
              strategy: 'cache_fallback',
              recoveryTime: 0,
              fallbackData: cachedData,
              message: 'Using cached data'
            };
          }
          
          // Try to get smart fallback
          const smartFallback = offlineDataManager.getSmartFallback(context.component);
          if (smartFallback) {
            return {
              success: true,
              strategy: 'cache_fallback',
              recoveryTime: 0,
              fallbackData: smartFallback,
              message: 'Using smart fallback data'
            };
          }
          
          return {
            success: false,
            strategy: 'cache_fallback',
            recoveryTime: 0,
            message: 'No cached data available'
          };
        } catch (cacheError) {
          return {
            success: false,
            strategy: 'cache_fallback',
            recoveryTime: 0,
            message: 'Cache access failed'
          };
        }
      }
    });

    // Component Restart Strategy
    this.strategies.set('component_restart', {
      id: 'component_restart',
      name: 'Component Restart',
      priority: 3,
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return error.message.includes('Component') ||
               error.message.includes('render') ||
               error.message.includes('hook');
      },
      execute: async (error, context) => {
        try {
          // Trigger component remount by clearing component-specific cache
          const componentCachePattern = `^${context.component}`;
          await offlineDataManager.clearCache(componentCachePattern);
          
          return {
            success: true,
            strategy: 'component_restart',
            recoveryTime: 0,
            message: 'Component cache cleared for restart',
            shouldRetry: true,
            retryDelay: 100
          };
        } catch {
          return {
            success: false,
            strategy: 'component_restart',
            recoveryTime: 0,
            message: 'Component restart failed'
          };
        }
      }
    });

    // Permission Recovery Strategy
    this.strategies.set('permission_recovery', {
      id: 'permission_recovery',
      name: 'Permission Recovery',
      priority: 4,
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return error.message.includes('permission') ||
               error.message.includes('denied') ||
               error.message.includes('NotAllowedError');
      },
      execute: async (error, context) => {
        try {
          // For camera/microphone permissions
          if (error.message.includes('camera') || error.message.includes('microphone')) {
            return {
              success: true,
              strategy: 'permission_recovery',
              recoveryTime: 0,
              message: 'Permission denied - user intervention required',
              fallbackData: {
                permissionDenied: true,
                errorType: 'permission',
                component: context.component
              }
            };
          }
          
          // For location permissions
          if (error.message.includes('location') || error.message.includes('geolocation')) {
            return {
              success: true,
              strategy: 'permission_recovery',
              recoveryTime: 0,
              message: 'Location permission denied - fallback to manual entry',
              fallbackData: {
                permissionDenied: true,
                errorType: 'location',
                component: context.component
              }
            };
          }
          
          return {
            success: false,
            strategy: 'permission_recovery',
            recoveryTime: 0,
            message: 'Unknown permission error'
          };
        } catch {
          return {
            success: false,
            strategy: 'permission_recovery',
            recoveryTime: 0,
            message: 'Permission recovery failed'
          };
        }
      }
    });

    // Data Validation Recovery
    this.strategies.set('data_validation', {
      id: 'data_validation',
      name: 'Data Validation Recovery',
      priority: 5,
      successCount: 0,
      failureCount: 0,
      averageRecoveryTime: 0,
      conditions: (error, context) => {
        return error.message.includes('validation') ||
               error.message.includes('schema') ||
               error.message.includes('parse') ||
               error.message.includes('JSON');
      },
      execute: async (error, context) => {
        try {
          // Provide default/safe data structure
          const defaultData = this.getDefaultDataForComponent(context.component);
          
          if (defaultData) {
            return {
              success: true,
              strategy: 'data_validation',
              recoveryTime: 0,
              fallbackData: defaultData,
              message: 'Using default data structure'
            };
          }
          
          return {
            success: false,
            strategy: 'data_validation',
            recoveryTime: 0,
            message: 'No default data available'
          };
        } catch {
          return {
            success: false,
            strategy: 'data_validation',
            recoveryTime: 0,
            message: 'Data validation recovery failed'
          };
        }
      }
    });
  }

  /**
   * Update error patterns for learning
   */
  private async updateErrorPattern(error: Error, context: ErrorContext): Promise<void> {
    const patternId = `${context.component}_${error.name}`;
    const existing = this.patterns.get(patternId);
    
    if (existing) {
      existing.frequency++;
      existing.lastOccurrence = new Date();
    } else {
      const newPattern: ErrorPattern = {
        id: patternId,
        errorType: error.name,
        component: context.component,
        pattern: new RegExp(error.message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        frequency: 1,
        lastOccurrence: new Date(),
        recoveryStrategies: [],
        successRate: 0
      };
      
      this.patterns.set(patternId, newPattern);
    }
    
    // Persist patterns
    await this.savePatternsToStorage();
  }

  /**
   * Find applicable recovery strategies
   */
  private findApplicableStrategies(error: Error, context: ErrorContext): RecoveryStrategy[] {
    const applicable = Array.from(this.strategies.values())
      .filter(strategy => strategy.conditions(error, context))
      .sort((a, b) => {
        // Sort by priority first, then by success rate
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        
        const aSuccessRate = a.successCount / (a.successCount + a.failureCount) || 0;
        const bSuccessRate = b.successCount / (b.successCount + b.failureCount) || 0;
        
        return bSuccessRate - aSuccessRate;
      });
    
    return applicable;
  }

  /**
   * Record successful recovery for learning
   */
  private recordRecovery(error: Error, context: ErrorContext, result: RecoveryResult): void {
    this.recoveryHistory.push({
      error,
      context,
      result,
      timestamp: new Date()
    });
    
    // Keep only last 100 records
    if (this.recoveryHistory.length > 100) {
      this.recoveryHistory.shift();
    }
    
    // Update pattern success rate
    const patternId = `${context.component}_${error.name}`;
    const pattern = this.patterns.get(patternId);
    if (pattern) {
      const successes = this.recoveryHistory.filter(h => 
        h.context.component === context.component && 
        h.error.name === error.name && 
        h.result.success
      ).length;
      
      const total = this.recoveryHistory.filter(h => 
        h.context.component === context.component && 
        h.error.name === error.name
      ).length;
      
      pattern.successRate = total > 0 ? successes / total : 0;
    }
  }

  /**
   * Get default data for component
   */
  private getDefaultDataForComponent(component: string): any {
    // Use the offlineDataManager's getSmartFallback for consistency
    return offlineDataManager.getSmartFallback(component);
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalRecoveries: number;
    successRate: number;
    averageRecoveryTime: number;
    topStrategies: Array<{ name: string; successRate: number; usage: number }>;
    commonErrors: Array<{ component: string; errorType: string; frequency: number }>;
  } {
    const totalRecoveries = this.recoveryHistory.length;
    const successes = this.recoveryHistory.filter(h => h.result.success).length;
    const successRate = totalRecoveries > 0 ? successes / totalRecoveries : 0;
    
    const totalRecoveryTime = this.recoveryHistory
      .filter(h => h.result.success)
      .reduce((sum, h) => sum + h.result.recoveryTime, 0);
    const averageRecoveryTime = successes > 0 ? totalRecoveryTime / successes : 0;
    
    const strategyStats = Array.from(this.strategies.values()).map(strategy => ({
      name: strategy.name,
      successRate: strategy.successCount / (strategy.successCount + strategy.failureCount) || 0,
      usage: strategy.successCount + strategy.failureCount
    })).sort((a, b) => b.successRate - a.successRate);
    
    const errorStats = Array.from(this.patterns.values()).map(pattern => ({
      component: pattern.component,
      errorType: pattern.errorType,
      frequency: pattern.frequency
    })).sort((a, b) => b.frequency - a.frequency);
    
    return {
      totalRecoveries,
      successRate,
      averageRecoveryTime,
      topStrategies: strategyStats.slice(0, 5),
      commonErrors: errorStats.slice(0, 10)
    };
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  /**
   * Remove recovery strategy
   */
  removeRecoveryStrategy(strategyId: string): void {
    this.strategies.delete(strategyId);
  }

  /**
   * Clear recovery history
   */
  clearHistory(): void {
    this.recoveryHistory = [];
    this.patterns.clear();
  }

  /**
   * Save patterns to storage
   */
  private async savePatternsToStorage(): Promise<void> {
    try {
      const patternsData = Array.from(this.patterns.entries()).map(([key, pattern]) => [
        key,
        {
          ...pattern,
          pattern: pattern.pattern.source // Convert RegExp to string
        }
      ]);
      
      localStorage.setItem('cropgenius_error_patterns', JSON.stringify(patternsData));
    } catch (error) {
      console.warn('Failed to save error patterns:', error);
    }
  }

  /**
   * Load patterns from storage
   */
  private async loadPatternsFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('cropgenius_error_patterns');
      if (stored) {
        const patternsData = JSON.parse(stored);
        
        for (const [key, patternData] of patternsData) {
          this.patterns.set(key, {
            ...patternData,
            pattern: new RegExp(patternData.pattern), // Convert string back to RegExp
            lastOccurrence: new Date(patternData.lastOccurrence)
          });
        }
        
        console.log(`🔧 [ErrorRecovery] Loaded ${patternsData.length} error patterns`);
      }
    } catch (error) {
      console.warn('Failed to load error patterns:', error);
    }
  }
}

// Export singleton instance
export const errorRecoverySystem = ErrorRecoverySystem.getInstance();

// Convenience function for error recovery
export const recoverFromError = (error: Error, context: Partial<ErrorContext>) => {
  const fullContext: ErrorContext = {
    component: 'Unknown',
    operation: 'unknown',
    timestamp: new Date(),
    networkStatus: navigator.onLine ? 'online' : 'offline',
    retryCount: 0,
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...context
  };
  
  return errorRecoverySystem.recoverFromError(error, fullContext);
};

// Hook for React components
export const useErrorRecovery = (componentName: string) => {
  const recover = async (error: Error, operation: string = 'render', metadata?: Record<string, any>) => {
    const context: ErrorContext = {
      component: componentName,
      operation,
      timestamp: new Date(),
      networkStatus: navigator.onLine ? 'online' : 'offline',
      retryCount: 0,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata
    };
    
    const result = await errorRecoverySystem.recoverFromError(error, context);
    
    // Show user-friendly toast based on result
    if (result.success) {
      if (result.fallbackData) {
        toast.info('Recovered with cached data', {
          description: result.message
        });
      } else {
        toast.success('Recovered successfully', {
          description: result.message
        });
      }
    } else {
      toast.error('Recovery failed', {
        description: result.message
      });
    }
    
    return result;
  };
  
  const getStats = () => errorRecoverySystem.getRecoveryStats();
  
  return { recover, getStats };
};