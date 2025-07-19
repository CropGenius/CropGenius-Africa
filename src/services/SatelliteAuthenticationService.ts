/**
 * 🛰️ SATELLITE AUTHENTICATION SERVICE - PRODUCTION GRADE
 * Handles authentication for all satellite data sources with comprehensive error handling
 */

import { getSentinelHubAuthenticatedFetch, isSentinelHubAuthConfigured } from '@/utils/sentinelHubAuth';

export interface AuthenticationStatus {
  sentinelHub: {
    configured: boolean;
    authenticated: boolean;
    error?: string;
    lastCheck: string;
  };
  nasaModis: {
    available: boolean;
    lastCheck: string;
  };
  landsat: {
    available: boolean;
    lastCheck: string;
  };
}

export class SatelliteAuthenticationService {
  private static instance: SatelliteAuthenticationService;
  private authStatus: AuthenticationStatus;

  private constructor() {
    this.authStatus = {
      sentinelHub: {
        configured: false,
        authenticated: false,
        lastCheck: new Date().toISOString()
      },
      nasaModis: {
        available: true, // NASA MODIS is publicly available
        lastCheck: new Date().toISOString()
      },
      landsat: {
        available: true, // Landsat fallback is always available
        lastCheck: new Date().toISOString()
      }
    };
  }

  static getInstance(): SatelliteAuthenticationService {
    if (!this.instance) {
      this.instance = new SatelliteAuthenticationService();
    }
    return this.instance;
  }

  /**
   * Check authentication status for all satellite services
   */
  async checkAuthenticationStatus(): Promise<AuthenticationStatus> {
    console.log('🔐 Checking satellite authentication status...');

    // Check Sentinel Hub
    await this.checkSentinelHubAuth();
    
    // Check NASA MODIS (always available)
    this.authStatus.nasaModis = {
      available: true,
      lastCheck: new Date().toISOString()
    };

    // Check Landsat (always available as fallback)
    this.authStatus.landsat = {
      available: true,
      lastCheck: new Date().toISOString()
    };

    return this.authStatus;
  }

  /**
   * Test Sentinel Hub authentication
   */
  private async checkSentinelHubAuth(): Promise<void> {
    const configured = isSentinelHubAuthConfigured();
    
    this.authStatus.sentinelHub = {
      configured,
      authenticated: false,
      lastCheck: new Date().toISOString()
    };

    if (!configured) {
      this.authStatus.sentinelHub.error = 'Sentinel Hub credentials not configured';
      console.warn('⚠️ Sentinel Hub credentials not configured');
      return;
    }

    try {
      // Test authentication by making a simple API call
      const authenticatedFetch = getSentinelHubAuthenticatedFetch();
      
      // Test with a simple configuration request
      const response = await authenticatedFetch('https://services.sentinel-hub.com/configuration/v1/wms/instances', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.authStatus.sentinelHub.authenticated = true;
        console.log('✅ Sentinel Hub authentication successful');
      } else {
        const errorText = await response.text();
        this.authStatus.sentinelHub.error = `Authentication failed: ${response.status} - ${errorText}`;
        console.error('❌ Sentinel Hub authentication failed:', response.status, errorText);
      }
    } catch (error) {
      this.authStatus.sentinelHub.error = error instanceof Error ? error.message : 'Unknown authentication error';
      console.error('❌ Sentinel Hub authentication error:', error);
    }
  }

  /**
   * Get current authentication status
   */
  getAuthStatus(): AuthenticationStatus {
    return this.authStatus;
  }

  /**
   * Get the best available data source based on authentication status
   */
  getBestDataSource(): 'sentinel' | 'modis' | 'landsat' {
    if (this.authStatus.sentinelHub.configured && this.authStatus.sentinelHub.authenticated) {
      return 'sentinel';
    }
    
    if (this.authStatus.nasaModis.available) {
      return 'modis';
    }
    
    return 'landsat';
  }

  /**
   * Test NASA MODIS API availability
   */
  async testNASAMODIS(): Promise<boolean> {
    try {
      // Test with a simple MODIS API call
      const testUrl = 'https://modis.ornl.gov/rst/api/v1/MOD13Q1/subset?latitude=0&longitude=0&startDate=A2024001&endDate=A2024002&kmAboveBelow=0&kmLeftRight=0';
      
      const response = await fetch(testUrl);
      const available = response.ok;
      
      this.authStatus.nasaModis = {
        available,
        lastCheck: new Date().toISOString()
      };

      if (available) {
        console.log('✅ NASA MODIS API is available');
      } else {
        console.warn('⚠️ NASA MODIS API test failed:', response.status);
      }

      return available;
    } catch (error) {
      console.error('❌ NASA MODIS API test error:', error);
      this.authStatus.nasaModis = {
        available: false,
        lastCheck: new Date().toISOString()
      };
      return false;
    }
  }

  /**
   * Get authentication summary for debugging
   */
  getAuthSummary(): string {
    const status = this.authStatus;
    const summary = [
      `🛰️ Satellite Authentication Status:`,
      `  Sentinel Hub: ${status.sentinelHub.configured ? '✅ Configured' : '❌ Not Configured'} | ${status.sentinelHub.authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}`,
      `  NASA MODIS: ${status.nasaModis.available ? '✅ Available' : '❌ Unavailable'}`,
      `  Landsat: ${status.landsat.available ? '✅ Available' : '❌ Unavailable'}`,
      `  Best Source: ${this.getBestDataSource().toUpperCase()}`,
    ];

    if (status.sentinelHub.error) {
      summary.push(`  Sentinel Error: ${status.sentinelHub.error}`);
    }

    return summary.join('\n');
  }
}

/**
 * Initialize and test satellite authentication on app startup
 */
export async function initializeSatelliteAuthentication(): Promise<AuthenticationStatus> {
  console.log('🚀 Initializing satellite authentication...');
  
  const authService = SatelliteAuthenticationService.getInstance();
  const status = await authService.checkAuthenticationStatus();
  
  // Test NASA MODIS as backup
  await authService.testNASAMODIS();
  
  console.log(authService.getAuthSummary());
  
  return status;
}

/**
 * Get singleton instance
 */
export function getSatelliteAuthService(): SatelliteAuthenticationService {
  return SatelliteAuthenticationService.getInstance();
}