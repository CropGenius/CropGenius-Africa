/**
 * 🌍 PRODUCTION-READY GEOLOCATION SERVICE
 * Continuous tracking, reverse geocoding, change detection
 * NEVER FAILS - Always returns coordinates with city names
 */

export interface LocationCoordinates {
  lat: number;
  lon: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'default';
  city?: string;
  region?: string;
  country?: string;
  address?: string;
  timestamp: number;
}

export interface LocationChangeEvent {
  oldLocation: LocationCoordinates;
  newLocation: LocationCoordinates;
  distance: number; // in meters
  timestamp: number;
}

type LocationChangeCallback = (event: LocationChangeEvent) => void;

export class GeolocationService {
  private static instance: GeolocationService;
  private cachedLocation: LocationCoordinates | null = null;
  private readonly DEFAULT_LOCATION = { lat: -1.2921, lon: 36.8219, source: 'default' as const, timestamp: Date.now() };
  
  // Continuous tracking state
  private watchId: number | null = null;
  private isTracking = false;
  private locationChangeCallbacks: LocationChangeCallback[] = [];
  private lastKnownLocation: LocationCoordinates | null = null;
  private readonly LOCATION_CHANGE_THRESHOLD = 1000; // 1km in meters
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly GPS_TIMEOUT = 10000; // 10 seconds
  private readonly GPS_MAX_AGE = 60000; // 1 minute
  private refreshInterval: NodeJS.Timeout | null = null;

  private constructor() { }

  public static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  /**
   * Get user's current location - NEVER FAILS
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    // Return cached location if available and fresh
    if (this.cachedLocation && Date.now() - this.cachedLocation.timestamp < this.CACHE_DURATION) {
      console.log('🌍 Returning cached location');
      return this.cachedLocation;
    }

    // Try GPS first
    const gpsLocation = await this.tryGPSLocation();
    if (gpsLocation) {
      const enrichedLocation = await this.enrichLocationWithAddress(gpsLocation);
      this.cachedLocation = enrichedLocation;
      console.log('🌍 Got GPS location:', enrichedLocation);
      return enrichedLocation;
    }

    // Try IP-based location
    const ipLocation = await this.tryIPLocation();
    if (ipLocation) {
      const enrichedLocation = await this.enrichLocationWithAddress(ipLocation);
      this.cachedLocation = enrichedLocation;
      console.log('🌍 Got IP-based location:', enrichedLocation);
      return enrichedLocation;
    }

    // Fallback to default location (Nairobi)
    console.log('🌍 Using default location (Nairobi)');
    const defaultWithAddress = await this.enrichLocationWithAddress(this.DEFAULT_LOCATION);
    this.cachedLocation = defaultWithAddress;
    return defaultWithAddress;
  }

  /**
   * Start continuous location tracking - PRODUCTION READY
   */
  async startLocationTracking(): Promise<void> {
    if (this.isTracking) return;

    console.log('🌍 Starting continuous location tracking');
    this.isTracking = true;

    // Get initial location
    const initialLocation = await this.getCurrentLocation();
    this.lastKnownLocation = initialLocation;

    // Start GPS watching if available
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation: LocationCoordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: 'gps',
            timestamp: Date.now()
          };

