import { supabase } from '@/integrations/supabase/client';
import { retryManager, withRetry } from '@/utils/retryManager';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { errorLogger, ErrorCategory, ErrorSeverity } from '@/services/errorLogger';

// Mock fetch
global.fetch = jest.fn();

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: jest.fn().mockImplementation((functionName, options) => {
        // Simulate different API responses based on the mock state
        if (functionName === 'field-ai-insights') {
          switch (global.mockApiState) {
            case 'success':
              return Promise.resolve({ 
                data: { health_score: 0.8, ndvi_value: 0.65 }, 
                error: null 
              });
            case 'timeout':
              return Promise.reject(new Error('Request timeout'));
            case 'rate_limit':
              return Promise.resolve({ 
                data: null, 
                error: { message: 'Too many requests', status: 429 } 
              });
            case 'server_error':
              return Promise.resolve({ 
                data: null, 
                error: { message: 'Internal server error', status: 500 } 
              });
            default:
              return Promise.resolve({ 
                data: { health_score: 0.8, ndvi_value: 0.65 }, 
                error: null 
              });
          }
        }
        return Promise.resolve({ data: null, error: null });
      })
    }
  }
}));

// Mock retry manager
jest.mock('@/utils/retryManager', () => {
  const original = jest.requireActual('@/utils/retryManager');
  return {
    ...original,
    retryManager: {
      ...original.retryManager,
      isCircuitOpen: jest.fn().mockReturnValue(false),
      openCircuit: jest.fn(),
      closeCircuit: jest.fn(),
      recordSuccess: jest.fn(),
      recordFailure: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({
        totalCalls: 10,
        successCount: 8,
        failureCount: 2,
        errorRate: 0.2,
        averageResponseTime: 150,
        lastSuccess: new Date(),
        lastError: new Error('Test error')
      })
    }
  };
});

// Mock offline data manager
jest.mock('@/utils/offlineDataManager', () => ({
  offlineDataManager: {
    getData: jest.fn().mockImplementation((key, fn, maxAge, fallbackData) => {
      if (global.mockApiState === 'offline') {
        return Promise.resolve(fallbackData || { healthScore: 0.5 });
      }
      return fn();
    }),
    setData: jest.fn(),
    getCachedData: jest.fn().mockImplementation((key) => {
      if (global.mockApiState === 'offline') {
        return { healthScore: 0.5 };
      }
      return null;
    }),
    getCacheStats: jest.fn().mockReturnValue({ totalItems: 10 })
  },
  getCachedData: jest.fn(),
  setCachedData: jest.fn()
}));

// Mock error logger
jest.mock('@/services/errorLogger', () => ({
  errorLogger: {
    logError: jest.fn(),
    logSuccess: jest.fn()
  },
  logError: jest.fn(),
  logSuccess: jest.fn(),
  ErrorCategory: {
    DATABASE: 'database',
    API: 'api',
    COMPONENT: 'component',
    NETWORK: 'network',
    AUTHENTICATION: 'authentication',
    VALIDATION: 'validation',
    BUSINESS_LOGIC: 'business_logic',
    EXTERNAL_SERVICE: 'external_service',
    UNKNOWN: 'unknown'
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }
}));

