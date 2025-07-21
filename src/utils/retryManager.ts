/**
 * 🚀 INFINITY IQ RETRY MANAGER
 * -------------------------------------------------------------
 * PRODUCTION-READY exponential backoff with circuit breaker
 * - Intelligent retry logic with jitter
 * - Circuit breaker pattern for persistent failures
 * - Request deduplication and caching
 * - Comprehensive error categorization
 * - Performance monitoring and metrics
 */

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onSuccess?: (attempt: number, result: any) => void;
  onFailure?: (error: any, attempts: number) => void;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastFailureTime: number;
  consecutiveFailures: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastFailureTime: 0,
    consecutiveFailures: 0
  };

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker is OPEN. Next attempt in ${Math.ceil((this.nextAttemptTime - Date.now()) / 1000)}s`);
      }
      this.state = CircuitState.HALF_OPEN;
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const result = await operation();
      this.onSuccess(Date.now() - startTime);
      return result;
    } catch (error) {
      this.onFailure(Date.now() - startTime);
      throw error;
    }
  }

  private onSuccess(responseTime: number): void {
    this.failureCount = 0;
    this.metrics.successfulRequests++;
    this.metrics.consecutiveFailures = 0;
    this.updateAverageResponseTime(responseTime);
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      console.log('🔄 [CircuitBreaker] State changed to CLOSED');
    }
  }

  private onFailure(responseTime: number): void {
    this.failureCount++;
    this.metrics.failedRequests++;
    this.metrics.consecutiveFailures++;
    this.metrics.lastFailureTime = Date.now();
    this.lastFailureTime = Date.now();
    this.updateAverageResponseTime(responseTime);

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
      console.warn('⚠️ [CircuitBreaker] State changed to OPEN due to failures');
    }
  }

  private updateAverageResponseTime(responseTime: number): void {
    const total = this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      ((this.metrics.averageResponseTime * (total - 1)) + responseTime) / total;
  }

  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }
}

export class RetryManager {
  private static instance: RetryManager;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private requestCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  /**
   * Execute operation with exponential backoff retry
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    circuitBreakerKey?: string
  ): Promise<T> {
    const finalConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryCondition: this.defaultRetryCondition,
      ...config
    };

    let lastError: any;
    let attempt = 0;

    // Use circuit breaker if key provided
    const circuitBreaker = circuitBreakerKey ? 
      this.getOrCreateCircuitBreaker(circuitBreakerKey) : null;

    while (attempt <= finalConfig.maxRetries) {
      try {
        const executeOperation = async () => {
          if (circuitBreaker) {
            return await circuitBreaker.execute(operation);
          }
          return await operation();
        };

        const result = await executeOperation();
        
        if (finalConfig.onSuccess) {
          finalConfig.onSuccess(attempt, result);
        }

        if (attempt > 0) {
          console.log(`✅ [RetryManager] Operation succeeded after ${attempt} retries`);
        }

        return result;
      } catch (error) {
        lastError = error;
        attempt++;

        // Check if we should retry this error
        if (!finalConfig.retryCondition!(error) || attempt > finalConfig.maxRetries) {
          break;
        }

        const delay = this.calculateDelay(attempt, finalConfig);
        
        if (finalConfig.onRetry) {
          finalConfig.onRetry(attempt, error);
        }

        console.warn(`🔄 [RetryManager] Attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
        
        await this.sleep(delay);
      }
    }

    if (finalConfig.onFailure) {
      finalConfig.onFailure(lastError, attempt);
    }

    console.error(`❌ [RetryManager] Operation failed after ${attempt} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Execute with caching and deduplication
   */
  async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.requestCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      console.log(`📦 [RetryManager] Cache hit for key: ${key}`);
      return cached.result;
    }

    // Execute operation
    const result = await operation();
    
    // Cache result
    this.requestCache.set(key, {
      result,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    this.cleanupCache();

    return result;
  }

  /**
   * Execute with both retry and caching
   */
  async withRetryAndCache<T>(
    key: string,
    operation: () => Promise<T>,
    retryConfig: Partial<RetryConfig> = {},
    cacheTtl: number = this.CACHE_TTL,
    circuitBreakerKey?: string
  ): Promise<T> {
    return this.withCache(
      key,
      () => this.withRetry(operation, retryConfig, circuitBreakerKey),
      cacheTtl
    );
  }

  /**
   * Get circuit breaker metrics
   */
  getCircuitBreakerMetrics(key: string): RequestMetrics | null {
    const circuitBreaker = this.circuitBreakers.get(key);
    return circuitBreaker ? circuitBreaker.getMetrics() : null;
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(key: string): void {
    const circuitBreaker = this.circuitBreakers.get(key);
    if (circuitBreaker) {
      circuitBreaker.reset();
      console.log(`🔄 [RetryManager] Circuit breaker reset for key: ${key}`);
    }
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, RequestMetrics> {
    const metrics: Record<string, RequestMetrics> = {};
    this.circuitBreakers.forEach((breaker, key) => {
      metrics[key] = breaker.getMetrics();
    });
    return metrics;
  }

  private getOrCreateCircuitBreaker(key: string): CircuitBreaker {
    if (!this.circuitBreakers.has(key)) {
      const config: CircuitBreakerConfig = {
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 300000 // 5 minutes
      };
      this.circuitBreakers.set(key, new CircuitBreaker(config));
    }
    return this.circuitBreakers.get(key)!;
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Apply jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.min(delay, config.maxDelay);
  }

  private defaultRetryCondition(error: any): boolean {
    // Don't retry client errors (4xx) except for specific cases
    if (error.status >= 400 && error.status < 500) {
      // Retry on rate limiting and timeout
      return error.status === 429 || error.status === 408;
    }
    
    // Retry on server errors (5xx)
    if (error.status >= 500) {
      return true;
    }
    
    // Retry on network errors
    if (error.name === 'NetworkError' || 
        error.message?.includes('fetch') ||
        error.message?.includes('network') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT') {
      return true;
    }
    
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL * 2) {
        this.requestCache.delete(key);
      }
    }
  }

  /**
   * Clear all caches and reset circuit breakers
   */
  reset(): void {
    this.requestCache.clear();
    this.circuitBreakers.forEach(breaker => breaker.reset());
    console.log('🔄 [RetryManager] All caches and circuit breakers reset');
  }
}

// Export singleton instance
export const retryManager = RetryManager.getInstance();

// Convenience functions
export const withRetry = <T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>,
  circuitBreakerKey?: string
) => retryManager.withRetry(operation, config, circuitBreakerKey);

export const withCache = <T>(
  key: string,
  operation: () => Promise<T>,
  ttl?: number
) => retryManager.withCache(key, operation, ttl);

export const withRetryAndCache = <T>(
  key: string,
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>,
  cacheTtl?: number,
  circuitBreakerKey?: string
) => retryManager.withRetryAndCache(key, operation, retryConfig, cacheTtl, circuitBreakerKey);