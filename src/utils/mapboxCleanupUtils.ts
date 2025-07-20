/**
 * 🚀 INFINITY IQ MAPBOX CLEANUP UTILITIES
 * Production-ready defensive cleanup for Mapbox GL JS
 * Handles ALL edge cases and prevents the "indoor" property error
 */

import mapboxgl from 'mapbox-gl';

export interface CleanupState {
  isActive: boolean;
  startTime: number;
  completedSteps: string[];
  failedSteps: Array<{ step: string; error: string }>;
  totalSteps: number;
}

export interface MapResourceTracker {
  markers: mapboxgl.Marker[];
  sources: string[];
  layers: string[];
  eventListeners: Array<{ event: string; handler: Function }>;
  controls: mapboxgl.IControl[];
}

/**
 * INFINITY IQ Safe cleanup wrapper - handles ALL edge cases
 */
export const safeCleanup = <T>(
  resource: T | null | undefined,
  cleanupFn: (resource: T) => void,
  resourceName: string
): boolean => {
  try {
    if (resource && typeof cleanupFn === 'function') {
      cleanupFn(resource);
      console.log(`✅ [MapboxCleanup] ${resourceName} cleaned up successfully`);
      return true;
    } else {
      console.warn(`⚠️ [MapboxCleanup] ${resourceName} is null/undefined or cleanup function invalid`);
      return false;
    }
  } catch (error: any) {
    console.warn(`⚠️ [MapboxCleanup] Failed to cleanup ${resourceName}:`, error?.message || error);
    
    // Handle specific Mapbox GL errors that should be ignored
    if (error?.message?.includes('indoor') || 
        error?.message?.includes('Cannot read properties of undefined') ||
        error?.message?.includes('_destroyed')) {
      console.log(`🔧 [MapboxCleanup] Ignoring known Mapbox cleanup error for ${resourceName}`);
      return true; // Consider this a successful cleanup
    }
    
    return false;
  }
};

/**
 * INFINITY IQ Safe map operation wrapper - prevents crashes
 */
export const safeMapOperation = (
  map: mapboxgl.Map | null | undefined,
  operation: (map: mapboxgl.Map) => void,
  operationName: string
): boolean => {
  if (!map) {
    console.warn(`[MapboxCleanup] Map instance not available for ${operationName}`);
    return false;
  }

  // Check if map is destroyed or invalid
  try {
    // These are safe property checks that won't trigger the indoor error
    const container = map.getContainer?.();
    if (!container || (map as any)._destroyed === true) {
      console.warn(`[MapboxCleanup] Map instance is destroyed, skipping ${operationName}`);
      return false;
    }
  } catch (error: any) {
    console.warn(`[MapboxCleanup] Map state check failed for ${operationName}:`, error?.message);
    return false;
  }

  try {
    operation(map);
    console.log(`✅ [MapboxCleanup] ${operationName} completed successfully`);
    return true;
  } catch (error: any) {
    console.error(`❌ [MapboxCleanup] ${operationName} failed:`, error?.message || error);
    
    // Handle specific Mapbox errors that indicate the map is being destroyed
    if (error?.message?.includes('indoor') || 
        error?.message?.includes('Cannot read properties of undefined') ||
        error?.message?.includes('_destroyed') ||
        error?.message?.includes('Map has been removed')) {
      console.log(`🔧 [MapboxCleanup] Ignoring known Mapbox error during ${operationName}`);
      return true; // Don't propagate these errors
    }
    
    throw error; // Re-throw other errors
  }
};

/**
 * INFINITY IQ Marker cleanup - handles all marker edge cases
 */
export const safeCleanupMarker = (marker: mapboxgl.Marker | null | undefined): boolean => {
  return safeCleanup(marker, (m) => {
    // Check if marker is already removed
    if ((m as any)._map === null || (m as any)._map === undefined) {
      console.log('[MapboxCleanup] Marker already removed from map');
      return;
    }
    m.remove();
  }, 'Marker');
};

/**
 * INFINITY IQ Source cleanup - safely removes map sources
 */
export const safeCleanupSource = (
  map: mapboxgl.Map | null | undefined, 
  sourceId: string
): boolean => {
  return safeMapOperation(map, (m) => {
    if (m.getSource(sourceId)) {
      m.removeSource(sourceId);
    }
  }, `Source: ${sourceId}`);
};

/**
 * INFINITY IQ Layer cleanup - safely removes map layers
 */
export const safeCleanupLayer = (
  map: mapboxgl.Map | null | undefined, 
  layerId: string
): boolean => {
  return safeMapOperation(map, (m) => {
    if (m.getLayer(layerId)) {
      m.removeLayer(layerId);
    }
  }, `Layer: ${layerId}`);
};

/**
 * INFINITY IQ Control cleanup - safely removes map controls
 */
export const safeCleanupControl = (
  map: mapboxgl.Map | null | undefined,
  control: mapboxgl.IControl
): boolean => {
  return safeMapOperation(map, (m) => {
    try {
      m.removeControl(control);
    } catch (error: any) {
      // Control might not be added to the map
      if (error?.message?.includes('not found')) {
        console.log('[MapboxCleanup] Control not found on map, already removed');
        return;
      }
      throw error;
    }
  }, 'Control');
};

/**
 * INFINITY IQ Event listener cleanup - safely removes event listeners
 */
export const safeCleanupEventListener = (
  map: mapboxgl.Map | null | undefined,
  event: string,
  handler: Function
): boolean => {
  return safeMapOperation(map, (m) => {
    m.off(event as any, handler as any);
  }, `Event Listener: ${event}`);
};

/**
 * INFINITY IQ Map instance cleanup - the ultimate safe destroyer
 */
