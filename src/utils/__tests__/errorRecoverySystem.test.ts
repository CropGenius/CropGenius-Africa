import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorRecoverySystem, ErrorContext } from '../errorRecoverySystem';
import { offlineDataManager } from '../offlineDataManager';

vi.mock('../offlineDataManager', () => ({
  offlineDataManager: {
    getCachedData: vi.fn(),
    getSmartFallback: vi.fn(),
  },
}));

describe('ErrorRecoverySystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should attempt to use cache fallback for network errors', async () => {
    const error = new Error('Network request failed');
    const context: ErrorContext = { 
      component: 'TestComponent',
      operation: 'testFetch',
      timestamp: new Date(),
      networkStatus: 'offline',
      retryCount: 0,
      userAgent: 'Vitest',
      url: '/test',
    };
    (offlineDataManager.getCachedData as vi.Mock).mockResolvedValue({ data: 'cached data' });

    const result = await errorRecoverySystem.recoverFromError(error, context);

    expect(offlineDataManager.getCachedData).toHaveBeenCalledWith(context.component);
    expect(result.success).toBe(true);
    expect(result.strategy).toContain('cache_fallback');
  });

  it('should use smart fallback if cache is unavailable', async () => {
    const error = new Error('Network request failed');
    const context: ErrorContext = { 
      component: 'TestComponent',
      operation: 'testFetch',
      timestamp: new Date(),
      networkStatus: 'offline',
      retryCount: 1,
      userAgent: 'Vitest',
      url: '/test',
    };
    (offlineDataManager.getCachedData as vi.Mock).mockResolvedValue(null);
    (offlineDataManager.getSmartFallback as vi.Mock).mockResolvedValue({ data: 'smart fallback data' });

    const result = await errorRecoverySystem.recoverFromError(error, context);

    expect(offlineDataManager.getSmartFallback).toHaveBeenCalledWith(context.component);
    expect(result.success).toBe(true);
    expect(result.strategy).toContain('smart_fallback');
  });

  it('should fail if all recovery strategies are exhausted', async () => {
    const error = new Error('Critical error');
    const context: ErrorContext = { 
      component: 'TestComponent',
      operation: 'testFetch',
      timestamp: new Date(),
      networkStatus: 'offline',
      retryCount: 3,
      userAgent: 'Vitest',
      url: '/test',
    };
    (offlineDataManager.getCachedData as vi.Mock).mockResolvedValue(null);
    (offlineDataManager.getSmartFallback as vi.Mock).mockResolvedValue(null);

    const result = await errorRecoverySystem.recoverFromError(error, context);

    expect(result.success).toBe(false);
  });
});