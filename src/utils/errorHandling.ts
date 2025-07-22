/**
 * 🔥 CROPGENIUS ERROR HANDLING SYSTEM
 * Comprehensive error handling utilities for API calls, async operations, and UI components
 */

import { toast } from 'sonner';
import { errorLogger } from '@/services/errorLogger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Error categories
 */
export enum ErrorCategory {
  API = 'api',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  NETWORK = 'network',
  VALIDATION = 'validation',
  COMPONENT = 'component',
  UNKNOWN = 'unknown'
}

/**
 * Error context metadata
 */
export interface ErrorContext {
  component?: string;
  operation?: string;
  endpoint?: string;
  params?: Record<string, any>;
  userId?: string;
  [key: string]: any;
}

/**
 * Result type for wrapped operations
 */
export type Result<T> = 
  | { success: true; data: T; }
  | { success: false; error: ErrorDetails; };

/**
 * Error details
 */
export interface ErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  context?: ErrorContext;
  originalError?: Error;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffFactor: number;
  retryableCategories: ErrorCategory[];
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffFactor: 1.5,
  retryableCategories: [ErrorCategory.NETWORK, ErrorCategory.API]
};

/**
 * Categorize an error based on its properties
 */
export function categorizeError(error: any): ErrorCategory {
  if (!error) return ErrorCategory.UNKNOWN;
  
  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('network') || !navigator.onLine) {
    return ErrorCategory.NETWORK;
  }
  
  // Supabase errors
  if (error.code?.startsWith('PGRST') || error.message?.includes('supabase')) {
    return ErrorCategory.DATABASE;
  }
  
  // Authentication errors
  if (
    error.code?.includes('auth') || 
    error.message?.includes('auth') || 
    error.message?.includes('permission') || 
    error.message?.includes('unauthorized')
  ) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // API errors
  if (error.status || error.statusCode || error.response) {
    return ErrorCategory.API;
  }
  
  // Validation errors
  if (error.name === 'ValidationError' || error.message?.includes('validation')) {
    return ErrorCategory.VALIDATION;
  }
  
  // Component errors
  if (error.componentStack) {
    return ErrorCategory.COMPONENT;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Determine if an error is recoverable
 */
export function isRecoverableError(error: any): boolean {
  const category = categorizeError(error);
  
  // Network errors are generally recoverable
  if (category === ErrorCategory.NETWORK) return true;
  
  // Temporary API errors might be recoverable
  if (category === ErrorCategory.API) {
    const status = error.status || error.statusCode || (error.response?.status);
    // 5xx errors are server errors and might be temporary
    // 429 is too many requests, can retry after a delay
    return status >= 500 || status === 429;
  }
  
  // Most other errors are not automatically recoverable
  return false;
}

/**
 * Determine error severity based on category and details
 */
export function determineErrorSeverity(error: any, category: ErrorCategory): ErrorSeverity {
  // Critical errors
  if (category === ErrorCategory.AUTHENTICATION) {
    return ErrorSeverity.HIGH;
  }
  
  if (category === ErrorCategory.DATABASE) {
    return ErrorSeverity.HIGH;
  }
  
  // High severity for non-recoverable API errors
  if (category === ErrorCategory.API && !isRecoverableError(error)) {
    return ErrorSeverity.HIGH;
  }
  
  // Medium severity for recoverable errors
  if (isRecoverableError(error)) {
    return ErrorSeverity.MEDIUM;
  }
  
  // Default to medium
  return ErrorSeverity.MEDIUM;
}

/**
 * Create standardized error details
 */
export function createErrorDetails(error: any, context?: ErrorContext): ErrorDetails {
  const category = categorizeError(error);
  const severity = determineErrorSeverity(error, category);
  const recoverable = isRecoverableError(error);
  
  return {
    message: error.message || 'An unknown error occurred',
    code: error.code || error.status?.toString() || undefined,
    severity,
    category,
    recoverable,
    context,
    originalError: error instanceof Error ? error : new Error(error.message || 'Unknown error')
  };
}

/**
 * Wrap an async operation with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  showToast: boolean = true
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error: any) {
    const errorDetails = createErrorDetails(error, context);
    
    // Log the error
    errorLogger.logError(errorDetails.originalError!, {
      ...context,
      severity: errorDetails.severity,
      category: errorDetails.category,
      recoverable: errorDetails.recoverable
    });
    
    // Show toast if enabled
    if (showToast) {
      toast.error('Operation Failed', {
        description: errorDetails.message,
        action: errorDetails.recoverable ? {
          label: 'Retry',
          onClick: () => withErrorHandling(operation, context, showToast)
        } : undefined
      });
    }
    
    return { success: false, error: errorDetails };
  }
}

/**
 * Wrap an async operation with automatic retry for recoverable errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
  retryConfig: Partial<RetryConfig> = {}
): Promise<Result<T>> {
  const config = { ...defaultRetryConfig, ...retryConfig };
  let lastError: any;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error: any) {
      lastError = error;
      const errorDetails = createErrorDetails(error, context);
      
      // Don't retry if error is not recoverable or we've exhausted retries
      if (!errorDetails.recoverable || attempt === config.maxRetries) {
        break;
      }
      
      // Don't retry if error category is not in retryable list
      if (!config.retryableCategories.includes(errorDetails.category)) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = config.delayMs * Math.pow(config.backoffFactor, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  const errorDetails = createErrorDetails(lastError, context);
  errorLogger.logError(errorDetails.originalError!, {
    ...context,
    retryAttempts: config.maxRetries,
    severity: errorDetails.severity,
    category: errorDetails.category
  });
  
  return { success: false, error: errorDetails };
}

/**
 * Create a safe async function that never throws
 */
export function makeSafe<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) {
  return async (...args: T): Promise<Result<R>> => {
    return withErrorHandling(() => fn(...args), context);
  };
}

/**
 * Error boundary hook for functional components
 */
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: ErrorContext) => {
      const errorDetails = createErrorDetails(error, context);
      errorLogger.logError(error, context);
      
      toast.error('Error', {
        description: errorDetails.message
      });
    },
    
    withErrorHandling,
    withRetry,
    makeSafe
  };
}