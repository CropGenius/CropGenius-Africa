/**
 * 🚀 CROPGENIUS MAP NAVIGATION ENGINE - INFINITY GOD MODE
 * --------------------------------------------------------
 * The most advanced map navigation system ever built for agriculture
 * Transforms static maps into dynamic, intelligent navigation experiences
 * Built for 100 million farmers and their generations! 🌾💪
 */

import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';

export interface SearchLocation {
  lat: number;
  lng: number;
  name: string;
  bbox?: [number, number, number, number];
  place_type?: string[];
  relevance?: number;
}

export interface NavigationOptions {
  center: [number, number];
  zoom?: number;
  bearing?: number;
  pitch?: number;
  duration?: number;
  essential?: boolean;
}

export interface NavigationState {
  isNavigating: boolean;
  currentAnimation?: any;
  destination?: SearchLocation;
  startTime?: number;
  duration?: number;
}

/**
 * 🎯 INFINITY IQ NAVIGATION ENGINE
 * The brain that powers dynamic map navigation
 */
export class MapNavigationEngine {
  private map: mapboxgl.Map | null = null;
  private navigationState: NavigationState = { isNavigating: false };
  private abortController: AbortController | null = null;

  // 🔥 NAVIGATION CONFIGURATIONS - OPTIMIZED FOR EVERY SCENARIO
  private static readonly NAVIGATION_CONFIGS = {
    default: {
      zoom: 15,
      duration: 1500,
      essential: true,
      easing: (t: number) => t * (2 - t) // easeOutQuad for smooth animation
    },
    city: {
      zoom: 12,
      duration: 2000,
      essential: true
    },
    country: {
      zoom: 6,
      duration: 2500,
      essential: true
    },
    address: {
      zoom: 17,
      duration: 1200,
      essential: true
    },
    locality: {
      zoom: 14,
      duration: 1800,
      essential: true
    },
    poi: {
      zoom: 16,
      duration: 1400,
      essential: true
    }
  };

  constructor(mapInstance: mapboxgl.Map) {
    this.map = mapInstance;
    console.log('🚀 [NavigationEngine] INFINITY GOD MODE ACTIVATED');
  }

  /**
   * 🎯 FLY TO LOCATION - THE CORE MAGIC
   * Automatically navigates to any location with intelligent parameters
   */
  async flyToLocation(location: SearchLocation, customOptions?: Partial<NavigationOptions>): Promise<void> {
    if (!this.map || !this.isValidCoordinates(location.lat, location.lng)) {
      throw new Error('Invalid map instance or coordinates');
    }

    // Cancel any ongoing navigation
    this.cancelCurrentNavigation();

    // Calculate optimal navigation parameters
    const navigationOptions = this.calculateOptimalView(location);
    
    // Merge with custom options if provided
    const finalOptions = { ...navigationOptions, ...customOptions };

    // Set navigation state
    this.navigationState = {
      isNavigating: true,
      destination: location,
      startTime: Date.now(),
      duration: finalOptions.duration
    };

    console.log(`🎯 [NavigationEngine] Flying to: ${location.name}`, finalOptions);

    return new Promise((resolve, reject) => {
      try {
        // Create abort controller for this navigation
        this.abortController = new AbortController();

        // Execute the flyTo animation
        this.map!.flyTo({
          center: finalOptions.center,
          zoom: finalOptions.zoom,
          bearing: finalOptions.bearing || 0,
          pitch: finalOptions.pitch || 0,
          duration: finalOptions.duration,
          essential: finalOptions.essential,
          easing: MapNavigationEngine.NAVIGATION_CONFIGS.default.easing
        });

        // Handle navigation completion
        const handleMoveEnd = () => {
          if (this.abortController?.signal.aborted) {
            reject(new Error('Navigation cancelled'));
            return;
          }

          this.navigationState.isNavigating = false;
          this.map!.off('moveend', handleMoveEnd);
          
          console.log(`✅ [NavigationEngine] Successfully navigated to: ${location.name}`);
          
          // Show success toast
          toast.success('Location found!', {
            description: `Navigated to ${location.name}`,
            duration: 2000
          });

          resolve();
        };

        // Handle navigation error
        const handleError = (error: any) => {
          this.navigationState.isNavigating = false;
          this.map!.off('moveend', handleMoveEnd);
          this.map!.off('error', handleError);
          
          console.error('❌ [NavigationEngine] Navigation failed:', error);
          reject(error);
        };

        // Attach event listeners
        this.map!.once('moveend', handleMoveEnd);
        this.map!.once('error', handleError);

        // Set timeout as fallback
        setTimeout(() => {
          if (this.navigationState.isNavigating) {
            this.navigationState.isNavigating = false;
            resolve(); // Resolve even if timeout, as flyTo might have completed
          }
        }, (finalOptions.duration || 1500) + 500);

      } catch (error) {
        this.navigationState.isNavigating = false;
        console.error('❌ [NavigationEngine] FlyTo execution failed:', error);
        reject(error);
      }
    });
  }