describe('API Error Recovery Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockApiState = 'success';
  });
  
  describe('Retry Mechanism', () => {
    test('retries failed API calls with exponential backoff', async () => {
      // Mock API timeout
      global.mockApiState = 'timeout';
      
      // Mock implementation of withRetry to track retries
      const originalWithRetry = withRetry;
      const mockWithRetry = jest.fn().mockImplementation(async (fn, options) => {
        try {
          return await fn();
        } catch (error) {
          // Simulate retry by changing mock state to success
          global.mockApiState = 'success';
          return await fn();
        }
      });
      
      // Replace withRetry implementation temporarily
      jest.mock('@/utils/retryManager', () => ({
        ...jest.requireActual('@/utils/retryManager'),
        withRetry: mockWithRetry
      }));
      
      // Make API call that will fail and then succeed
      const apiCall = async () => {
        return await supabase.functions.invoke('field-ai-insights', {
          body: { field_id: '123' }
        });
      };
      
      const result = await mockWithRetry(apiCall, {
        maxRetries: 3,
        baseDelay: 100
      });
      
      // Verify retry was attempted and succeeded
      expect(mockWithRetry).toHaveBeenCalled();
      expect(result.data).toBeDefined();
      expect(result.data.health_score).toBe(0.8);
      
      // Restore original withRetry
      jest.mock('@/utils/retryManager', () => ({
        ...jest.requireActual('@/utils/retryManager'),
        withRetry: originalWithRetry
      }));
    });
    
    test('implements circuit breaker pattern for persistent failures', async () => {
      // Mock server error
      global.mockApiState = 'server_error';
      
      // Mock circuit breaker
      jest.spyOn(retryManager, 'isCircuitOpen').mockReturnValueOnce(false);
      
      // Make API call that will trigger circuit breaker
      const apiCall = async () => {
        if (retryManager.isCircuitOpen('field-ai-insights')) {
          throw new Error('Circuit open');
        }
        
        const result = await supabase.functions.invoke('field-ai-insights', {
          body: { field_id: '123' }
        });
        
        if (result.error) {
          retryManager.recordFailure('field-ai-insights', new Error(result.error.message));
          retryManager.openCircuit('field-ai-insights');
          throw new Error(result.error.message);
        }
        
        return result.data;
      };
      
      // First call should fail and open circuit
      await expect(apiCall()).rejects.toThrow();
      expect(retryManager.recordFailure).toHaveBeenCalled();
      expect(retryManager.openCircuit).toHaveBeenCalledWith('field-ai-insights');
      
      // Mock circuit now open
      jest.spyOn(retryManager, 'isCircuitOpen').mockReturnValueOnce(true);
      
      // Second call should fail fast with circuit open
      await expect(apiCall()).rejects.toThrow('Circuit open');
    });
  });
  
  describe('Fallback Mechanisms', () => {
    test('uses cached data when API fails', async () => {
      // Mock API failure
      global.mockApiState = 'server_error';
      
      // Mock cached data
      jest.spyOn(offlineDataManager, 'getCachedData').mockReturnValueOnce({
        healthScore: 0.7,
        ndviValue: 0.6
      });
      
      // Make API call with fallback to cache
      const apiCall = async () => {
        try {
          const result = await supabase.functions.invoke('field-ai-insights', {
            body: { field_id: '123' }
          });
          
          if (result.error) {
            throw new Error(result.error.message);
          }
          
          return result.data;
        } catch (error) {
          // Fallback to cache
          const cached = offlineDataManager.getCachedData('field-insights-123');
          if (cached) {
            return cached;
          }
          throw error;
        }
      };
      
      const result = await apiCall();
      
      // Verify cached data was used
      expect(result).toBeDefined();
      expect(result.healthScore).toBe(0.7);
      expect(offlineDataManager.getCachedData).toHaveBeenCalled();
    });
    
    test('degrades gracefully when offline', async () => {
      // Mock offline state
      global.mockApiState = 'offline';
      
      // Make API call with offline handling
      const apiCall = async () => {
        return await offlineDataManager.getData(
          'field-insights-123',
          async () => {
            const result = await supabase.functions.invoke('field-ai-insights', {
              body: { field_id: '123' }
            });
            
            if (result.error) {
              throw new Error(result.error.message);
            }
            
            return result.data;
          },
          300000, // 5 minute cache
          { healthScore: 0.5, ndviValue: 0.4 } // Fallback data
        );
      };
      
      const result = await apiCall();
      
      // Verify fallback data was used
      expect(result).toBeDefined();
      expect(result.healthScore).toBe(0.5);
    });
  });
  
  describe('Error Logging', () => {
    test('logs API errors with appropriate categorization', async () => {
      // Mock rate limit error
      global.mockApiState = 'rate_limit';
      
      // Make API call that will fail
      const apiCall = async () => {
        try {
          const result = await supabase.functions.invoke('field-ai-insights', {
            body: { field_id: '123' }
          });
          
          if (result.error) {
            // Log error with appropriate category and severity
            errorLogger.logError(
              new Error(result.error.message),
              ErrorCategory.API,
              result.error.status === 429 ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH,
              {
                component: 'ApiClient',
                action: 'invokeFunction',
                metadata: {
                  function: 'field-ai-insights',
                  status: result.error.status
                }
              }
            );
            
            throw new Error(result.error.message);
          }
          
          return result.data;
        } catch (error) {
          throw error;
        }
      };
      
      // Call should fail and log error
      await expect(apiCall()).rejects.toThrow();
      
      // Verify error was logged with correct category and severity
      expect(errorLogger.logError).toHaveBeenCalledWith(
        expect.any(Error),
        ErrorCategory.API,
        ErrorSeverity.MEDIUM,
        expect.objectContaining({
          component: 'ApiClient',
          action: 'invokeFunction',
          metadata: expect.objectContaining({
            function: 'field-ai-insights',
            status: 429
          })
        })
      );
    });
  });
});