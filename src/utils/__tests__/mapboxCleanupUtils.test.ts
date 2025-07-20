/**
 * 🚀 INFINITY IQ MAPBOX CLEANUP UTILITIES TESTS
 * Comprehensive tests for production-ready defensive cleanup
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    safeCleanup,
    safeMapOperation,
    safeCleanupMarker,
    safeCleanupSource,
    safeCleanupLayer,
    safeCleanupControl,
    safeCleanupEventListener,
    safeCleanupMapInstance,
    MapResourceTracker
} from '../mapboxCleanupUtils';

// Mock mapbox-gl
const mockMapboxgl = {
    Map: vi.fn(),
    Marker: vi.fn(),
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
    GeolocateControl: vi.fn()
};

vi.mock('mapbox-gl', () => mockMapboxgl);

describe('MapboxCleanupUtils', () => {
    let consoleSpy: any;

    beforeEach(() => {
        consoleSpy = {
            log: vi.spyOn(console, 'log').mockImplementation(() => { }),
            warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
            error: vi.spyOn(console, 'error').mockImplementation(() => { })
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        consoleSpy.log.mockRestore();
        consoleSpy.warn.mockRestore();
        consoleSpy.error.mockRestore();
    });

    describe('safeCleanup', () => {
        it('should successfully cleanup valid resource', () => {
            const mockResource = { id: 'test' };
            const mockCleanupFn = vi.fn();

            const result = safeCleanup(mockResource, mockCleanupFn, 'TestResource');

            expect(result).toBe(true);
            expect(mockCleanupFn).toHaveBeenCalledWith(mockResource);
            expect(consoleSpy.log).toHaveBeenCalledWith('✅ [MapboxCleanup] TestResource cleaned up successfully');
        });

        it('should handle null resource gracefully', () => {
            const mockCleanupFn = vi.fn();

            const result = safeCleanup(null, mockCleanupFn, 'TestResource');

            expect(result).toBe(false);
            expect(mockCleanupFn).not.toHaveBeenCalled();
            expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ [MapboxCleanup] TestResource is null/undefined or cleanup function invalid');
        });

        it('should handle undefined resource gracefully', () => {
            const mockCleanupFn = vi.fn();

            const result = safeCleanup(undefined, mockCleanupFn, 'TestResource');

            expect(result).toBe(false);
            expect(mockCleanupFn).not.toHaveBeenCalled();
        });

        it('should handle cleanup function errors gracefully', () => {
            const mockResource = { id: 'test' };
            const mockCleanupFn = vi.fn().mockImplementation(() => {
                throw new Error('Cleanup failed');
            });

            const result = safeCleanup(mockResource, mockCleanupFn, 'TestResource');

            expect(result).toBe(false);
            expect(consoleSpy.warn).toHaveBeenCalledWith('⚠️ [MapboxCleanup] Failed to cleanup TestResource:', 'Cleanup failed');
        });

        it('should ignore known Mapbox indoor errors', () => {
            const mockResource = { id: 'test' };
            const mockCleanupFn = vi.fn().mockImplementation(() => {
                throw new Error('Cannot read properties of undefined (reading \'indoor\')');
            });

            const result = safeCleanup(mockResource, mockCleanupFn, 'TestResource');

            expect(result).toBe(true); // Should return true for ignored errors
            expect(consoleSpy.log).toHaveBeenCalledWith('🔧 [MapboxCleanup] Ignoring known Mapbox cleanup error for TestResource');
        });

        it('should ignore _destroyed errors', () => {
            const mockResource = { id: 'test' };
            const mockCleanupFn = vi.fn().mockImplementation(() => {
                throw new Error('Map instance _destroyed');
            });

            const result = safeCleanup(mockResource, mockCleanupFn, 'TestResource');

            expect(result).toBe(true);
        });
    });

    describe('safeMapOperation', () => {
        it('should execute operation on valid map', () => {
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(document.createElement('div')),
                _destroyed: false
            };
            const mockOperation = vi.fn();

            const result = safeMapOperation(mockMap as any, mockOperation, 'TestOperation');

            expect(result).toBe(true);
            expect(mockOperation).toHaveBeenCalledWith(mockMap);
            expect(consoleSpy.log).toHaveBeenCalledWith('✅ [MapboxCleanup] TestOperation completed successfully');
        });

        it('should handle null map gracefully', () => {
            const mockOperation = vi.fn();

            const result = safeMapOperation(null, mockOperation, 'TestOperation');

            expect(result).toBe(false);
            expect(mockOperation).not.toHaveBeenCalled();
            expect(consoleSpy.warn).toHaveBeenCalledWith('[MapboxCleanup] Map instance not available for TestOperation');
        });

        it('should handle destroyed map gracefully', () => {
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(null),
                _destroyed: true
            };
            const mockOperation = vi.fn();

            const result = safeMapOperation(mockMap as any, mockOperation, 'TestOperation');

            expect(result).toBe(false);
            expect(mockOperation).not.toHaveBeenCalled();
        });

        it('should ignore indoor errors during operation', () => {
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(document.createElement('div')),
                _destroyed: false
            };
            const mockOperation = vi.fn().mockImplementation(() => {
                throw new Error('Cannot read properties of undefined (reading \'indoor\')');
            });

            const result = safeMapOperation(mockMap as any, mockOperation, 'TestOperation');

            expect(result).toBe(true); // Should return true for ignored errors
            expect(consoleSpy.log).toHaveBeenCalledWith('🔧 [MapboxCleanup] Ignoring known Mapbox error during TestOperation');
        });
    });

    describe('safeCleanupMarker', () => {
        it('should cleanup valid marker', () => {
            const mockMarker = {
                _map: {},
                remove: vi.fn()
            };

            const result = safeCleanupMarker(mockMarker as any);

            expect(result).toBe(true);
            expect(mockMarker.remove).toHaveBeenCalled();
        });

        it('should handle already removed marker', () => {
            const mockMarker = {
                _map: null,
                remove: vi.fn()
            };

            const result = safeCleanupMarker(mockMarker as any);

            expect(result).toBe(true);
            expect(consoleSpy.log).toHaveBeenCalledWith('[MapboxCleanup] Marker already removed from map');
        });

        it('should handle null marker', () => {
            const result = safeCleanupMarker(null);

            expect(result).toBe(false);
        });
    });

    describe('safeCleanupMapInstance', () => {
        it('should cleanup valid map instance', () => {
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(document.createElement('div')),
                _destroyed: false,
                remove: vi.fn()
            };

            const result = safeCleanupMapInstance(mockMap as any);

            expect(result).toBe(true);
            expect(mockMap.remove).toHaveBeenCalled();
            expect(consoleSpy.log).toHaveBeenCalledWith('✅ [MapboxCleanup] Map instance destroyed successfully');
        });

        it('should handle null map instance', () => {
            const result = safeCleanupMapInstance(null);

            expect(result).toBe(true);
            expect(consoleSpy.log).toHaveBeenCalledWith('[MapboxCleanup] Map instance is null, nothing to cleanup');
        });

        it('should handle already destroyed map', () => {
            const mockMap = {
                _destroyed: true
            };

            const result = safeCleanupMapInstance(mockMap as any);

            expect(result).toBe(true);
            expect(consoleSpy.log).toHaveBeenCalledWith('[MapboxCleanup] Map instance already destroyed');
        });

        it('should ignore indoor errors during map cleanup', () => {
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(document.createElement('div')),
                _destroyed: false,
                remove: vi.fn().mockImplementation(() => {
                    throw new Error('Cannot read properties of undefined (reading \'indoor\')');
                })
            };

            const result = safeCleanupMapInstance(mockMap as any);

            expect(result).toBe(true);
            expect(consoleSpy.log).toHaveBeenCalledWith('🔧 [MapboxCleanup] Ignoring expected cleanup error');
        });
    });

    describe('MapResourceTracker', () => {
        let tracker: MapResourceTracker;

        beforeEach(() => {
            tracker = new MapResourceTracker();
        });

        it('should track markers', () => {
            const mockMarker = { remove: vi.fn() } as any;

            tracker.addMarker(mockMarker);

            expect(tracker['markers']).toContain(mockMarker);
        });

        it('should track sources without duplicates', () => {
            tracker.addSource('test-source');
            tracker.addSource('test-source'); // Duplicate

            expect(tracker['sources']).toEqual(['test-source']);
        });

        it('should track layers without duplicates', () => {
            tracker.addLayer('test-layer');
            tracker.addLayer('test-layer'); // Duplicate

            expect(tracker['layers']).toEqual(['test-layer']);
        });

        it('should track event listeners', () => {
            const mockHandler = vi.fn();

            tracker.addEventListener('click', mockHandler);

            expect(tracker['eventListeners']).toEqual([{ event: 'click', handler: mockHandler }]);
        });

        it('should track controls', () => {
            const mockControl = {} as any;

            tracker.addControl(mockControl);

            expect(tracker['controls']).toContain(mockControl);
        });

        it('should cleanup all resources', () => {
            const mockMarker = { _map: {}, remove: vi.fn() } as any;
            const mockMap = {
                getContainer: vi.fn().mockReturnValue(document.createElement('div')),
                _destroyed: false,
                getSource: vi.fn().mockReturnValue({}),
                getLayer: vi.fn().mockReturnValue({}),
                removeLayer: vi.fn(),
                removeSource: vi.fn(),
                off: vi.fn(),
                removeControl: vi.fn()
            } as any;

            tracker.addMarker(mockMarker);
            tracker.addSource('test-source');
            tracker.addLayer('test-layer');
            tracker.addEventListener('click', vi.fn());
            tracker.addControl({} as any);

            const result = tracker.cleanupAllResources(mockMap);

            expect(result.isActive).toBe(false);
            expect(result.completedSteps.length).toBeGreaterThan(0);
            expect(mockMarker.remove).toHaveBeenCalled();
            expect(mockMap.removeLayer).toHaveBeenCalledWith('test-layer');
            expect(mockMap.removeSource).toHaveBeenCalledWith('test-source');
        });

        it('should reset tracking arrays after cleanup', () => {
            tracker.addMarker({} as any);
            tracker.addSource('test-source');

            tracker.cleanupAllResources(null);

            expect(tracker['markers']).toEqual([]);
            expect(tracker['sources']).toEqual([]);
        });
    });
});