  /**
   * 🧠 CALCULATE OPTIMAL VIEW - INFINITY IQ LOGIC
   * Determines the best zoom, duration, and parameters for each location type
   */
  calculateOptimalView(location: SearchLocation): NavigationOptions {
    const placeTypes = location.place_type || [];
    let config = MapNavigationEngine.NAVIGATION_CONFIGS.default;

    // 🎯 INTELLIGENT ZOOM CALCULATION
    if (placeTypes.includes('address')) {
      config = MapNavigationEngine.NAVIGATION_CONFIGS.address;
    } else if (placeTypes.includes('poi')) {
      config = MapNavigationEngine.NAVIGATION_CONFIGS.poi;
    } else if (placeTypes.includes('locality') || placeTypes.includes('neighborhood')) {
      config = MapNavigationEngine.NAVIGATION_CONFIGS.locality;
    } else if (placeTypes.includes('place')) {
      config = MapNavigationEngine.NAVIGATION_CONFIGS.city;
    } else if (placeTypes.includes('region')) {
      config = { ...MapNavigationEngine.NAVIGATION_CONFIGS.default, zoom: 8, duration: 2200 };
    } else if (placeTypes.includes('country')) {
      config = MapNavigationEngine.NAVIGATION_CONFIGS.country;
    }

    // 🎯 OPTIMAL BEARING CALCULATION
    const bearing = this.calculateOptimalBearing(location);

    return {
      center: [location.lng, location.lat],
      zoom: config.zoom,
      bearing,
      pitch: 0, // Keep flat for agricultural use
      duration: config.duration,
      essential: config.essential
    };
  }

  /**
   * 🧭 CALCULATE OPTIMAL BEARING
   * For agricultural areas, prefer north-up orientation for better field visibility
   */
  private calculateOptimalBearing(location: SearchLocation): number {
    const placeTypes = location.place_type || [];
    
    // For agricultural/rural areas, always use north-up (0 degrees)
    if (placeTypes.includes('locality') || placeTypes.includes('place')) {
      return 0;
    }
    
    // For urban areas, could be enhanced with street orientation data
    // For now, default to north-up for consistency
    return 0;
  }

  /**
   * 🛑 CANCEL CURRENT NAVIGATION
   * Stops any ongoing animation and cleans up resources
   */
  cancelCurrentNavigation(): void {
    if (this.navigationState.isNavigating) {
      console.log('🛑 [NavigationEngine] Cancelling current navigation');
      
      // Abort any ongoing operations
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }

      // Stop the map animation
      if (this.map) {
        this.map.stop();
      }

      this.navigationState.isNavigating = false;
    }
  }

  /**
   * 📍 VALIDATE COORDINATES
   * Ensures coordinates are valid before navigation
   */
  private isValidCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  /**
   * 📊 GET NAVIGATION STATE
   * Returns current navigation status
   */
  getNavigationState(): NavigationState {
    return { ...this.navigationState };
  }

  /**
   * ❓ IS NAVIGATING
   * Quick check if navigation is in progress
   */
  isNavigating(): boolean {
    return this.navigationState.isNavigating;
  }

  /**
   * 🧹 CLEANUP
   * Properly cleanup resources when component unmounts
   */
  cleanup(): void {
    this.cancelCurrentNavigation();
    this.map = null;
    console.log('🧹 [NavigationEngine] Cleanup completed');
  }
}

