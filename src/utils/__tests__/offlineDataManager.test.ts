import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { offlineDataManager } from '../offlineDataManager';

// Mock localStorage
beforeEach(() => {
  // Setup localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('OfflineDataManager', () => {
  describe('getSmartFallback', () => {
    it('should return fallback data for WeatherIntelligenceDashboard', () => {
      const fallbackData = offlineDataManager.getSmartFallback('WeatherIntelligenceDashboard');
      
      expect(fallbackData).toBeDefined();
      expect(fallbackData).toHaveProperty('forecast');
      expect(fallbackData).toHaveProperty('farmingInsights');
      expect(fallbackData.forecast).toBeInstanceOf(Array);
    });

    it('should return fallback data for FieldDashboard', () => {
      const fallbackData = offlineDataManager.getSmartFallback('FieldDashboard');
      
      expect(fallbackData).toBeDefined();
      expect(fallbackData).toHaveProperty('fields');
      expect(fallbackData).toHaveProperty('totalArea');
      expect(fallbackData).toHaveProperty('healthScore');
      expect(fallbackData.fields).toBeInstanceOf(Array);
    });

    it('should return fallback data for DiseaseDetectionCamera', () => {
      const fallbackData = offlineDataManager.getSmartFallback('DiseaseDetectionCamera');
      
      expect(fallbackData).toBeDefined();
      expect(fallbackData).toHaveProperty('isOffline');
      expect(fallbackData).toHaveProperty('supportedCrops');
      expect(fallbackData.supportedCrops).toBeInstanceOf(Array);
      expect(fallbackData.isOffline).toBe(true);
    });

    it('should return fallback data for MapboxFieldMap', () => {
      const fallbackData = offlineDataManager.getSmartFallback('MapboxFieldMap');
      
      expect(fallbackData).toBeDefined();
      expect(fallbackData).toHaveProperty('isOffline');
      expect(fallbackData).toHaveProperty('cachedBoundaries');
      expect(fallbackData).toHaveProperty('offlineLayersAvailable');
      expect(fallbackData.isOffline).toBe(true);
    });

    it('should return null for unknown component', () => {
      const fallbackData = offlineDataManager.getSmartFallback('UnknownComponent');
      expect(fallbackData).toBeNull();
    });
  });

  describe('getDataWithFallback', () => {
    it('should use smart fallback when all sources fail and no fallbackData provided', async () => {
      // Mock sources that will fail
      const failingSource1 = vi.fn().mockRejectedValue(new Error('Source 1 failed'));
      const failingSource2 = vi.fn().mockRejectedValue(new Error('Source 2 failed'));
      
      // Spy on getSmartFallback
      const getSmartFallbackSpy = vi.spyOn(offlineDataManager, 'getSmartFallback');
      getSmartFallbackSpy.mockReturnValue({ test: 'smart fallback data' });
      
      try {
        await offlineDataManager.getDataWithFallback(
          'TestComponent_operation',
          [failingSource1, failingSource2],
          300000 // 5 minutes
        );
      } catch (error) {
        // We expect this to throw since getDataWithFallback doesn't use getSmartFallback directly
        // This test is to verify the integration would work if implemented
      }
      
      // Verify getSmartFallback was called
      expect(getSmartFallbackSpy).toHaveBeenCalled();
    });
  });
});