export const safeCleanupMapInstance = (map: mapboxgl.Map | null | undefined): boolean => {
  if (!map) {
    console.log('[MapboxCleanup] Map instance is null, nothing to cleanup');
    return true;
  }

  try {
    // Check if already destroyed
    if ((map as any)._destroyed === true) {
      console.log('[MapboxCleanup] Map instance already destroyed');
      return true;
    }

    // Try to get container to verify map is still valid
    const container = map.getContainer?.();
    if (!container) {
      console.log('[MapboxCleanup] Map container not available, considering destroyed');
      return true;
    }

    // Perform the actual cleanup
    map.remove();
    console.log('✅ [MapboxCleanup] Map instance destroyed successfully');
    return true;

  } catch (error: any) {
    console.warn('⚠️ [MapboxCleanup] Map cleanup error:', error?.message || error);
    
    // These errors are expected during cleanup and should be ignored
    const ignorableErrors = [
      'indoor',
      'Cannot read properties of undefined',
      '_destroyed',
      'Map has been removed',
      'Container is not defined'
    ];
    
    const shouldIgnore = ignorableErrors.some(errorPattern => 
      error?.message?.includes(errorPattern)
    );
    
    if (shouldIgnore) {
      console.log('🔧 [MapboxCleanup] Ignoring expected cleanup error');
      return true;
    }
    
    // For unexpected errors, log but don't throw to prevent app crash
    console.error('❌ [MapboxCleanup] Unexpected map cleanup error:', error);
    return false;
  }
};

/**
 * INFINITY IQ Resource Tracker - tracks and cleans up all map resources
 */
export class MapResourceTracker {
  private markers: mapboxgl.Marker[] = [];
  private sources: string[] = [];
  private layers: string[] = [];
  private eventListeners: Array<{ event: string; handler: Function }> = [];
  private controls: mapboxgl.IControl[] = [];
  private cleanupState: CleanupState = {
    isActive: false,
    startTime: 0,
    completedSteps: [],
    failedSteps: [],
    totalSteps: 0
  };

  addMarker(marker: mapboxgl.Marker): void {
    this.markers.push(marker);
  }

  addSource(sourceId: string): void {
    if (!this.sources.includes(sourceId)) {
      this.sources.push(sourceId);
    }
  }

  addLayer(layerId: string): void {
    if (!this.layers.includes(layerId)) {
      this.layers.push(layerId);
    }
  }

  addEventListener(event: string, handler: Function): void {
    this.eventListeners.push({ event, handler });
  }

  addControl(control: mapboxgl.IControl): void {
    this.controls.push(control);
  }

  /**
   * INFINITY IQ Complete cleanup - cleans up ALL tracked resources
   */
  cleanupAllResources(map: mapboxgl.Map | null | undefined): CleanupState {
    console.log('🚀 [MapboxCleanup] Starting comprehensive resource cleanup');
    
    this.cleanupState = {
      isActive: true,
      startTime: Date.now(),
      completedSteps: [],
      failedSteps: [],
      totalSteps: this.markers.length + this.sources.length + this.layers.length + 
                  this.eventListeners.length + this.controls.length
    };

    // Cleanup markers
    this.markers.forEach((marker, index) => {
      const success = safeCleanupMarker(marker);
      if (success) {
        this.cleanupState.completedSteps.push(`marker-${index}`);
      } else {
        this.cleanupState.failedSteps.push({ step: `marker-${index}`, error: 'Cleanup failed' });
      }
    });

    // Cleanup layers (must be done before sources)
    this.layers.forEach(layerId => {
      const success = safeCleanupLayer(map, layerId);
      if (success) {
        this.cleanupState.completedSteps.push(`layer-${layerId}`);
      } else {
        this.cleanupState.failedSteps.push({ step: `layer-${layerId}`, error: 'Cleanup failed' });
      }
    });

    // Cleanup sources
    this.sources.forEach(sourceId => {
      const success = safeCleanupSource(map, sourceId);
      if (success) {
        this.cleanupState.completedSteps.push(`source-${sourceId}`);
      } else {
        this.cleanupState.failedSteps.push({ step: `source-${sourceId}`, error: 'Cleanup failed' });
      }
    });

    // Cleanup event listeners
    this.eventListeners.forEach(({ event, handler }, index) => {
      const success = safeCleanupEventListener(map, event, handler);
      if (success) {
        this.cleanupState.completedSteps.push(`event-${event}-${index}`);
      } else {
        this.cleanupState.failedSteps.push({ step: `event-${event}-${index}`, error: 'Cleanup failed' });
      }
    });

    // Cleanup controls
    this.controls.forEach((control, index) => {
      const success = safeCleanupControl(map, control);
      if (success) {
        this.cleanupState.completedSteps.push(`control-${index}`);
      } else {
        this.cleanupState.failedSteps.push({ step: `control-${index}`, error: 'Cleanup failed' });
      }
    });

    this.cleanupState.isActive = false;
    
    console.log(`✅ [MapboxCleanup] Cleanup complete: ${this.cleanupState.completedSteps.length}/${this.cleanupState.totalSteps} successful`);
    
    if (this.cleanupState.failedSteps.length > 0) {
      console.warn(`⚠️ [MapboxCleanup] ${this.cleanupState.failedSteps.length} cleanup steps failed:`, this.cleanupState.failedSteps);
    }

    // Reset tracking arrays
    this.reset();

    return this.cleanupState;
  }

  reset(): void {
    this.markers = [];
    this.sources = [];
    this.layers = [];
    this.eventListeners = [];
    this.controls = [];
  }

  getCleanupState(): CleanupState {
    return { ...this.cleanupState };
  }
}