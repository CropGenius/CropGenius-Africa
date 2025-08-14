// Utility functions for service worker support and management
// The main registration logic has been moved to src/utils/serviceWorker.ts

export const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function checkServiceWorkerSupport(): boolean {
  return 'serviceWorker' in navigator;
}

// REMOVED: Broken registerServiceWorker function that was causing hash routing issues
// This function was force-unregistering all service workers and never actually registering anything
// The new minimal implementation will be in src/utils/serviceWorker.ts

export async function unregisterServiceWorker(): Promise<boolean> {
  if (!checkServiceWorkerSupport()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.unregister();
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
    return false;
  }
}

export async function checkForServiceWorkerUpdate(): Promise<ServiceWorkerRegistration | null> {
  if (!checkServiceWorkerSupport()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    // The update() method returns void, so we'll return the registration instead
    await registration.update();
    return registration;
  } catch (error) {
    console.error('Failed to check for service worker update:', error);
    return null;
  }
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!checkServiceWorkerSupport()) return null;

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
}
