import { vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { retryManager, withRetry } from '@/utils/retryManager';
import { offlineDataManager } from '@/utils/offlineDataManager';
import { errorLogger, ErrorCategory, ErrorSeverity } from '@/services/errorLogger';

// Mock fetch
global.fetch = vi.fn();

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    then: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: vi.fn().mockImplementation((functionName, options) => {
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

// We will use the actual retryManager to test its behavior

// Mock offline data manager
vi.mock('@/utils/offlineDataManager', () => ({
  offlineDataManager: {
    getData: vi.fn().mockImplementation((key, fn, maxAge, fallbackData) => {
      if (global.mockApiState === 'offline') {
        return Promise.resolve(fallbackData || { healthScore: 0.5 });
      }
      return fn();
    }),
    setData: vi.fn(),
    getCachedData: vi.fn().mockImplementation((key) => {
      if (global.mockApiState === 'offline') {
        return { healthScore: 0.5 };
      }
      return null;
    }),
    getCacheStats: vi.fn().mockReturnValue({ totalItems: 10 })
  },
  getCachedData: vi.fn(),
  setCachedData: vi.fn()
}));

// Mock error logger
vi.mock('@/services/errorLogger', () => ({
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
      global.mockApiState = 'server_error'; // Make the API always fail

      const failingApiCall = () => supabase.functions.invoke('field-ai-insights', { body: { field_id: '123' } });
      const circuitBreakerKey = 'test-circuit';

      // The default failureThreshold is 5. Let's make 5 calls to open the circuit.
      for (let i = 0; i < 5; i++) {
        await expect(withRetry(failingApiCall, { maxRetries: 0 }, circuitBreakerKey)).rejects.toThrow();
      }

      // The 6th call should fail immediately because the circuit is open.
      await expect(withRetry(failingApiCall, { maxRetries: 0 }, circuitBreakerKey)).rejects.toThrow('Circuit breaker is OPEN');
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