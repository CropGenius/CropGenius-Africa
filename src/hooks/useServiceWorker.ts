// CropGenius Service Worker Hook - MINIMAL IMPLEMENTATION (40 lines max)
import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  updateAvailable: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    updateAvailable: false,
  });

  useEffect(() => {
    if (!state.isSupported || process.env.NODE_ENV !== 'production') return;

    let registration: ServiceWorkerRegistration | null = null;
    
    const handleUpdateFound = () => {
      setState(prev => ({ ...prev, updateAvailable: true }));
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/service-worker.js');
        setState(prev => ({ ...prev, isRegistered: true }));
        registration.addEventListener('updatefound', handleUpdateFound);
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    register();

    // Cleanup function to prevent memory leaks
    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', handleUpdateFound);
      }
    };
  }, [state.isSupported]);

  const applyUpdate = () => window.location.reload();

  return { ...state, applyUpdate };
}