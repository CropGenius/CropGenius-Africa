/**
 * 🚀 CROPGENIUS SERVICE WORKER REGISTRATION
 * Production-ready PWA service worker for offline capabilities
 */

interface ServiceWorkerConfig {
  serviceWorkerUrl: string;
  debug?: boolean;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export const register = (config: ServiceWorkerConfig) => {
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(config.serviceWorkerUrl)
        .then((registration) => {
          if (config.debug) {
            console.log('🔥 [SW] Registered successfully:', registration);
          }
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  config.onUpdate?.(registration);
                }
              });
            }
          });
          
          config.onSuccess?.(registration);
        })
        .catch((error) => {
          if (config.debug) {
            console.error('🚨 [SW] Registration failed:', error);
          }
          config.onError?.(error);
        });
    });
  }
};

export const unregister = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Service worker unregistration failed:', error);
      });
  }
};