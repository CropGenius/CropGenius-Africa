/**
 * 🌍 CROPGENIUS REVERSE GEOCODING SERVICE - INFINITY GRADE
 * -------------------------------------------------------------
 * Real reverse geocoding service to determine country/region from GPS coordinates
 * Provides accurate location context for crop disease diagnosis
 * Supports offline fallback for areas with poor connectivity
 */

export interface LocationDetails {
  country: string;
  region: string;
  city?: string;
  countryCode: string;
  timezone?: string;
}

export class ReverseGeocodingService {
  private static readonly CACHE_KEY = 'cropgenius_location_cache';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static cache = new Map<string, { data: LocationDetails; timestamp: number }>();

  /**
   * Get location details from GPS coordinates with caching
   */
  static async getLocationDetails(lat: number, lng: number): Promise<LocationDetails> {
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Try multiple geocoding services for reliability
      let locationDetails = await this.tryNominatimGeocoding(lat, lng);
      
      if (!locationDetails) {
        locationDetails = await this.tryBigDataCloudGeocoding(lat, lng);
      }
      
      if (!locationDetails) {
        locationDetails = this.getFallbackLocation(lat, lng);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: locationDetails,
        timestamp: Date.now()
      });

      return locationDetails;
    } catch (error) {
      console.warn('Reverse geocoding failed, using fallback:', error);
      return this.getFallbackLocation(lat, lng);
    }
  }

  /**
   * Try Nominatim (OpenStreetMap) reverse geocoding - free and reliable
   */
  private static async tryNominatimGeocoding(lat: number, lng: number): Promise<LocationDetails | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'CropGenius-Agricultural-App/1.0'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.address) {
        return {
          country: data.address.country || 'Unknown',
          region: data.address.state || data.address.region || data.address.county || 'Unknown',
          city: data.address.city || data.address.town || data.address.village,
          countryCode: data.address.country_code?.toUpperCase() || 'XX',
          timezone: this.getTimezoneFromCoordinates(lat, lng)
        };
      }

      return null;
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error);
      return null;
    }
  }

  /**
   * Try BigDataCloud reverse geocoding as backup - free tier available
   */
  private static async tryBigDataCloudGeocoding(lat: number, lng: number): Promise<LocationDetails | null> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      return {
        country: data.countryName || 'Unknown',
        region: data.principalSubdivision || data.locality || 'Unknown',
        city: data.city || data.locality,
        countryCode: data.countryCode || 'XX',
        timezone: this.getTimezoneFromCoordinates(lat, lng)
      };
    } catch (error) {
      console.warn('BigDataCloud geocoding failed:', error);
      return null;
    }
  }

  /**
   * Fallback location determination based on coordinate ranges
   */
  private static getFallbackLocation(lat: number, lng: number): LocationDetails {
    // African countries coordinate ranges (approximate)
    const africanRegions = [
      { name: 'Kenya', code: 'KE', latRange: [-4.5, 5.5], lngRange: [33.5, 42] },
      { name: 'Uganda', code: 'UG', latRange: [-1.5, 4.5], lngRange: [29.5, 35.5] },
      { name: 'Tanzania', code: 'TZ', latRange: [-12, -1], lngRange: [29, 41] },
      { name: 'Ethiopia', code: 'ET', latRange: [3, 15], lngRange: [33, 48] },
      { name: 'Nigeria', code: 'NG', latRange: [4, 14], lngRange: [2.5, 15] },
      { name: 'Ghana', code: 'GH', latRange: [4.5, 11.5], lngRange: [-3.5, 1.5] },
      { name: 'Rwanda', code: 'RW', latRange: [-3, -1], lngRange: [28.5, 31] },
      { name: 'Burundi', code: 'BI', latRange: [-4.5, -2.5], lngRange: [28.5, 31] }
    ];

    for (const region of africanRegions) {
      if (lat >= region.latRange[0] && lat <= region.latRange[1] &&
          lng >= region.lngRange[0] && lng <= region.lngRange[1]) {
        return {
          country: region.name,
          region: 'Central Region',
          countryCode: region.code,
          timezone: this.getTimezoneFromCoordinates(lat, lng)
        };
      }
    }

    // Default fallback
    return {
      country: 'Kenya',
      region: 'Central Region',
      countryCode: 'KE',
      timezone: 'Africa/Nairobi'
    };
  }

  /**
   * Get approximate timezone from coordinates
   */
  private static getTimezoneFromCoordinates(lat: number, lng: number): string {
    // Simplified timezone mapping for Africa
    if (lng >= 15 && lng <= 30) return 'Africa/Cairo';
    if (lng >= 30 && lng <= 45) return 'Africa/Nairobi';
    if (lng >= -15 && lng <= 15) return 'Africa/Lagos';
    return 'Africa/Nairobi'; // Default
  }

  /**
   * Clear location cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}