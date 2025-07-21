import { supabase } from '@/integrations/supabase/client';
import { schemaValidator, autoCorrectQuery } from '@/utils/schemaValidator';
import { farmHealthService } from '@/services/FarmHealthService';
import { withRetry } from '@/utils/retryManager';
import { offlineDataManager } from '@/utils/offlineDataManager';

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => {
      // Simulate database response based on query
      const mockData = {
        success: { data: { id: '123', name: 'Test Farm' }, error: null },
        columnError: { 
          data: null, 
          error: { 
            message: 'column "created_by" does not exist',
            code: '42703'
          }
        },
        connectionError: {
          data: null,
          error: {
            message: 'Connection timeout',
            code: '08001'
          }
        }
      };
      
      // Get error type from mock state
      const errorType = this.mockErrorType || 'success';
      
      return Promise.resolve(mockData[errorType]);
    }),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: { health_score: 0.8 }, error: null })
    }
  }
}));

// Mock retry manager
jest.mock('@/utils/retryManager', () => {
  const original = jest.requireActual('@/utils/retryManager');
  return {
    ...original,
    withRetry: jest.fn().mockImplementation((fn, options) => fn()),
    withRetryAndCache: jest.fn().mockImplementation((key, fn) => fn())
  };
});

// Mock offline data manager
jest.mock('@/utils/offlineDataManager', () => ({
  offlineDataManager: {
    getData: jest.fn().mockImplementation((key, fn) => fn()),
    setData: jest.fn(),
    getCachedData: jest.fn(),
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

describe('Database Error Recovery Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock state
    supabase.from().mockErrorType = 'success';
    
    // Reset schema validator cache
    schemaValidator.clearCache();
  });
  
  describe('Column Error Recovery', () => {
    test('recovers from column does not exist error', async () => {
      // Set up column mapping
      schemaValidator.registerColumnMapping('fields', 'created_by', 'created_at');
      
      // Mock schema validation response
      jest.spyOn(schemaValidator, 'validateTableColumns').mockResolvedValue({
        isValid: false,
        missingColumns: ['created_by'],
        extraColumns: [],
        suggestions: { 'created_by': 'created_at' },
        errors: [],
        warnings: ['Column "created_by" not found. Suggested mapping: "created_at"']
      });
      
      // Mock auto-correct query
      jest.spyOn(schemaValidator, 'autoCorrectQuery').mockResolvedValue({
        correctedQuery: 'SELECT id, name, created_at FROM fields',
        mappings: [{
          originalColumn: 'created_by',
          mappedColumn: 'created_at',
          confidence: 0.95,
          reason: 'Known mapping pattern'
        }]
      });
      
      // First call fails with column error
      supabase.from().mockErrorType = 'columnError';
      
      // Second call succeeds after correction
      const secondCallMock = jest.fn().mockResolvedValue({
        data: { id: '123', name: 'Test Farm' },
        error: null
      });
      
      // Mock withRetry to simulate retry behavior
      jest.mocked(withRetry).mockImplementationOnce(async (fn) => {
        // First attempt fails
        await fn().catch(() => {});
        
        // Change mock to success for second attempt
        supabase.from().mockErrorType = 'success';
        
        // Second attempt succeeds
        return secondCallMock();
      });
      
      // Call service method that would trigger the error
      await farmHealthService.validateAllSchemas();
      
      // Verify auto-correction was attempted
      expect(schemaValidator.autoCorrectQuery).toHaveBeenCalled();
      
      // Verify second call was made with corrected query
      expect(secondCallMock).toHaveBeenCalled();
    });
  });
  
  describe('Connection Error Recovery', () => {
    test('recovers from connection timeout with cached data', async () => {
      // Mock connection error
      supabase.from().mockErrorType = 'connectionError';
      
      // Mock cached data
      const cachedData = { id: '123', name: 'Cached Farm', healthScore: 0.7 };
      jest.mocked(offlineDataManager.getCachedData).mockReturnValue(cachedData);
      
      // Call service method
      const result = await farmHealthService.getFarmHealth('123', false);
      
      // Verify retry was attempted
      expect(withRetry).toHaveBeenCalled();
      
      // Verify cached data was used
      expect(offlineDataManager.getCachedData).toHaveBeenCalled();
      expect(result.farmId).toBe('123');
    });
    
    test('uses fallback data when no cache is available', async () => {
      // Mock connection error
      supabase.from().mockErrorType = 'connectionError';
      
      // Mock no cached data
      jest.mocked(offlineDataManager.getCachedData).mockReturnValue(null);
      
      // Call service method
      const result = await farmHealthService.getFarmHealth('123', false);
      
      // Verify fallback data was generated
      expect(result.farmId).toBe('123');
      expect(result.healthScore).toBeDefined();
      expect(result.trustIndicators).toBeDefined();
    });
  });
  
  describe('Schema Validation Integration', () => {
    test('validates schema before executing queries', async () => {
      // Spy on validateColumns
      const validateSpy = jest.spyOn(schemaValidator, 'validateTableColumns');
      
      // Call service method
      await farmHealthService.getFarmHealth('123', true);
      
      // Verify schema validation was called
      expect(validateSpy).toHaveBeenCalled();
    });
    
    test('applies column mappings to queries', async () => {
      // Set up column mapping
      schemaValidator.registerColumnMapping('fields', 'created_by', 'created_at');
      
      // Spy on autoCorrectQuery
      const correctSpy = jest.spyOn(schemaValidator, 'autoCorrectQuery');
      
      // Call service method
      await farmHealthService.getFarmHealth('123', true);
      
      // Verify auto-correction was called
      expect(correctSpy).toHaveBeenCalled();
    });
  });
});