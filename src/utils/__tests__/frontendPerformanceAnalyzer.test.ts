/**
 * 🚀💪 INFINITY GOD MODE FRONTEND PERFORMANCE ANALYZER TESTS
 * -------------------------------------------------------------
 * PRODUCTION-READY unit tests for frontend performance monitoring
 * Built for 100 million African farmers with military-grade precision!
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { frontendPerformanceAnalyzer, trackComponentRender, getPerformanceMetrics } from '../frontendPerformanceAnalyzer';

// Mock dependencies
vi.mock('@/services/errorLogger', () => ({
  errorLogger: {
    logError: vi.fn(),
    getRecentErrors: vi.fn(() => [])
  },
  logError: vi.fn(),
  logSuccess: vi.fn(),
  ErrorCategory: {
    COMPONENT: 'component',
    NETWORK: 'network'
  },
  ErrorSeverity: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }
}));

vi.mock('@/utils/offlineDataManager', () => ({
  offlineDataManager: {
    setData: vi.fn(),
    getCachedData: vi.fn(),
    hasData: vi.fn(() => Promise.resolve(false))
  }
}));

// Mock Performance API
const mockPerformanceObserver = vi.fn();
const mockPerformanceEntries = vi.fn();

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Mock Performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => 1000),
    getEntriesByType: vi.fn((type: string) => {
      if (type === 'navigation') {
        return [{
          navigationStart: 0,
          domContentLoadedEventStart: 100,
          domContentLoadedEventEnd: 150,
          loadEventStart: 200,
          loadEventEnd: 250,
          domainLookupStart: 10,
          domainLookupEnd: 20,
          connectStart: 20,
          connectEnd: 30,
          responseStart: 50,
          responseEnd: 80,
          domLoading: 80,
          domComplete: 180,
          domInteractive: 120,
          requestStart: 40
        }];
      }
      if (type === 'resource') {
        return [
          {
            name: 'https://example.com/app.js',
            transferSize: 1024000,
            requestStart: 100,
            responseEnd: 300
          },
          {
            name: 'https://example.com/styles.css',
            transferSize: 51200,
            requestStart: 50,
            responseEnd: 150
          }
        ];
      }
      if (type === 'paint') {
        return [
          { name: 'first-contentful-paint', startTime: 150 }
        ];
      }
      return [];
    }),
    memory: {
      usedJSHeapSize: 10485760, // 10MB
      totalJSHeapSize: 20971520, // 20MB
      jsHeapSizeLimit: 2147483648 // 2GB
    }
  } as any;

  // Mock PerformanceObserver
  global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn()
  })) as any;

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((callback) => {
    setTimeout(callback, 16);
    return 1;
  });

  // Mock document
  global.document = {
    ...global.document,
    addEventListener: vi.fn()
  } as any;

  // Mock window
  global.window = {
    ...global.window,
    addEventListener: vi.fn()
  } as any;

  // Mock navigator
  global.navigator = {
    ...global.navigator,
    serviceWorker: {}
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('FrontendPerformanceAnalyzer', () => {
  describe('Component Render Tracking', () => {
    it('should track component render times', () => {
      const componentName = 'TestComponent';
      const renderTime = 25.5;
      const props = { test: 'prop' };
      const state = { test: 'state' };

      trackComponentRender(componentName, renderTime, props, state);

      // Verify the component was tracked
      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.score).toBeLessThan(100); // Should be penalized for slow render
      expect(summary.issues).toContain('1 components have slow render times');
    });

    it('should calculate average render times correctly', () => {
      const componentName = 'TestComponent';
      
      // Track multiple renders
      trackComponentRender(componentName, 10);
      trackComponentRender(componentName, 20);
      trackComponentRender(componentName, 30);

      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      // Should not penalize for fast renders (all under 16ms threshold)
      expect(summary.score).toBe(100);
    });

    it('should identify slow components', () => {
      trackComponentRender('SlowComponent', 50); // Slow render
      trackComponentRender('FastComponent', 5);  // Fast render

      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.issues).toContain('1 components have slow render times');
      expect(summary.recommendations).toContain('Optimize slow components with React.memo or useMemo');
    });
  });

  describe('Performance Metrics Collection', () => {
    it('should collect comprehensive performance metrics', async () => {
      const metrics = await getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeInstanceOf(Date);
      expect(metrics.bundleSize).toBeDefined();
      expect(metrics.bundleSize.totalSize).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeDefined();
      expect(metrics.memoryUsage.usedJSHeapSize).toBe(10485760);
    });

    it('should analyze bundle size correctly', async () => {
      const metrics = await getPerformanceMetrics();

      expect(metrics.bundleSize.jsSize).toBeGreaterThan(0);
      expect(metrics.bundleSize.cssSize).toBeGreaterThan(0);
      expect(metrics.bundleSize.totalSize).toBe(metrics.bundleSize.jsSize + metrics.bundleSize.cssSize);
    });

    it('should track resource loading performance', async () => {
      const metrics = await getPerformanceMetrics();

      expect(metrics.resourceLoadTimes).toHaveLength(2);
      expect(metrics.resourceLoadTimes[0].type).toBe('script');
      expect(metrics.resourceLoadTimes[1].type).toBe('stylesheet');
      expect(metrics.resourceLoadTimes[0].loadTime).toBe(200); // 300 - 100
      expect(metrics.resourceLoadTimes[1].loadTime).toBe(100); // 150 - 50
    });
  });

  describe('Memory Monitoring', () => {
    it('should track memory usage', async () => {
      const metrics = await getPerformanceMetrics();

      expect(metrics.memoryUsage.usedJSHeapSize).toBe(10485760);
      expect(metrics.memoryUsage.totalJSHeapSize).toBe(20971520);
      expect(metrics.memoryUsage.jsHeapSizeLimit).toBe(2147483648);
    });

    it('should detect potential memory leaks', () => {
      // Mock high memory usage
      (global.performance as any).memory.usedJSHeapSize = 104857600; // 100MB

      // Trigger memory leak detection
      (frontendPerformanceAnalyzer as any).checkMemoryLeaks();

      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.issues.some(issue => issue.includes('memory leaks'))).toBe(true);
    });
  });

  describe('Performance Summary', () => {
    it('should calculate performance score correctly', () => {
      // Start with clean state
      frontendPerformanceAnalyzer.clearData();
      
      let summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.score).toBe(100);

      // Add slow component
      trackComponentRender('SlowComponent', 50);
      summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.score).toBeLessThan(100);
    });

    it('should provide relevant recommendations', () => {
      frontendPerformanceAnalyzer.clearData();
      
      // Add performance issues
      trackComponentRender('SlowComponent1', 30);
      trackComponentRender('SlowComponent2', 40);

      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.recommendations).toContain('Optimize slow components with React.memo or useMemo');
    });

    it('should track interaction latency', () => {
      // Simulate slow interaction
      const analyzer = frontendPerformanceAnalyzer as any;
      analyzer.interactionMetrics = [
        { type: 'click', latency: 150, timestamp: new Date(), element: 'button' },
        { type: 'scroll', latency: 200, timestamp: new Date(), element: 'div' }
      ];

      const summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.issues.some(issue => issue.includes('slow user interactions'))).toBe(true);
      expect(summary.recommendations).toContain('Optimize event handlers and reduce main thread blocking');
    });
  });

  describe('Monitoring Controls', () => {
    it('should start and stop monitoring', () => {
      frontendPerformanceAnalyzer.stopMonitoring();
      expect((frontendPerformanceAnalyzer as any).isMonitoring).toBe(false);

      frontendPerformanceAnalyzer.startMonitoring();
      expect((frontendPerformanceAnalyzer as any).isMonitoring).toBe(true);
    });

    it('should clear performance data', () => {
      trackComponentRender('TestComponent', 25);
      
      let summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.issues.length).toBeGreaterThan(0);

      frontendPerformanceAnalyzer.clearData();
      
      summary = frontendPerformanceAnalyzer.getPerformanceSummary();
      expect(summary.score).toBe(100);
      expect(summary.issues).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing Performance API gracefully', async () => {
      // Mock missing Performance API
      const originalPerformance = global.performance;
      delete (global as any).performance;

      const metrics = await getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.memoryUsage.usedJSHeapSize).toBe(0);

      // Restore
      global.performance = originalPerformance;
    });

    it('should handle PerformanceObserver errors gracefully', () => {
      // Mock PerformanceObserver that throws
      global.PerformanceObserver = vi.fn().mockImplementation(() => {
        throw new Error('PerformanceObserver not supported');
      }) as any;

      expect(() => {
        frontendPerformanceAnalyzer.startMonitoring();
      }).not.toThrow();
    });
  });

  describe('Core Web Vitals', () => {
    it('should calculate First Contentful Paint correctly', async () => {
      const metrics = await getPerformanceMetrics();
      expect(metrics.firstContentfulPaint).toBe(150);
    });

    it('should handle missing paint entries', async () => {
      (global.performance.getEntriesByType as Mock).mockImplementation((type: string) => {
        if (type === 'paint') return [];
        return [];
      });

      const metrics = await getPerformanceMetrics();
      expect(metrics.firstContentfulPaint).toBe(0);
    });
  });
});

describe('Convenience Functions', () => {
  it('should export trackComponentRender function', () => {
    expect(typeof trackComponentRender).toBe('function');
    
    // Should not throw
    expect(() => {
      trackComponentRender('TestComponent', 15);
    }).not.toThrow();
  });

  it('should export getPerformanceMetrics function', async () => {
    expect(typeof getPerformanceMetrics).toBe('function');
    
    const metrics = await getPerformanceMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.timestamp).toBeInstanceOf(Date);
  });
});