/**
 * 🎯 MARKER MANAGER - HANDLES ALL MAP MARKERS
 * Manages location markers with precision and style
 */
export class MarkerManager {
  private map: mapboxgl.Map | null = null;
  private markers: Map<string, mapboxgl.Marker> = new Map();
  private locationMarker: mapboxgl.Marker | null = null;
  private temporaryMarkers: mapboxgl.Marker[] = [];

  constructor(mapInstance: mapboxgl.Map) {
    this.map = mapInstance;
    console.log('📍 [MarkerManager] INFINITY MARKER SYSTEM ACTIVATED');
  }

  /**
   * 📍 ADD LOCATION MARKER
   * Creates a beautiful, styled marker for search results
   */
  addLocationMarker(location: SearchLocation): mapboxgl.Marker {
    if (!this.map) {
      throw new Error('Map instance not available');
    }

    // Remove existing location marker
    this.removeLocationMarker();

    // Create new marker with custom styling
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-location-marker';
    markerElement.innerHTML = `
      <div class="marker-pin">
        <div class="marker-icon">📍</div>
      </div>
      <div class="marker-pulse"></div>
    `;

    // Add custom CSS for the marker
    const style = document.createElement('style');
    style.textContent = `
      .custom-location-marker {
        position: relative;
        cursor: pointer;
      }
      .marker-pin {
        width: 30px;
        height: 30px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      }
      .marker-icon {
        transform: rotate(45deg);
        font-size: 16px;
        color: white;
      }
      .marker-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40px;
        height: 40px;
        background: rgba(76, 175, 80, 0.3);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Create and add marker
    this.locationMarker = new mapboxgl.Marker(markerElement)
      .setLngLat([location.lng, location.lat])
      .addTo(this.map);

    // Add popup with location info
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="location-popup">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${location.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            📍 ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
          </p>
        </div>
      `);

    this.locationMarker.setPopup(popup);

    console.log(`📍 [MarkerManager] Location marker added: ${location.name}`);
    return this.locationMarker;
  }

  /**
   * 🗑️ REMOVE LOCATION MARKER
   * Cleanly removes the current location marker
   */
  removeLocationMarker(): void {
    if (this.locationMarker) {
      this.locationMarker.remove();
      this.locationMarker = null;
      console.log('🗑️ [MarkerManager] Location marker removed');
    }
  }

  /**
   * ⏰ ADD TEMPORARY MARKER
   * Creates a temporary marker that auto-removes after specified duration
   */
  addTemporaryMarker(location: SearchLocation, duration: number = 3000): void {
    if (!this.map) return;

    const tempMarker = new mapboxgl.Marker({ color: '#FF9800' })
      .setLngLat([location.lng, location.lat])
      .addTo(this.map);

    this.temporaryMarkers.push(tempMarker);

    // Auto-remove after duration
    setTimeout(() => {
      const index = this.temporaryMarkers.indexOf(tempMarker);
      if (index > -1) {
        tempMarker.remove();
        this.temporaryMarkers.splice(index, 1);
      }
    }, duration);
  }

  /**
   * 🧹 CLEAR ALL MARKERS
   * Removes all markers from the map
   */
  clearAllMarkers(): void {
    // Remove location marker
    this.removeLocationMarker();

    // Remove all temporary markers
    this.temporaryMarkers.forEach(marker => marker.remove());
    this.temporaryMarkers = [];

    // Clear markers map
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    console.log('🧹 [MarkerManager] All markers cleared');
  }

  /**
   * 📊 GET ACTIVE MARKERS
   * Returns array of all active markers
   */
  getActiveMarkers(): mapboxgl.Marker[] {
    const active: mapboxgl.Marker[] = [];
    
    if (this.locationMarker) active.push(this.locationMarker);
    active.push(...this.temporaryMarkers);
    active.push(...Array.from(this.markers.values()));

    return active;
  }

  /**
   * 🧹 CLEANUP
   * Properly cleanup all markers and resources
   */
  cleanup(): void {
    this.clearAllMarkers();
    this.map = null;
    console.log('🧹 [MarkerManager] Cleanup completed');
  }
}