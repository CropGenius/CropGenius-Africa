import { withRetry, withRetryAndCache, retryManager } from '../retryManager';

// Mock timers
jest.useFakeTimers();

describe('RetryManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  
  describe('withRetry', () => {
    test('returns result when operation succeeds on first try', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    test('retries operation when it fails', async () => {
      const error = new Error('Test error');
      const operation = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');
      
      const result = await withRetry(operation, { maxRetries: 3 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
    
    test('throws error when max retries exceeded', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);
      const onRetry = jest.fn();
      
      await expect(withRetry(operation, { 
        maxRetries: 3,
        baseDelay: 100,
        onRetry
      })).rejects.toThrow('Test error');
      
      expect(operation).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(onRetry).toHaveBeenCalledTimes(3);
    });
    
    test('applies exponential backoff', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);
      const onRetry = jest.fn();
      
      try {
        await withRetry(operation, { 
          maxRetries: 3,
          baseDelay: 100,
          onRetry
        });
      } catch (e) {
        // Expected to throw
      }
      
      // Check that setTimeout was called with increasing delays
      expect(setTimeout).toHaveBeenCalledTimes(3);
      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 100);
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 200);
      expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 400);
    });
    
    test('respects maxDelay option', async () => {
      const error = new Error('Test error');
      const operation = jest.fn().mockRejectedValue(error);
      
      try {
        await withRetry(operation, { 
          maxRetries: 3,
          baseDelay: 100,
          maxDelay: 150
        });
      } catch (e) {
        // Expected to throw
      }
      
      // Check that setTimeout was called with capped delays
      expect(setTimeout).toHaveBeenCalledTimes(3);
      expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 100);
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 150);
      expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 150);
    });
    
    test('respects retryCondition option', async () => {
      const retriableError = new Error('Retriable');
      const nonRetriableError = new Error('Non-retriable');
      
      const operation = jest.fn()
        .mockRejectedValueOnce(retriableError)
        .mockRejectedValueOnce(nonRetriableError);
      
      const retryCondition = jest.fn().mockImplementation(
        (error) => error.message === 'Retriable'
      );
      
      await expect(withRetry(operation, { 
        maxRetries: 3,
        retryCondition
      })).rejects.toThrow('Non-retriable');
      
      expect(operation).toHaveBeenCalledTimes(2); // Initial + 1 retry
      expect(retryCondition).toHaveBeenCalledTimes(2);
      expect(retryCondition).toHaveBeenNthCalledWith(1, retriableError);
      expect(retryCondition).toHaveBeenNthCalledWith(2, nonRetriableError);
    });
  });
  
  describe('withRetryAndCache', () => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        },
        removeItem: (key: string) => {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    beforeEach(() => {
      localStorageMock.clear();
    });
    
    test('returns cached result when available', async () => {
      const operation = jest.fn().mockResolvedValue('fresh data');
      const cacheKey = 'test-cache-key';
      
      // Set up cache
      localStorage.setItem(`cropgenius_cache_${cacheKey}`, JSON.stringify({
        data: 'cached data',
        timestamp: Date.now(),
        ttl: 60000
      }));
      
      const result = await withRetryAndCache(cacheKey, operation);
      
      expect(result).toBe('cached data');
      expect(operation).not.toHaveBeenCalled();
    });
    
    test('calls operation when cache is expired', async () => {
      const operation = jest.fn().mockResolvedValue('fresh data');
      const cacheKey = 'test-cache-key';
      
      // Set up expired cache
      localStorage.setItem(`cropgenius_cache_${cacheKey}`, JSON.stringify({
        data: 'cached data',
        timestamp: Date.now() - 120000, // 2 minutes ago
        ttl: 60000 // 1 minute TTL
      }));
      
      const result = await withRetryAndCache(cacheKey, operation);
      
      expect(result).toBe('fresh data');
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    test('caches operation result', async () => {
      const operation = jest.fn().mockResolvedValue('fresh data');
      const cacheKey = 'test-cache-key';
      
      await withRetryAndCache(cacheKey, operation, {}, 60000);
      
      const cachedData = JSON.parse(localStorage.getItem(`cropgenius_cache_${cacheKey}`) || '{}');
      expect(cachedData.data).toBe('fresh data');
      expect(cachedData.ttl).toBe(60000);
    });
    
    test('retries operation when it fails', async () => {
      const error = new Error('Test error');
      const operation = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');
      const cacheKey = 'test-cache-key';
      
      const result = await withRetryAndCache(cacheKey, operation, { maxRetries: 3 });
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('retryManager', () => {
    test('tracks circuit breaker status', () => {
      const circuitKey = 'test-circuit';
      
      // Initially closed
      expect(retryManager.isCircuitOpen(circuitKey)).toBe(false);
      
      // Open circuit
      retryManager.openCircuit(circuitKey);
      expect(retryManager.isCircuitOpen(circuitKey)).toBe(true);
      
      // Close circuit
      retryManager.closeCircuit(circuitKey);
      expect(retryManager.isCircuitOpen(circuitKey)).toBe(false);
    });
    
    test('tracks metrics', () => {
      const operationKey = 'test-operation';
      
      // Record success
      retryManager.recordSuccess(operationKey, 100);
      
      // Record failure
      retryManager.recordFailure(operationKey, new Error('Test error'));
      
      // Get metrics
      const metrics = retryManager.getMetrics(operationKey);
      
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.successCount).toBe(1);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.averageResponseTime).toBe(100);
      expect(metrics.lastError).toBeInstanceOf(Error);
      expect(metrics.lastError?.message).toBe('Test error');
    });
  });
});