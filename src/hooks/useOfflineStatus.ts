/**
 * 🌐 OFFLINE STATUS HOOK - Production Ready
 * Network status monitoring for rural connectivity
 */

import { useState, useEffect } from 'react';

interface OfflineStatusConfig {
  status: 'online' | 'offline' | 'reconnected';
  text: string;
  color: string;
  glow: string;
}

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  const statusConfig: OfflineStatusConfig = {
    status: isOnline ? (wasOffline ? 'reconnected' : 'online') : 'offline',
    text: isOnline ? (wasOffline ? 'Reconnected' : 'Online') : 'Offline',
    color: isOnline ? 'bg-green-500' : 'bg-red-500',
    glow: isOnline ? 'shadow-green-500/50' : 'shadow-red-500/50'
  };

  const clearOfflineFlag = () => {
    setWasOffline(false);
  };

  return {
    isOnline,
    statusConfig,
    clearOfflineFlag
  };
};