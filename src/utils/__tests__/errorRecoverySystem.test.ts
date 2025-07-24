import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as errorRecoverySystem from '../errorRecoverySystem';
import { ErrorContext } from '../errorRecoverySystem';
import { offlineDataManager } from '../offlineDataManager';

// Mock offlineDataManager
vi.mock('../offlineDataManager', () => ({
  offlineDataManager: {
    getCachedData: vi.fn(),
    getSmartFallback: vi.fn(),
  }
}));

describe('ErrorRecoverySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('data_validation strategy', () => {
    it('should recover using getSmartFallback when validation error occurs', async () => {
      // Mock getSmartFallback to return test data
      const mockFallbackData = { test: 'fallback data' };
      vi.mocked(offlineDataManager.getSmartFallback).mockReturnValue(mockFallbackData);

      // Create a validation error
      const error = new Error('invalid data structure');
      const context = {
        component: 'WeatherIntelligenceDashboard',
        networkStatus: 'online',
        retryCount: 0
      };

      // Execute recovery
      const result = await errorRecoverySystem.recoverFromError(error, context);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('data_validation');
      expect(offlineDataManager.getSmartFallback).toHaveBeenCalledWith('WeatherIntelligenceDashboard');
      expect(result.fallbackData).toEqual(mockFallbackData);
    });

    it('should fail recovery when no fallback data is available', async () => {
      // Mock getSmartFallback to return null
      vi.mocked(offlineDataManager.getSmartFallback).mockReturnValue(null);

      // Create a validation error
      const error = new Error('invalid data structure');
      const context: Partial<ErrorContext> = { component: 'TestComponent', networkStatus: 'online', retryCount: 0 };

      // Execute recovery
      const result = await errorRecoverySystem.recoverFromError(error, context);

      // Verify results
      expect(result.success).toBe(false);
      expect(result.strategy).toBe('data_validation');
      expect(offlineDataManager.getSmartFallback).toHaveBeenCalledWith('UnknownComponent');
      expect(result.message).toContain('No fallback data available');
    });
  });

  describe('cache_fallback strategy', () => {
    it('should try getCachedData first and then getSmartFallback', async () => {
      // Mock getCachedData to return null (no cache)
      vi.mocked(offlineDataManager.getCachedData).mockReturnValue(null);
      
      // Mock getSmartFallback to return test data
      const mockFallbackData = { test: 'smart fallback data' };
      vi.mocked(offlineDataManager.getSmartFallback).mockReturnValue(mockFallbackData);

      // Create a network error
      const error = new Error('network failure');
      const context = {
        component: 'FieldDashboard',
        networkStatus: 'offline',
        retryCount: 0
      };

      // Execute recovery
      const result = await errorRecoverySystem.recoverFromError(error, context);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('cache_fallback');
      expect(offlineDataManager.getCachedData).toHaveBeenCalled();
      expect(offlineDataManager.getSmartFallback).toHaveBeenCalledWith('FieldDashboard');
      expect(result.fallbackData).toEqual(mockFallbackData);
    });

    it('should use cached data when available instead of smart fallback', async () => {
      // Mock getCachedData to return cached data
      const cachedData = { test: 'cached data' };
      vi.mocked(offlineDataManager.getCachedData).mockReturnValue(cachedData);
      
      // Mock getSmartFallback (should not be called)
      vi.mocked(offlineDataManager.getSmartFallback).mockReturnValue({ test: 'should not be used' });

      // Create a network error
      const error = new Error('network failure');
      const context = {
        component: 'FieldDashboard',
        networkStatus: 'offline',
        retryCount: 0
      };

      // Execute recovery
      const result = await errorRecoverySystem.recoverFromError(error, context);

      // Verify results
      expect(result.success).toBe(true);
      expect(result.strategy).toBe('cache_fallback');
      expect(offlineDataManager.getCachedData).toHaveBeenCalled();
      expect(offlineDataManager.getSmartFallback).not.toHaveBeenCalled();
      expect(result.fallbackData).toEqual(cachedData);
    });
  });
});