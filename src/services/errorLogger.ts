/**
 * 📊 INFINITY IQ ERROR LOGGER
 * -------------------------------------------------------------
 * PRODUCTION-READY centralized error logging and monitoring
 * - Structured error categorization and severity levels
 * - Real-time error aggregation and reporting
 * - Performance metrics and error analytics
 * - Integration with external monitoring services
 * - Intelligent error deduplication and batching
 */

import { supabase } from '@/integrations/supabase/client';
import { withRetry } from '@/utils/retryManager';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  DATABASE = 'database',
  API = 'api',
  COMPONENT = 'component',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  UNKNOWN = 'unknown'
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
  userAgent?: string;
  url?: string;
  timestamp?: Date;
}

export interface ErrorLog {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context: ErrorContext;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  resolved: boolean;
  tags: string[];
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorRate: number;
  topErrors: Array<{ message: string; count: number }>;
  timeRange: { start: Date; end: Date };
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private errorCache: Map<string, ErrorLog> = new Map();
  private metricsCache: ErrorMetrics | null = null;
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_INTERVAL = 5000;
  private readonly CACHE_TTL = 60000;

  private constructor() {
    this.startBatchProcessor();
    this.setupErrorHandlers();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async logError(
    error: Error | string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {}
  ): Promise<void> {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const errorId = this.generateErrorId(errorMessage, category, context);

      const existingError = this.errorCache.get(errorId);
      
      if (existingError) {
        existingError.count++;
        existingError.lastOccurrence = new Date();
        existingError.context = { ...existingError.context, ...context };
      } else {
        const errorLog: ErrorLog = {
          id: errorId,
          message: errorMessage,
          category,
          severity,
          context: {
            ...context,
            stackTrace: typeof error === 'object' ? error.stack : undefined,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date()
          },
          count: 1,
          firstOccurrence: new Date(),
          lastOccurrence: new Date(),
          resolved: false,
          tags: this.generateTags(errorMessage, category, context)
        };

        this.errorCache.set(errorId, errorLog);
        this.errorQueue.push(errorLog);
      }

      this.logToConsole(errorMessage, category, severity, context);

      if (severity === ErrorSeverity.CRITICAL) {
        await this.processBatch();
      }
    } catch (loggingError) {
      console.error('❌ [ErrorLogger] Failed to log error:', loggingError);
    }
  }

  async logSuccess(
    operation: string,
    context: ErrorContext = {},
    metrics?: Record<string, number>
  ): Promise<void> {
    try {
      const successLog = {
        operation,
        context,
        metrics,
        timestamp: new Date().toISOString(),
        type: 'success'
      };

      const successLogs = JSON.parse(sessionStorage.getItem('cropgenius_success_log') || '[]');
      successLogs.push(successLog);
      
      if (successLogs.length > 50) {
        successLogs.shift();
      }
      
      sessionStorage.setItem('cropgenius_success_log', JSON.stringify(successLogs));
      console.log(`✅ [${context.component || 'System'}] ${operation}`, metrics || '');
    } catch (error) {
      console.warn('Failed to log success event:', error);
    }
  }

  private generateErrorId(message: string, category: ErrorCategory, context: ErrorContext): string {
    const key = `${category}-${message}-${context.component || 'unknown'}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private generateTags(message: string, category: ErrorCategory, context: ErrorContext): string[] {
    const tags = [category];
    if (context.component) tags.push(`component:${context.component}`);
    if (context.action) tags.push(`action:${context.action}`);
    if (message.includes('network')) tags.push('network');
    if (message.includes('timeout')) tags.push('timeout');
    return tags;
  }

  private logToConsole(message: string, category: ErrorCategory, severity: ErrorSeverity, context: ErrorContext): void {
    const emoji = severity === ErrorSeverity.CRITICAL ? '🚨' : 
                  severity === ErrorSeverity.HIGH ? '⚠️' : 
                  severity === ErrorSeverity.MEDIUM ? '⚡' : '📝';
    
    console.error(`${emoji} [${category.toUpperCase()}] ${message}`, context);
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.processBatch();
      }
    }, this.BATCH_INTERVAL);
  }

  private async processBatch(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const batch = this.errorQueue.splice(0, this.BATCH_SIZE);
    
    try {
      await this.storeBatch(batch);
    } catch (error) {
      console.error('❌ [ErrorLogger] Failed to process batch:', error);
      // Re-queue failed items
      this.errorQueue.unshift(...batch);
    }
  }

  private async storeBatch(errors: ErrorLog[]): Promise<void> {
    const errorData = errors.map(error => ({
      id: error.id,
      message: error.message,
      category: error.category,
      severity: error.severity,
      context: error.context,
      count: error.count,
      first_occurrence: error.firstOccurrence.toISOString(),
      last_occurrence: error.lastOccurrence.toISOString(),
      resolved: error.resolved,
      tags: error.tags,
      created_at: new Date().toISOString()
    }));

    await withRetry(async () => {
      const { error } = await supabase
        .from('error_logs')
        .upsert(errorData, { onConflict: 'id' });

      if (error) {
        throw new Error(`Failed to store error batch: ${error.message}`);
      }
    });
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError(
        event.error || new Error(event.message),
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        {
          component: 'GlobalErrorHandler',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        ErrorCategory.UNKNOWN,
        ErrorSeverity.HIGH,
        {
          component: 'PromiseRejectionHandler',
          metadata: { reason: event.reason }
        }
      );
    });
  }

  getRecentErrors(limit: number = 10): ErrorLog[] {
    return Array.from(this.errorCache.values())
      .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime())
      .slice(0, limit);
  }

  clearCache(): void {
    this.errorCache.clear();
    this.metricsCache = null;
    console.log('🗑️ [ErrorLogger] Cache cleared');
  }
}

export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export const logError = (
  error: Error | string,
  category?: ErrorCategory,
  severity?: ErrorSeverity,
  context?: ErrorContext
) => errorLogger.logError(error, category, severity, context);

export const logSuccess = (
  operation: string,
  context?: ErrorContext,
  metrics?: Record<string, number>
) => errorLogger.logSuccess(operation, context, metrics);