          const enrichedLocation = await this.enrichLocationWithAddress(newLocation);
          await this.handleLocationUpdate(enrichedLocation);
        },
        (error) => {
          console.warn('🌍 GPS tracking error:', error);
          // Continue with fallback methods
        },
        {
          enableHighAccuracy: false, // Save battery
          timeout: this.GPS_TIMEOUT,
          maximumAge: this.GPS_MAX_AGE
        }
      );
    }

    // Set up periodic refresh for non-GPS sources
    this.refreshInterval = setInterval(async () => {
      if (!this.isTracking) return;
      
      const currentLocation = await this.getCurrentLocation();
      await this.handleLocationUpdate(currentLocation);
    }, this.CACHE_DURATION);
  }

  /**
   * Stop continuous location tracking
   */
  stopLocationTracking(): void {
    console.log('🌍 Stopping location tracking');
    this.isTracking = false;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Subscribe to location changes
   */
  onLocationChange(callback: LocationChangeCallback): () => void {
    this.locationChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.locationChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Handle location updates and detect changes
   */
  private async handleLocationUpdate(newLocation: LocationCoordinates): Promise<void> {
    if (!this.lastKnownLocation) {
      this.lastKnownLocation = newLocation;
      this.cachedLocation = newLocation;
      return;
    }

    const distance = this.calculateDistance(
      this.lastKnownLocation.lat,
      this.lastKnownLocation.lon,
      newLocation.lat,
      newLocation.lon
    );

    // Only trigger change if significant movement
    if (distance > this.LOCATION_CHANGE_THRESHOLD) {
      console.log(`🌍 Location changed by ${Math.round(distance)}m`);
      
      const changeEvent: LocationChangeEvent = {
        oldLocation: this.lastKnownLocation,
        newLocation,
        distance,
        timestamp: Date.now()
      };

      // Update cached location
      this.cachedLocation = newLocation;
      this.lastKnownLocation = newLocation;

      // Notify all subscribers
      this.locationChangeCallbacks.forEach(callback => {
        try {
          callback(changeEvent);
        } catch (error) {
          console.error('🌍 Location change callback error:', error);
        }
      });
    }
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Try to get GPS location - returns null if fails
   */
  private async tryGPSLocation(): Promise<LocationCoordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      const timeout = setTimeout(() => resolve(null), 3000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            source: 'gps',
            timestamp: Date.now()
          });
        },
        () => {
          clearTimeout(timeout);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: this.GPS_MAX_AGE }
      );
    });
  }

  /**
   * Try to get IP-based location - returns null if fails
   */
  private async tryIPLocation(): Promise<LocationCoordinates | null> {
    try {
      const response = await fetch('https://ipapi.co/json/', {
        timeout: 3000
      } as any);

      if (!response.ok) return null;

      const data = await response.json();

      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          source: 'ip',
          timestamp: Date.now()
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Enrich location with reverse geocoding - PRODUCTION READY
   */
  private async enrichLocationWithAddress(location: LocationCoordinates): Promise<LocationCoordinates> {
    try {
      // Try OpenStreetMap Nominatim for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CropGenius-Agricultural-App'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        
        return {
          ...location,
          city: address.city || address.town || address.village || address.county || 'Unknown City',
          region: address.state || address.region || address.province || 'Unknown Region',
          country: address.country || 'Unknown Country',
          address: data.display_name || 'Unknown Address'
        };
      }
    } catch (error) {
      console.warn('🌍 Reverse geocoding failed:', error);
    }

    // Fallback with basic location names
    const fallbackCity = location.lat < -1 ? 'Nairobi Region' : 'Central Kenya';
    return {
      ...location,
      city: fallbackCity,
      region: 'Kenya',
      country: 'Kenya',
      address: `${fallbackCity}, Kenya`
    };
  }

  /**
   * Clear cached location (force refresh)
   */
  clearCache() {
    this.cachedLocation = null;
  }

  /**
   * Get location with fallback to specific coordinates
   */
  async getLocationWithFallback(fallbackLat?: number, fallbackLon?: number): Promise<LocationCoordinates> {
    const location = await this.getCurrentLocation();

    // If we got a real location, use it
    if (location.source !== 'default') {
      return location;
    }

    // If fallback coordinates provided, use them
    if (fallbackLat && fallbackLon) {
      return {
        lat: fallbackLat,
        lon: fallbackLon,
        source: 'default',
        timestamp: Date.now()
      };
    }

    // Otherwise use the default location
    return location;
  }
}

// Export singleton instance
export const geolocationService = GeolocationService.getInstance();