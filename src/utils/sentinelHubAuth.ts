/**
 * 🛰️ SENTINEL HUB AUTHENTICATION - PRODUCTION SATELLITE ACCESS
 * Handles authentication and API access for Sentinel Hub satellite data
 * INFINITY IQ DESIGN - Secure, cached, production-ready
 */

let authToken: string | null = null;
let tokenExpiry: Date | null = null;
let isInitialized = false;

/**
 * INITIALIZE SENTINEL HUB AUTH - Setup authentication
 */
export async function initializeSentinelHubAuth(): Promise<void> {
  try {
    // Check if credentials are available
    const clientId = import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.warn('⚠️ Sentinel Hub credentials not configured - using fallback satellite services');
      isInitialized = false;
      return;
    }

    // Get OAuth token
    const tokenResponse = await fetch('https://services.sentinel-hub.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Sentinel Hub auth failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    authToken = tokenData.access_token;
    tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000) - 60000); // 1 minute buffer
    isInitialized = true;

    console.log('✅ Sentinel Hub authentication initialized');
  } catch (error) {
    console.warn('Sentinel Hub auth initialization failed:', error.message);
    isInitialized = false;
  }
}

/**
 * IS SENTINEL HUB AUTH CONFIGURED - Check if auth is available
 */
export function isSentinelHubAuthConfigured(): boolean {
  return isInitialized && authToken !== null && tokenExpiry !== null && tokenExpiry > new Date();
}

/**
 * GET AUTHENTICATED FETCH - Returns fetch function with auth headers
 */
export function getSentinelHubAuthenticatedFetch(): typeof fetch {
  if (!isSentinelHubAuthConfigured()) {
    throw new Error('Sentinel Hub auth not initialized. Call initializeSentinelHubAuth() first.');
  }

  return async (url: string | URL | Request, init?: RequestInit) => {
    const headers = {
      ...init?.headers,
      'Authorization': `Bearer ${authToken}`,
    };

    return fetch(url, {
      ...init,
      headers,
    });
  };
}

/**
 * REFRESH TOKEN IF NEEDED - Automatic token refresh
 */
export async function refreshTokenIfNeeded(): Promise<void> {
  if (!tokenExpiry || tokenExpiry <= new Date()) {
    await initializeSentinelHubAuth();
  }
}

/**
 * GET AUTH STATUS - Current authentication status
 */
export function getAuthStatus(): {
  isInitialized: boolean;
  hasToken: boolean;
  tokenExpiry: Date | null;
  timeUntilExpiry: number | null;
} {
  return {
    isInitialized,
    hasToken: authToken !== null,
    tokenExpiry,
    timeUntilExpiry: tokenExpiry ? tokenExpiry.getTime() - Date.now() : null,
  };
}