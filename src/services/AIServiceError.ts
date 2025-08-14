/**
 * 🔥 PRODUCTION-READY AI ERROR HANDLING SYSTEM 🔥
 * Bulletproof error management for 100 million African farmers
 */

export type AIErrorCode = 
  | 'AUTHENTICATION_FAILED'
  | 'AI_SERVICE_UNAVAILABLE' 
  | 'NETWORK_ERROR'
  | 'INVALID_FIELD_DATA'
  | 'GEMINI_API_ERROR'
  | 'SATELLITE_DATA_ERROR'
  | 'WEATHER_DATA_ERROR'
  | 'DATABASE_ERROR'
  | 'PARSING_ERROR'
  | 'RATE_LIMIT_EXCEEDED';

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: AIErrorCode,
    public retryable: boolean = false,
    public retryAfter?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AIServiceError';
  }

  static fromResponse(error: any): AIServiceError {
    if (!error) {
      return new AIServiceError('Unknown AI service error', 'AI_SERVICE_UNAVAILABLE', true);
    }

    // Handle Supabase function errors
    if (error.message?.includes('authentication') || error.message?.includes('auth')) {
      return new AIServiceError(
        'Please log in to access AI insights', 
        'AUTHENTICATION_FAILED', 
        false
      );
    }

    if (error.message?.includes('timeout') || error.message?.includes('network')) {
      return new AIServiceError(
        'Network connection issue. Please check your internet connection.', 
        'NETWORK_ERROR', 
        true,
        5000 // Retry after 5 seconds
      );
    }

    if (error.message?.includes('field not found') || error.code === 'FIELD_NOT_FOUND') {
      return new AIServiceError(
        'Field data not found. Please refresh and try again.', 
        'INVALID_FIELD_DATA', 
        false
      );
    }

    if (error.message?.includes('Gemini') || error.code === 'GEMINI_API_ERROR') {
      return new AIServiceError(
        'AI analysis engine temporarily unavailable. Please try again.', 
        'GEMINI_API_ERROR', 
        true,
        10000 // Retry after 10 seconds
      );
    }

    if (error.message?.includes('rate limit') || error.code === 'RATE_LIMIT_EXCEEDED') {
      return new AIServiceError(
        'Too many requests. Please wait a moment before trying again.', 
        'RATE_LIMIT_EXCEEDED', 
        true,
        30000 // Retry after 30 seconds
      );
    }

    if (error.message?.includes('satellite') || error.code === 'SATELLITE_DATA_ERROR') {
      return new AIServiceError(
        'Satellite data temporarily unavailable. Analysis will continue with available data.', 
        'SATELLITE_DATA_ERROR', 
        true,
        15000
      );
    }

    if (error.message?.includes('database') || error.code === 'DATABASE_ERROR') {
      return new AIServiceError(
        'Database connection issue. Your analysis may not be saved.', 
        'DATABASE_ERROR', 
        true,
        5000
      );
    }

    // Default error
    return new AIServiceError(
      'AI service temporarily unavailable. Please try again in a few moments.', 
      'AI_SERVICE_UNAVAILABLE', 
      true,
      10000,
      error
    );
  }

  getRetryDelay(): number {
    return this.retryAfter || 5000;
  }

  getUserFriendlyMessage(): string {
    switch (this.code) {
      case 'AUTHENTICATION_FAILED':
        return 'Please log in to access AI field analysis.';
      case 'NETWORK_ERROR':
        return 'Connection issue. Check your internet and try again.';
      case 'INVALID_FIELD_DATA':
        return 'Field information is incomplete. Please update your field details.';
      case 'GEMINI_API_ERROR':
        return 'AI analysis engine is busy. Please try again in a moment.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait 30 seconds before trying again.';
      case 'SATELLITE_DATA_ERROR':
        return 'Satellite imagery temporarily unavailable. Analysis will use available data.';
      case 'DATABASE_ERROR':
        return 'Data storage issue. Your analysis may not be saved automatically.';
      default:
        return 'AI service temporarily unavailable. Please try again.';
    }
  }

  getActionableAdvice(): string {
    switch (this.code) {
      case 'AUTHENTICATION_FAILED':
        return 'Click the login button to authenticate your account.';
      case 'NETWORK_ERROR':
        return 'Check your internet connection and try refreshing the page.';
      case 'INVALID_FIELD_DATA':
        return 'Update your field information with complete details.';
      case 'GEMINI_API_ERROR':
        return 'The AI is processing many requests. Try again in 10 seconds.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Wait 30 seconds, then click "Refresh AI Analysis" to try again.';
      case 'SATELLITE_DATA_ERROR':
        return 'Satellite data will be included when available. Analysis continues.';
      case 'DATABASE_ERROR':
        return 'Your analysis results may not be saved. Consider taking a screenshot.';
      default:
        return 'Wait a moment and click "Refresh AI Analysis" to try again.';
    }
  }
}

/**
 * Retry mechanism for AI service calls
 */
export class AIRetryManager {
  private retryAttempts = new Map<string, number>();
  private lastRetryTime = new Map<string, number>();

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(operationId);
      this.lastRetryTime.delete(operationId);
      return result;
    } catch (error) {
      const aiError = error instanceof AIServiceError ? error : AIServiceError.fromResponse(error);
      
      if (!aiError.retryable || attempts >= maxRetries) {
        throw aiError;
      }

      // Check if we should respect retry delay
      const lastRetry = this.lastRetryTime.get(operationId) || 0;
      const timeSinceLastRetry = Date.now() - lastRetry;
      const requiredDelay = aiError.getRetryDelay();
      
      if (timeSinceLastRetry < requiredDelay) {
        const waitTime = requiredDelay - timeSinceLastRetry;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Update retry tracking
      this.retryAttempts.set(operationId, attempts + 1);
      this.lastRetryTime.set(operationId, Date.now());

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempts);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the operation
      return this.executeWithRetry(operation, operationId, maxRetries, baseDelay);
    }
  }

  getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }

  canRetry(operationId: string, maxRetries: number = 3): boolean {
    return this.getRetryCount(operationId) < maxRetries;
  }

  reset(operationId?: string): void {
    if (operationId) {
      this.retryAttempts.delete(operationId);
      this.lastRetryTime.delete(operationId);
    } else {
      this.retryAttempts.clear();
      this.lastRetryTime.clear();
    }
  }
}

// Global retry manager instance
export const aiRetryManager = new AIRetryManager();