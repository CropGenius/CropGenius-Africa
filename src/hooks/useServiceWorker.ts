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

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        setState(prev => ({ ...prev, isRegistered: true }));
        registration.addEventListener('updatefound', () => {
          setState(prev => ({ ...prev, updateAvailable: true }));
        });
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    register();
  }, [state.isSupported]);

  const applyUpdate = () => window.location.reload();

  return { ...state, applyUpdate };
}